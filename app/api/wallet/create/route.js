// src/app/api/wallet/create/route.js
import { createWallet } from '@/lib/xrpl/wallet';
import { successResponse, handleApiError } from '@/lib/utils/response';

/**
 * POST /api/wallet/create
 * 새로운 XRP 지갑을 생성하고 테스트넷 Faucet으로부터 초기 자금을 받습니다.
 */
export async function POST() {
  try {
    // 새 지갑 생성
    const wallet = await createWallet();
    
    // 성공 응답 반환
    return Response.json(
      successResponse(wallet, "새 지갑이 성공적으로 생성되었습니다.", 201)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/wallet/create
 * POST 메소드만 허용하도록 메서드 제한
 */
export async function GET() {
  return Response.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}