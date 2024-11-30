const initialState = {
    comments: [],
    loading: false,
    error: null,
    page: 1,
    limit: 8
};

const commentReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_COMMENTS_SUCCESS':
            return { 
                ...state, 
                comments: action.payload,
                loading: false, 
                error: null
            };
            case 'EDIT_COMMENT_SUCCESS':
            return {
                ...state,
                comments: state.comments.map(comment =>
                    comment.id === action.payload.commentId
                        ? { ...comment, content: action.payload.content }
                        : comment
                )
            };
        case 'DELETE_COMMENT_SUCCESS':
            return {
                ...state,
                comments: state.comments.filter(comment => comment.id !== action.payload)
            };
        case 'FETCH_COMMENTS_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'ADD_COMMENT_SUCCESS':
            return { ...state, comments: [action.payload, ...state.comments] };
        case 'ADD_COMMENT_FAIL':
            return { ...state, error: action.payload };
            
        default:
            return state;
    }
};

export default commentReducer;
