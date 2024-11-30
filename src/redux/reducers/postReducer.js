const initialState = {
  posts: [],
  savedPosts: [], 
  post: null,
  loading: true,
  error: null,
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_POSTS":
        return {
          ...state,
          posts: action.payload,
        };
        case "DELETE_POST":
  return {
    ...state,
    posts: state.posts.filter((post) => post.id !== action.payload),
  };

      case 'GET_USER_POSTS_SUCCESS':
          return {
              ...state,
              posts: action.payload,
              loading: false,
              error: null,
          };
      case 'GET_USER_POSTS_FAIL':
          return {
              ...state,
              loading: false,
              error: action.payload,
          };
      case 'GET_POSTS_SUCCESS':
          return {
              ...state,
              posts: action.payload,
              loading: false,
              error: null,
          };
      case 'GET_POSTS_FAIL':
          return {
              ...state,
              loading: false,
              error: action.payload,
          };
      case 'FETCH_POST_SUCCESS':
          return {
              ...state,
              post: action.payload,
              loading: false,
              error: null,
          };
      case 'FETCH_POST_FAIL':
          return {
              ...state,
              loading: false,
              error: action.payload,
          };
      case 'DELETE_POST_SUCCESS':
          return {
              ...state,
              posts: state.posts.filter((post) => post.id !== action.payload),
          };
      case 'DELETE_POST_FAIL':
          return {
              ...state,
              error: action.payload,
          };
          case 'SAVE_POST_SUCCESS':
            return { ...state, savedPosts: [...state.savedPosts, action.payload] };
        case 'REMOVE_SAVED_POST_SUCCESS':
            return { ...state, savedPosts: state.savedPosts.filter((id) => id !== action.payload) };
        case 'FETCH_SAVED_POSTS_SUCCESS':
            return { ...state, savedPosts: action.payload };
            case 'UPDATE_POST_REACTIONS':
                return {
                  ...state,
                  posts: state.posts.map((post) =>
                    post.id === action.payload.postId
                      ? {
                          ...post,
                          like_count: action.payload.likeCount,
                          dislike_count: action.payload.dislikeCount,
                        }
                      : post
                  ),
                  savedPosts: state.savedPosts.map((post) =>
                    post.id === action.payload.postId
                      ? {
                          ...post,
                          like_count: action.payload.likeCount,
                          dislike_count: action.payload.dislikeCount,
                        }
                      : post
                  ),
                };
      default:
          return state;
  }
};

export default postReducer;
