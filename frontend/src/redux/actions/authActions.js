import authService from '../../services/authService';

// 인증 관련 액션 타입
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';

export const LOGOUT = 'LOGOUT';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

export const AUTH_ERROR = 'AUTH_ERROR';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

export const USER_LOADED = 'USER_LOADED';
export const LOAD_USER_REQUEST = 'LOAD_USER_REQUEST';
export const LOAD_USER_FAIL = 'LOAD_USER_FAIL';

export const SET_LOADING = 'SET_LOADING';
export const CHECK_AUTH = 'CHECK_AUTH';

// 로딩 상태 설정
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

// 에러 초기화
export const clearErrors = () => ({
  type: CLEAR_ERRORS
});

// 사용자 정보 로드
export const loadUser = () => async (dispatch) => {
  dispatch({ type: LOAD_USER_REQUEST });
  
  try {
    // 토큰이 있는지 확인
    if (!authService.hasToken()) {
      dispatch({ type: LOAD_USER_FAIL });
      return;
    }
    
    // 토큰 검증
    const tokenResult = await authService.verifyToken();
    
    if (tokenResult.valid) {
      dispatch({
        type: USER_LOADED,
        payload: tokenResult.user
      });
    } else {
      // 토큰이 유효하지 않으면 로그아웃 처리
      dispatch({ type: LOAD_USER_FAIL });
      await authService.logout();
    }
  } catch (error) {
    console.error('사용자 로드 에러:', error);
    dispatch({ type: LOAD_USER_FAIL });
    await authService.logout();
  }
};

// 사용자 인증 상태 확인 (기존 호환성을 위해 유지)
export const checkAuth = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    } else {
      dispatch({
        type: CHECK_AUTH,
        payload: { isAuthenticated: false }
      });
    }
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// 회원가입
export const register = (userData) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  
  try {
    const result = await authService.register(userData);
    
    if (result.success) {
      dispatch({
        type: REGISTER_SUCCESS,
        payload: {
          token: result.token,
          user: result.user,
          message: result.message
        }
      });
      
      // 회원가입 성공 후 사용자 정보 로드
      dispatch(loadUser());
      
      return { success: true, message: result.message };
    } else {
      dispatch({
        type: REGISTER_FAIL,
        payload: {
          message: result.message,
          errors: result.errors
        }
      });
      
      return { success: false, message: result.message, errors: result.errors };
    }
  } catch (error) {
    const errorMessage = '회원가입 중 오류가 발생했습니다.';
    dispatch({
      type: REGISTER_FAIL,
      payload: { message: errorMessage }
    });
    
    return { success: false, message: errorMessage };
  }
};

// 로그인
export const login = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  
  try {
    const result = await authService.login(email, password);
    
    if (result.success) {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token: result.token,
          user: result.user,
          message: result.message
        }
      });
      
      // 로그인 성공 후 사용자 정보 로드
      dispatch(loadUser());
      
      return { success: true, message: result.message };
    } else {
      dispatch({
        type: LOGIN_FAIL,
        payload: {
          message: result.message,
          errors: result.errors
        }
      });
      
      return { success: false, message: result.message, errors: result.errors };
    }
  } catch (error) {
    const errorMessage = '로그인 중 오류가 발생했습니다.';
    dispatch({
      type: LOGIN_FAIL,
      payload: { message: errorMessage }
    });
    
    return { success: false, message: errorMessage };
  }
};

// 로그아웃
export const logout = () => async (dispatch) => {
  try {
    await authService.logout();
    dispatch({ type: LOGOUT_SUCCESS });
    
    // 페이지 새로고침이나 리다이렉트는 컴포넌트에서 처리
    return { success: true };
  } catch (error) {
    console.error('로그아웃 에러:', error);
    // 에러가 발생해도 로컬 스토리지는 정리됨
    dispatch({ type: LOGOUT_SUCCESS });
    return { success: true };
  }
};

// 현재 사용자 정보 새로고침
export const refreshUser = () => async (dispatch) => {
  try {
    const result = await authService.getCurrentUser();
    
    if (result.success) {
      dispatch({
        type: USER_LOADED,
        payload: result.user
      });
    } else {
      dispatch({ type: AUTH_ERROR });
    }
  } catch (error) {
    console.error('사용자 정보 새로고침 에러:', error);
    dispatch({ type: AUTH_ERROR });
  }
};

// 안전하지 않은 로그인 (고급 모드)
export const unsafeLogin = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  
  try {
    const result = await authService.unsafeLogin(email, password);
    
    if (result.success) {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token: result.token,
          user: result.user,
          message: result.message
        }
      });
      
      return { success: true, message: result.message };
    } else {
      dispatch({
        type: LOGIN_FAIL,
        payload: {
          message: result.message,
          error: result.error
        }
      });
      
      return { success: false, message: result.message, error: result.error };
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
      payload: { message: '로그인 중 오류가 발생했습니다.' }
    });
    
    return { success: false, message: '로그인 중 오류가 발생했습니다.' };
  }
};

// 시스템 정보 조회 (개발자 모드)
export const getDebugInfo = () => async (dispatch) => {
  try {
    const debugInfo = await authService.getDebugInfo();
    console.log('🔍 시스템 정보:', debugInfo);
    return debugInfo;
  } catch (error) {
    console.error('시스템 정보 조회 실패:', error);
    throw error;
  }
};
