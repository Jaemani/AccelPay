// src/app/api/transaction/[id]/route.js
import { checkPaymentStatus } from '@/lib/xrpl/transaction';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

/**
 * GET /api/transaction/[id]
 * 트랜잭션 ID를 사용하여 결제 상태를 조회합니다.
 */
export async function GET(request, { params }) {
  try {
    // URL에서 트랜잭션 ID 추출
    const transactionId = params.id;
    
    if (!transactionId) {
      return Response.json(
        errorResponse("트랜잭션 ID가 제공되지 않았습니다.", 400),
        { status: 400 }
      );
    }
    
    // 트랜잭션 상태 조회
    const result = await checkPaymentStatus(transactionId);
    
    // 성공 응답 반환
    return Response.json(
      successResponse(result, "트랜잭션 정보를 성공적으로 조회했습니다.", 200)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/transaction/[id]
 * GET 메소드만 허용하도록 메서드 제한
 */
export async function POST() {
  return Response.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}