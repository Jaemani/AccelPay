// app/api/payment/send/route.js
import { NextResponse } from 'next/server';
import * as xrpl from 'xrpl';
import { getClient } from '@/lib/xrpl/client';

/**
 * XRP를 사용하여 결제를 처리합니다.
 * 
 * @param {string} senderSeed - 송금자의 시드(비밀키)
 * @param {string} destinationAddress - 수신자의 지갑 주소
 * @param {string|number} amount - 전송할 XRP 금액
 * @param {string} [memo] - 거래에 포함할 메모 (학비 결제 정보 등)
 * @returns {Promise<Object>} 트랜잭션 결과
 */
async function sendXRP(senderSeed, destinationAddress, amount, memo = null) {
  try {
    const client = await getClient();
    const wallet = xrpl.Wallet.fromSeed(senderSeed);
    
    // 트랜잭션 객체 생성
    const payment = {
      TransactionType: "Payment",
      Account: wallet.address,
      Destination: destinationAddress,
      Amount: xrpl.xrpToDrops(amount), // XRP를 drops로 변환
    };
    
    // 메모가 있으면 추가
    if (memo) {
      payment.Memos = [{
        Memo: {
          MemoData: Buffer.from(memo).toString('hex').toUpperCase()
        }
      }];
    }
    
    // 트랜잭션 제출 및 결과 대기
    const paymentResult = await client.submitAndWait(payment, { wallet });
    
    // 트랜잭션 결과 확인
    if (paymentResult.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`결제 실패: ${paymentResult.result.meta.TransactionResult}`);
    }
    
    return {
      success: true,
      transactionHash: paymentResult.result.hash,
      sender: wallet.address,
      receiver: destinationAddress,
      amount: amount,
      timestamp: new Date().toISOString(),
      ledgerIndex: paymentResult.result.ledger_index,
      fee: xrpl.dropsToXrp(paymentResult.result.Fee)
    };
  } catch (error) {
    console.error('XRP 전송 중 오류 발생:', error);
    throw new Error(`XRP 전송 실패: ${error.message}`);
  }
}

/**
 * 학교별 결제 주소를 관리합니다.
 * 실제 서비스에서는 데이터베이스에 저장하는 것이 좋습니다.
 * 해커톤에서는 간단한 구현을 위해 메모리에 저장합니다.
 */
const universityPaymentAddresses = {
  "서울대학교": "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh", // 예시 주소, 실제 서비스에서는 변경 필요
  "연세대학교": "rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv", // 예시 주소
  "고려대학교": "rJb5KsHsDHF1YS5B5DU6QCkH5NsPaKQTcy", // 예시 주소
};

/**
 * 특정 학교의 결제 주소를 가져옵니다.
 * 
 * @param {string} universityName - 학교 이름
 * @returns {string|null} 학교의 결제 주소, 등록되지 않은 경우 null
 */
function getUniversityPaymentAddress(universityName) {
  return universityPaymentAddresses[universityName] || null;
}

/**
 * 학비 결제를 처리합니다.
 * 
 * @param {string} studentSeed - 학생의 시드(비밀키)
 * @param {string} universityName - 결제할 학교 이름
 * @param {Object} paymentInfo - 결제 정보 (학기, 학생 정보 등)
 * @param {string|number} amount - 결제할 XRP 금액
 * @returns {Promise<Object>} 결제 결과
 */
async function processTuitionPayment(studentSeed, universityName, paymentInfo, amount) {
  try {
    // 학교 결제 주소 확인
    const universityAddress = getUniversityPaymentAddress(universityName);
    if (!universityAddress) {
      throw new Error(`등록되지 않은 학교입니다: ${universityName}`);
    }
    
    // 결제 정보를 메모로 추가
    const memo = JSON.stringify({
      type: "tuition_payment",
      university: universityName,
      studentId: paymentInfo.studentId,
      semester: paymentInfo.semester,
      date: new Date().toISOString(),
      description: `${universityName} ${paymentInfo.semester} 학비 결제`
    });
    
    // XRP 전송
    const paymentResult = await sendXRP(studentSeed, universityAddress, amount, memo);
    
    // 결제 결과에 추가 정보 포함
    return {
      ...paymentResult,
      paymentInfo: {
        university: universityName,
        studentId: paymentInfo.studentId,
        semester: paymentInfo.semester,
        description: `${universityName} ${paymentInfo.semester} 학비 결제`
      }
    };
  } catch (error) {
    console.error('학비 결제 중 오류 발생:', error);
    throw new Error(`학비 결제 실패: ${error.message}`);
  }
}

/**
 * POST /api/payment/send
 * XRP를 사용하여 학비 결제를 처리합니다.
 */
export async function POST(request) {
  try {
    // 요청 본문에서 데이터 파싱
    const requestData = await request.json();
    
    // 필수 데이터 검증
    const requiredFields = ['studentSeed', 'universityName', 'amount', 'paymentInfo'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} 필드는 필수입니다.`,
            status: 400
          },
          { status: 400 }
        );
      }
    }
    
    const { studentSeed, universityName, amount, paymentInfo } = requestData;
    
    // 추가 필수 필드 검증 (paymentInfo 내부)
    if (!paymentInfo.studentId || !paymentInfo.semester) {
      return NextResponse.json(
        {
          success: false,
          message: "결제 정보에 학번과 학기 정보가 필요합니다.",
          status: 400
        },
        { status: 400 }
      );
    }
    
    // 학비 결제 처리
    const result = await processTuitionPayment(
      studentSeed, 
      universityName, 
      paymentInfo, 
      amount
    );
    
    // 성공 응답 반환
    return NextResponse.json(
      {
        success: true,
        message: "학비 결제가 성공적으로 처리되었습니다.",
        data: result,
        status: 200
      }
    );
  } catch (error) {
    console.error('API 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || "학비 결제 중 오류가 발생했습니다.",
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/send
 * POST 메소드만 허용하도록 메서드 제한
 */
export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      message: "Method not allowed",
      status: 405 
    },
    { status: 405 }
  );
}