// src/app/api/transaction/[id]/route.js
import { getTransactionDetails } from '@/lib/xrpl/transaction';
import { NextResponse } from 'next/server';

/**
 * GET /api/transaction/[id]
 * 트랜잭션 ID를 사용하여 결제 상태를 조회합니다.
 */
export async function GET(request, { params }) {
  try {
    // URL에서 트랜잭션 ID 추출
    const transactionId = params.id;
    
    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "트랜잭션 ID가 제공되지 않았습니다.",
          status: 400
        },
        { status: 400 }
      );
    }
    
    // 트랜잭션 상태 조회
    const result = await getTransactionDetails(transactionId);
    
    // 성공 응답 반환
    return NextResponse.json(
      {
        success: true,
        message: "트랜잭션 정보를 성공적으로 조회했습니다.",
        data: result,
        status: 200
      }
    );
  } catch (error) {
    console.error('트랜잭션 조회 중 오류 발생:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || "트랜잭션 조회 중 오류가 발생했습니다.",
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transaction/[id]
 * GET 메소드만 허용하도록 메서드 제한
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Method not allowed",
      status: 405
    },
    { status: 405 }
  );
}