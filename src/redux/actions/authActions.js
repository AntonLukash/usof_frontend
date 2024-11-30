import { registerUser, loginUser, getUserProfile as fetchUserProfile } from '../../services/api';

export const register = (userData) => async (dispatch) => {
  try {
    const user = await registerUser(userData);
    
    dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    return user;
  } catch (error) {
    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (error.response) {
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.status === 400) {
        errorMessage = 'Bad Request: Please check your input.';
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please try again later.';
    } else {
      errorMessage = 'Error occurred while setting up the request.';
    }

    dispatch({ type: 'REGISTER_FAIL', payload: errorMessage });
    throw new Error(errorMessage);
  }
};



export const initializeAuth = () => async (dispatch) => {
  const allKeys = Object.keys(localStorage);
  const tokenKey = allKeys.find((key) => key.startsWith("token_"));
  
  if (tokenKey) {
    const login = tokenKey.split("token_")[1];
    const token = localStorage.getItem(tokenKey);
    const userId = localStorage.getItem(`userId_${login}`);

    if (token && userId) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: { token, login, isAuthenticated: true } });
      
      try {
        const userProfile = await fetchUserProfile(userId, token);
        dispatch({ type: 'SET_USER', payload: userProfile.data });
      } catch (error) {
        console.error("Ошибка загрузки профиля пользователя:", error);
      }
    }
  } else {
    dispatch({ type: 'SET_GUEST' });
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const response = await loginUser(credentials);

    const { token, user } = response;
    localStorage.setItem(`token_${user.login}`, token);
    localStorage.setItem(`userId_${user.login}`, user.id);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
    
    const userProfile = await fetchUserProfile(user.id, token);
    dispatch({ type: 'SET_USER', payload: userProfile.data });
    return user.id;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'An error occurred during login';
    dispatch({ type: 'LOGIN_FAIL', payload: errorMessage });
  }
};

export const getUserProfile = (userId) => async (dispatch) => {
  try {
    const profile = await fetchUserProfile(userId);
    dispatch({ type: 'GET_USER_PROFILE_SUCCESS', payload: profile });
  } catch (error) {
    dispatch({ type: 'GET_USER_PROFILE_FAIL', payload: error.message });
  }
};

export const logout = (login) => (dispatch) => {
  localStorage.removeItem(`token_${login}`); 
  localStorage.removeItem(`userId_${login}`);
  dispatch({ type: 'LOGOUT' });
};

