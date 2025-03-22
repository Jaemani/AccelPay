// lib/xrpl/nft.js
import * as xrpl from 'xrpl';
import { getClient } from './client';

/**
 * NFT 발행 시 사용할 발행자 지갑을 가져오거나 생성합니다.
 * 
 * @returns {Promise<xrpl.Wallet>} NFT 발행자 지갑
 */
export async function getNFTIssuerWallet() {
  try {
    // 환경 변수에서 NFT 발행 지갑 시드 확인
    const issuerSeed = process.env.NFT_ISSUER_SEED;
    
    // 시드가 있으면 기존 지갑 복구
    if (issuerSeed) {
      return xrpl.Wallet.fromSeed(issuerSeed);
    }
    
    // 시드가 없으면 새 지갑 생성
    const client = await getClient();
    const fundResult = await client.fundWallet();
    console.log('새 NFT 발행 지갑 생성됨:', fundResult.wallet.address);
    console.log('이 시드를 환경 변수(NFT_ISSUER_SEED)에 설정하세요:', fundResult.wallet.seed);
    
    return fundResult.wallet;
  } catch (error) {
    console.error('NFT 발행 지갑 가져오기 중 오류 발생:', error);
    throw new Error(`NFT 발행 지갑 가져오기 실패: ${error.message}`);
  }
}

/**
 * 학생증 NFT를 발행합니다.
 * 
 * @param {Object} studentInfo - 학생 정보 (이름, 학교, 학번 등)
 * @param {string} receiverAddress - NFT를 받을 학생의 지갑 주소
 * @returns {Promise<Object>} 발행된 NFT 정보
 */
export async function mintStudentIdNFT(studentInfo, receiverAddress) {
  try {
    const client = await getClient();
    const issuerWallet = await getNFTIssuerWallet();
    
    // URI 생성 (실제 서비스에서는 IPFS 등에 메타데이터 저장)
    const metadataJson = JSON.stringify({
      name: `${studentInfo.name} 학생증`,
      description: `${studentInfo.school} - ${studentInfo.studentId}`,
      studentInfo: {
        name: studentInfo.name,
        school: studentInfo.school,
        studentId: studentInfo.studentId,
        department: studentInfo.department || '',
        issueDate: new Date().toISOString(),
      }
    });
    
    // 메타데이터를 16진수로 인코딩
    const uri = Buffer.from(metadataJson).toString('hex').toUpperCase();
    
    // NFT 민팅 트랜잭션 준비
    const mintTx = {
      TransactionType: "NFTokenMint",
      Account: issuerWallet.address,
      URI: uri,
      NFTokenTaxon: 0, // 학생증 유형은 taxon 0으로 지정
      Flags: xrpl.NFTokenMintFlags.tfTransferable, // 전송 가능하도록 설정
      TransferFee: 0, // 양도 시 수수료 없음
      Destination: receiverAddress // 학생 지갑 주소로 직접 발행
    };
    
    // 트랜잭션 제출 및 결과 대기
    const mintTxResult = await client.submitAndWait(mintTx, { wallet: issuerWallet });
    
    // 트랜잭션 결과 확인
    if (mintTxResult.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`NFT 민팅 실패: ${mintTxResult.result.meta.TransactionResult}`);
    }
    
    // 생성된 NFT ID 찾기
    let nftId = null;
    const nodes = mintTxResult.result.meta.AffectedNodes;
    for (const node of nodes) {
      if (node.CreatedNode && node.CreatedNode.LedgerEntryType === "NFTokenPage") {
        const tokenPage = node.CreatedNode.NewFields.NFTokens;
        if (tokenPage && tokenPage.length > 0) {
          nftId = tokenPage[0].NFToken.NFTokenID;
          break;
        }
      }
    }
    
    if (!nftId) {
      throw new Error("NFT ID를 찾을 수 없습니다.");
    }
    
    return {
      success: true,
      nftId: nftId,
      issuer: issuerWallet.address,
      owner: receiverAddress,
      uri: uri,
      studentInfo: studentInfo,
      transactionHash: mintTxResult.result.hash
    };
  } catch (error) {
    console.error('NFT 민팅 중 오류 발생:', error);
    throw new Error(`NFT 민팅 실패: ${error.message}`);
  }
}

/**
 * 계정이 소유한 NFT 목록을 조회합니다.
 * 
 * @param {string} ownerAddress - NFT 소유자의 지갑 주소
 * @returns {Promise<Array>} 소유한 NFT 목록
 */
export async function getAccountNFTs(ownerAddress) {
  try {
    const client = await getClient();
    
    // 계정 NFT 조회 요청
    const response = await client.request({
      command: 'account_nfts',
      account: ownerAddress
    });
    
    // 결과에서 NFT 목록 추출 및 가공
    const nfts = response.result.account_nfts.map(nft => {
      let metadata = {};
      
      // URI가 있으면 디코딩 시도 (16진수 인코딩 가정)
      if (nft.URI) {
        try {
          const decoded = Buffer.from(nft.URI, 'hex').toString();
          try {
            metadata = JSON.parse(decoded);
          } catch (e) {
            console.warn('NFT URI JSON 파싱 실패:', e);
            metadata = { raw: decoded };
          }
        } catch (e) {
          console.warn('NFT URI 디코딩 실패:', e);
          metadata = { raw: nft.URI };
        }
      }
      
      return {
        nftId: nft.NFTokenID,
        issuer: nft.Issuer,
        uri: nft.URI,
        taxon: nft.NFTokenTaxon,
        flags: nft.Flags,
        metadata: metadata
      };
    });
    
    return nfts;
  } catch (error) {
    console.error('NFT 목록 조회 중 오류 발생:', error);
    throw new Error(`NFT 목록 조회 실패: ${error.message}`);
  }
}

/**
 * 특정 NFT의 세부 정보를 조회합니다.
 * 
 * @param {string} nftId - 조회할 NFT ID
 * @returns {Promise<Object>} NFT 세부 정보
 */
export async function getNFTDetails(nftId) {
  try {
    const client = await getClient();
    
    // NFT 정보 조회 요청
    const response = await client.request({
      command: 'nft_info',
      nft_id: nftId
    });
    
    const nft = response.result;
    let metadata = {};
    
    // URI가 있으면 디코딩 시도
    if (nft.uri) {
      try {
        const decoded = Buffer.from(nft.uri, 'hex').toString();
        try {
          metadata = JSON.parse(decoded);
        } catch (e) {
          console.warn('NFT URI JSON 파싱 실패:', e);
          metadata = { raw: decoded };
        }
      } catch (e) {
        console.warn('NFT URI 디코딩 실패:', e);
        metadata = { raw: nft.uri };
      }
    }
    
    return {
      nftId: nft.nft_id,
      issuer: nft.issuer,
      owner: nft.owner,
      uri: nft.uri,
      taxon: nft.nft_taxon,
      flags: nft.flags,
      metadata: metadata,
      serial: nft.serial
    };
  } catch (error) {
    console.error('NFT 세부 정보 조회 중 오류 발생:', error);
    throw new Error(`NFT 세부 정보 조회 실패: ${error.message}`);
  }
}