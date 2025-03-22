// app/api/nft/mint/route.js
import { mintStudentIdNFT } from '@/lib/xrpl/nft';
import { NextResponse } from 'next/server';

/**
 * POST /api/nft/mint
 * 학생증 NFT를 발행합니다.
 */
export async function POST(request) {
  try {
    // 요청 본문에서 데이터 파싱
    const requestData = await request.json();
    
    // 필수 데이터 검증
    if (!requestData.studentInfo || !requestData.receiverAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "학생 정보와 수신자 주소는 필수입니다.",
          status: 400
        },
        { status: 400 }
      );
    }
    
    const { studentInfo, receiverAddress } = requestData;
    
    // 학생 정보 필수 필드 검증
    const requiredFields = ['name', 'school', 'studentId'];
    for (const field of requiredFields) {
      if (!studentInfo[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `학생 정보에 ${field} 필드가 누락되었습니다.`,
            status: 400
          },
          { status: 400 }
        );
      }
    }
    
    // NFT 발행
    const result = await mintStudentIdNFT(studentInfo, receiverAddress);
    
    // 성공 응답 반환
    return NextResponse.json(
      {
        success: true,
        message: "학생증 NFT가 성공적으로 발행되었습니다.",
        data: result,
        status: 201
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('NFT 발행 중 오류 발생:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || "학생증 NFT 발행 중 오류가 발생했습니다.",
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/nft/mint
 * 메서드 제한을 위한 핸들러
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