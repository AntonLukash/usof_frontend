const initialState = {
    likedPosts: {},
    likedComments: {}
};

const likeReducer = (state = initialState, action) => {
    switch (action.type) {
        case "UPDATE_POST_REACTIONS":
      return {
        ...state,
        likedPosts: {
          ...state.likedPosts,
          [action.payload.postId]: null,
        },
      };
        case 'FETCH_LIKES_SUCCESS':
            return {
                ...state,
                likedPosts: {
                    ...state.likedPosts,
                    [action.payload.postId]: action.payload.userReaction,
                },
            };
        case 'LIKE_POST_SUCCESS':
            return {
                ...state,
                likedPosts: { ...state.likedPosts, [action.payload.postId]: action.payload.type }
            };
        case 'UNLIKE_POST_SUCCESS':
            const { [action.payload]: _, ...remainingPosts } = state.likedPosts;
            return {
                ...state,
                likedPosts: remainingPosts
            };
        case 'LIKE_COMMENT_SUCCESS':
            return {
                ...state,
                likedComments: { ...state.likedComments, [action.payload.commentId]: action.payload.type }
            };
        case 'UNLIKE_COMMENT_SUCCESS':
            const { [action.payload]: __, ...remainingComments } = state.likedComments;
            return {
                ...state,
                likedComments: remainingComments
            };
        case 'SET_LIKED_COMMENTS':
            return {
                ...state,
                likedComments: action.payload
            };
        default:
            return state;
    }
};

export default likeReducer;
