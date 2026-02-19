/**
 * API 에러 객체를 받아 사용자에게 보여줄 에러 메시지를 생성합니다.
 * @param {any} error - $fetch의 onResponseError 컨텍스트의 response 또는 onError의 error 객체
 * @returns {string} - 사용자 친화적인 에러 메시지
 */
export function generateErrorMessage(error) {
  // onResponseError에서 넘어온 경우 (response 객체)
  if (error && error.status) {
    if (error._data && error._data.message) {
      return error._data.message;
    }
    switch (error.status) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해 주세요.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해 주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청하신 내용을 찾을 수 없습니다.';
      case 500:
        return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      default:
        return `오류가 발생했습니다. (코드: ${error.status})`;
    }
  }

  // onError에서 넘어온 경우 (Error 객체)
  if (error instanceof Error) {
    return '네트워크에 문제가 발생했거나 요청을 처리할 수 없습니다. 다시 시도해 주세요.';
  }

  return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}
