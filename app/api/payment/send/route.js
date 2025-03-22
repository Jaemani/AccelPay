// src/app/api/payment/send/route.js
import { processTuitionPayment } from '@/lib/xrpl/payment';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

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
        return Response.json(
          errorResponse(`${field} 필드는 필수입니다.`, 400),
          { status: 400 }
        );
      }
    }
    
    const { studentSeed, universityName, amount, paymentInfo } = requestData;
    
    // 추가 필수 필드 검증 (paymentInfo 내부)
    if (!paymentInfo.studentId || !paymentInfo.semester) {
      return Response.json(
        errorResponse("결제 정보에 학번과 학기 정보가 필요합니다.", 400),
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
    return Response.json(
      successResponse(result, "학비 결제가 성공적으로 처리되었습니다.", 200)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/payment/send
 * POST 메소드만 허용하도록 메서드 제한
 */
export async function GET() {
  return Response.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}