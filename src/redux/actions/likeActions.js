import axios from 'axios';

export const fetchLikesForPost = (postId) => async (dispatch, getState) => {
    try {
        const { token, user } = getState().auth;
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}/like`, config);
        let userReaction = null;

        if (user) {
            userReaction = response.data.find(
                like => like.author === user.login
            );
        }

        dispatch({
            type: 'FETCH_LIKES_SUCCESS',
            payload: { postId, userReaction: userReaction ? userReaction.type : null },
        });
    } catch (error) {
        console.error("Ошибка при загрузке лайков для поста:", error);
    }
};



export const likePost = (postId, type = 'like') => async (dispatch, getState) => {
    try {
        const { token } = getState().auth;
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        const response = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, { type }, config);

        const { like_count, dislike_count } = response.data;
    dispatch(updatePostReactions(postId, like_count, dislike_count));
        dispatch({ type: 'LIKE_POST_SUCCESS', payload: { postId, type, data: response.data} });
        return response;
    } catch (error) {
        console.error("Ошибка при лайке поста:", error);
    }
};

export const unlikePost = (postId) => async (dispatch, getState) => {
    try {
        const { token } = getState().auth;
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        const response = await axios.delete(`http://localhost:5000/api/posts/${postId}/like`, config);

        const { like_count, dislike_count } = response.data;
        
        dispatch(updatePostReactions(postId, like_count, dislike_count));
        dispatch({ type: 'UNLIKE_POST_SUCCESS', payload: postId });
        return response;
    } catch (error) {
        console.error("Ошибка при удалении лайка с поста:", error);
    }
};
export const likeComment = (commentId, type = 'like') => async (dispatch, getState) => {
    try {
        const { token } = getState().auth;
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        await axios.post(`http://localhost:5000/api/comments/${commentId}/like`, { type }, config);

        dispatch({ type: 'LIKE_COMMENT_SUCCESS', payload: { commentId, type } });
    } catch (error) {
        console.error("Ошибка при лайке комментария:", error);
    }
};

export const unlikeComment = (commentId) => async (dispatch, getState) => {
    try {
        const { token } = getState().auth;
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        await axios.delete(`http://localhost:5000/api/comments/${commentId}/like`, config);

        dispatch({ type: 'UNLIKE_COMMENT_SUCCESS', payload: commentId });
    } catch (error) {
        console.error("Ошибка при удалении лайка комментария:", error);
    }
};

export const updatePostReactions = (postId, likeCount, dislikeCount) => ({
    type: "UPDATE_POST_REACTIONS",
    payload: { postId, likeCount, dislikeCount },
  });

