// src/lib/utils/response.js

/**
 * API 응답을 표준화하는 유틸리티 함수들입니다.
 * 모든 API 엔드포인트가 일관된 형식의 응답을 반환하도록 합니다.
 */

/**
 * 성공 응답을 생성합니다.
 * 
 * @param {any} data - 응답에 포함할 데이터
 * @param {string} message - 성공 메시지
 * @param {number} status - HTTP 상태 코드 (기본값: 200)
 * @returns {Object} 표준화된 성공 응답 객체
 */
export function successResponse(data = null, message = "성공적으로 처리되었습니다.", status = 200) {
  return {
    success: true,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * 오류 응답을 생성합니다.
 * 
 * @param {string} message - 오류 메시지
 * @param {number} status - HTTP 상태 코드 (기본값: 400)
 * @param {any} error - 상세 오류 정보 (개발 환경에서만 노출)
 * @returns {Object} 표준화된 오류 응답 객체
 */
export function errorResponse(message = "요청을 처리하는 중 오류가 발생했습니다.", status = 400, error = null) {
  const response = {
    success: false,
    status,
    message,
    timestamp: new Date().toISOString()
  };

  // 개발 환경에서만 상세 오류 정보 포함
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = typeof error === 'object' ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
  }

  return response;
}

/**
 * API 오류를 Next.js Response에 맞게 반환합니다.
 * Next.js API 라우트 핸들러에서 사용됩니다.
 * 
 * @param {Error} error - 발생한 오류 객체
 * @param {number} status - HTTP 상태 코드 (기본값: 400)
 * @returns {Response} Next.js Response 객체
 */
export function handleApiError(error, status = 400) {
  console.error('API 오류:', error);
  
  // 오류 유형에 따라 적절한 상태 코드 설정
  if (error.message.includes('찾을 수 없습니다') || error.message.includes('not found')) {
    status = 404;
  } else if (error.message.includes('권한이 없습니다') || error.message.includes('unauthorized')) {
    status = 401;
  } else if (error.message.includes('금지되었습니다') || error.message.includes('forbidden')) {
    status = 403;
  }
  
  return Response.json(
    errorResponse(error.message, status, error),
    { status }
  );
}

/**
 * 클라이언트에서 사용할 수 있는 API 응답 처리 함수입니다.
 * fetch 응답을 처리하고 결과를 반환합니다.
 * 
 * @param {Response} response - fetch API의 응답 객체
 * @returns {Promise<Object>} 처리된 응답 데이터
 * @throws {Error} 처리 중 발생한 오류
 */
export async function handleFetchResponse(response) {
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || '요청이 실패했습니다.');
  }
  
  return data;
}

/**
 * 클라이언트에서 API 요청 시 발생한 오류를 처리합니다.
 * 
 * @param {Error} error - 발생한 오류 객체
 * @param {Function} setError - 오류 상태를 설정하는 함수 (React 상태 설정 함수)
 * @returns {void}
 */
export function handleClientError(error, setError) {
  console.error('클라이언트 오류:', error);
  
  if (setError && typeof setError === 'function') {
    setError(error.message || '요청 처리 중 오류가 발생했습니다.');
  }
  
  // 여기에 토스트 메시지 표시 등의 추가 처리를 할 수 있습니다
}