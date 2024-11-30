const initialState = {
  user: null,
  isAuthenticated: false,
  currentLogin: null,
  token: null,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        currentLogin: action.payload.user.login,
        token: action.payload.token,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        currentLogin: action.payload.login,
        token: action.payload.token,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_GUEST':
      return initialState; 
      case 'LOGIN_FAIL':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return initialState;
      case 'UPDATE_USER_AVATAR':
  return {
    ...state,
    user: {
      ...state.user,
      profile_picture: action.payload,
    },
  };
    default:
      return state;
  }
};

export default authReducer;
