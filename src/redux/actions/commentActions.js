import axios from 'axios';

export const editComment = (commentId, content, token) => async (dispatch) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.patch(`http://localhost:5000/api/comments/${commentId}`, { content }, config);
      dispatch({ type: 'EDIT_COMMENT_SUCCESS', payload: { commentId, content } });
    } catch (error) {
      console.error("Ошибка при редактировании комментария:", error);
      throw error;
    }
  };
  
  export const deleteComment = (commentId, token) => async (dispatch) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, config);
      dispatch({ type: 'DELETE_COMMENT_SUCCESS', payload: commentId });
    } catch (error) {
      console.error("Ошибка при удалении комментария:", error);
      throw error;
    }
  };

export const fetchComments = (postId, page = 1, pageSize = 5) => async (dispatch, getState) => {
    try {
        const { token, user } = getState().auth;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`, {
            params: { page, pageSize }
        });
        const comments = Array.isArray(response.data) ? response.data : response.data.comments;


        const likedComments = {};

        if (token && user) {
            await Promise.all(comments.map(async (comment) => {
                const likesResponse = await axios.get(`http://localhost:5000/api/comments/${comment.id}/like`, config);

                const userLike = likesResponse.data.find(like => like.author_id === user.id);
                likedComments[comment.id] = userLike ? userLike.type : null;
            }));
        }

        dispatch({ type: 'FETCH_COMMENTS_SUCCESS', payload: comments });
        dispatch({ type: 'SET_LIKED_COMMENTS', payload: likedComments });
    } catch (error) {
        dispatch({ type: 'FETCH_COMMENTS_FAIL', payload: error.message });
        console.error('Ошибка при загрузке комментариев и лайков:', error);
    }
};

export const addComment = (postId, content, token, parentId = null) => async (dispatch) => {
  try {
      const config = {
          headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, { content, parentId }, config);
      
      dispatch({ type: 'ADD_COMMENT_SUCCESS', payload: response.data });
  } catch (error) {
      dispatch({ type: 'ADD_COMMENT_FAIL', payload: error.message });
  }
};

