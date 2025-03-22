// src/lib/xrpl/transaction.js
const xrpl = require('xrpl');
const { getClient } = require('./client');

/**
 * 트랜잭션 해시를 사용하여 트랜잭션 정보를 조회합니다.
 * 
 * @param {string} transactionHash - 조회할 트랜잭션 해시
 * @returns {Promise<Object>} 트랜잭션 정보
 */
async function getTransactionDetails(transactionHash) {
  try {
    const client = await getClient();
    
    // 트랜잭션 정보 요청
    const response = await client.request({
      command: 'tx',
      transaction: transactionHash,
      binary: false
    });
    
    // 결과 확인
    if (!response.result || response.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`트랜잭션 조회 실패 또는 실패한 트랜잭션: ${response.result?.meta?.TransactionResult || '알 수 없음'}`);
    }
    
    // 트랜잭션 유형에 따라 추가 정보 파싱
    const txInfo = parseTransactionDetails(response.result);
    
    return {
      success: true,
      transaction: txInfo
    };
  } catch (error) {
    console.error('트랜잭션 조회 중 오류 발생:', error);
    throw new Error(`트랜잭션 조회 실패: ${error.message}`);
  }
}

/**
 * 트랜잭션 유형에 따라 추가 정보를 파싱합니다.
 * 
 * @param {Object} txData - 조회된 트랜잭션 데이터
 * @returns {Object} 파싱된 트랜잭션 정보
 */
function parseTransactionDetails(txData) {
  const baseInfo = {
    hash: txData.hash,
    type: txData.TransactionType,
    account: txData.Account,
    date: xrpl.rippleTimeToISOTime(txData.date),
    fee: xrpl.dropsToXrp(txData.Fee),
    ledgerIndex: txData.ledger_index,
    status: txData.meta.TransactionResult,
    validated: txData.validated || false
  };
  
  // 트랜잭션 메모 파싱
  if (txData.Memos && txData.Memos.length > 0) {
    baseInfo.memos = txData.Memos.map(memo => {
      try {
        const hexData = memo.Memo.MemoData;
        const decodedData = Buffer.from(hexData, 'hex').toString('utf8');
        try {
          return JSON.parse(decodedData); // JSON 파싱 시도
        } catch {
          return decodedData; // 일반 텍스트로 처리
        }
      } catch (error) {
        return { raw: memo.Memo.MemoData }; // 파싱 실패 시 원본 데이터 반환
      }
    });
  }
  
  // 트랜잭션 유형별 추가 정보
  switch (txData.TransactionType) {
    case 'Payment':
      return {
        ...baseInfo,
        destination: txData.Destination,
        amount: txData.Amount.currency 
          ? txData.Amount 
          : xrpl.dropsToXrp(txData.Amount), // XRP 또는 발행 토큰
        deliveredAmount: txData.meta.delivered_amount 
          ? (txData.meta.delivered_amount.currency 
            ? txData.meta.delivered_amount 
            : xrpl.dropsToXrp(txData.meta.delivered_amount))
          : null
      };
    
    case 'NFTokenMint':
      const nftDetails = {
        ...baseInfo,
        taxon: txData.NFTokenTaxon,
        transferFee: txData.TransferFee,
        flags: txData.Flags,
      };
      
      if (txData.URI) {
        nftDetails.uri = txData.URI;
        try {
          const decodedUri = Buffer.from(txData.URI, 'hex').toString('utf8');
          try {
            nftDetails.metadata = JSON.parse(decodedUri);
          } catch {
            nftDetails.decodedUri = decodedUri;
          }
        } catch (error) {
          console.warn('URI 디코딩 실패:', error);
        }
      }
      
      return nftDetails;
    
    // 필요에 따라 다른 트랜잭션 유형 처리 추가
    
    default:
      return baseInfo;
  }
}

/**
 * 계정의 트랜잭션 내역을 조회합니다.
 * 
 * @param {string} accountAddress - 조회할 계정 주소
 * @param {Object} options - 조회 옵션 (limit, marker 등)
 * @returns {Promise<Object>} 트랜잭션 내역
 */
async function getAccountTransactions(accountAddress, options = {}) {
  try {
    const client = await getClient();
    
    // 기본 옵션 설정
    const requestOptions = {
      command: 'account_tx',
      account: accountAddress,
      ledger_index_min: options.ledgerIndexMin || -1,
      ledger_index_max: options.ledgerIndexMax || -1,
      binary: false,
      forward: options.forward || false,
      limit: options.limit || 20
    };
    
    // 페이징을 위한 마커가 있으면 추가
    if (options.marker) {
      requestOptions.marker = options.marker;
    }
    
    // 트랜잭션 내역 요청
    const response = await client.request(requestOptions);
    
    // 트랜잭션 내역 가공
    const transactions = response.result.transactions.map(tx => {
      // tx.tx에 트랜잭션 정보, tx.meta에 메타 정보가 있음
      const txData = { ...tx.tx, meta: tx.meta };
      return parseTransactionDetails(txData);
    });
    
    return {
      success: true,
      transactions: transactions,
      marker: response.result.marker || null, // 페이징을 위한 마커
      hasMore: !!response.result.marker // 더 많은 결과가 있는지 여부
    };
  } catch (error) {
    console.error('계정 트랜잭션 조회 중 오류 발생:', error);
    throw new Error(`계정 트랜잭션 조회 실패: ${error.message}`);
  }
}

/**
 * 결제 트랜잭션의 상태를 확인합니다.
 * 
 * @param {string} transactionHash - 결제 트랜잭션 해시
 * @returns {Promise<Object>} 결제 상태 정보
 */
async function checkPaymentStatus(transactionHash) {
  try {
    const txDetails = await getTransactionDetails(transactionHash);
    
    // 결제 트랜잭션인지 확인
    if (txDetails.transaction.type !== 'Payment') {
      throw new Error('결제 트랜잭션이 아닙니다.');
    }
    
    // 결제 정보 추출
    const paymentInfo = {
      hash: txDetails.transaction.hash,
      sender: txDetails.transaction.account,
      receiver: txDetails.transaction.destination,
      amount: txDetails.transaction.amount,
      deliveredAmount: txDetails.transaction.deliveredAmount,
      fee: txDetails.transaction.fee,
      date: txDetails.transaction.date,
      status: txDetails.transaction.status === 'tesSUCCESS' ? 'Completed' : 'Failed',
      memo: txDetails.transaction.memos && txDetails.transaction.memos.length > 0 
        ? txDetails.transaction.memos[0] 
        : null
    };
    
    // 결제 유형 및 상세 정보 확인 (메모에서 추출)
    if (paymentInfo.memo && typeof paymentInfo.memo === 'object' && paymentInfo.memo.type === 'tuition_payment') {
      paymentInfo.paymentType = 'Tuition';
      paymentInfo.university = paymentInfo.memo.university;
      paymentInfo.studentId = paymentInfo.memo.studentId;
      paymentInfo.semester = paymentInfo.memo.semester;
      paymentInfo.description = paymentInfo.memo.description;
    } else {
      paymentInfo.paymentType = 'General';
    }
    
    return {
      success: true,
      payment: paymentInfo
    };
  } catch (error) {
    console.error('결제 상태 확인 중 오류 발생:', error);
    throw new Error(`결제 상태 확인 실패: ${error.message}`);
  }
}

module.exports = {
  getTransactionDetails,
  getAccountTransactions,
  checkPaymentStatus
};