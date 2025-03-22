// src/app/api/nft/mint/route.js
import { mintStudentIdNFT } from '@/lib/xrpl/nft';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

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
      return Response.json(
        errorResponse("학생 정보와 수신자 주소는 필수입니다.", 400),
        { status: 400 }
      );
    }
    
    const { studentInfo, receiverAddress } = requestData;
    
    // 학생 정보 필수 필드 검증
    const requiredFields = ['name', 'school', 'studentId'];
    for (const field of requiredFields) {
      if (!studentInfo[field]) {
        return Response.json(
          errorResponse(`학생 정보에 ${field} 필드가 누락되었습니다.`, 400),
          { status: 400 }
        );
      }
    }
    
    // NFT 발행
    const result = await mintStudentIdNFT(studentInfo, receiverAddress);
    
    // 성공 응답 반환
    return Response.json(
      successResponse(result, "학생증 NFT가 성공적으로 발행되었습니다.", 201)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/nft/mint
 * POST 메소드만 허용하도록 메서드 제한
 */
export async function GET() {
  return Response.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}