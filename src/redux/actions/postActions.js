import { getPosts as fetchPosts } from '../../services/api';
import { getPosts as fetchAllPosts } from '../../services/api';
import { getToken } from '../../utils/token';
import axios from 'axios';

export const updatePostReactions = (postId, likeCount, dislikeCount) => ({
  type: 'UPDATE_POST_REACTIONS',
  payload: { postId, likeCount, dislikeCount },
});

export const getPostsForHomePage = (login) => async (dispatch) => {
  try {
    
    const token = getToken(login);
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    
    const response = await axios.get('http://localhost:5000/api/posts', config);

    dispatch({ type: 'GET_USER_POSTS_SUCCESS', payload: response.data });
  } catch (error) {
    console.error("Ошибка при получении постов:", error.message);
    dispatch({ type: 'GET_USER_POSTS_FAIL', payload: error.message });
  }
};

export const getUserPosts = (login) => async (dispatch, getState) => {
  try {
      const { auth: { token } } = getState();

      const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

      const response = await axios.get('http://localhost:5000/api/posts', config);

      const userPosts = response.data.filter(post => post.author === login);

      dispatch({ type: 'GET_USER_POSTS_SUCCESS', payload: userPosts });
  } catch (error) {
      console.error("Ошибка при получении постов:", error.message);
      dispatch({ type: 'GET_USER_POSTS_FAIL', payload: error.message });
  }
};

export const getPosts = (params) => async (dispatch) => {
  try {
    const posts = await fetchPosts(params);
    dispatch({ type: 'GET_POSTS_SUCCESS', payload: posts });
  } catch (error) {
    dispatch({ type: 'GET_POSTS_FAIL', payload: error.message });
  }
};

export const getAllPosts = (filters = {}) => async (dispatch) => {
  dispatch({ type: 'GET_POSTS_REQUEST' });

  try {
      const { sort = 'date', category, dateStart, dateEnd, status } = filters;
      const response = await axios.get('http://localhost:5000/api/posts', {
          params: { sort, category, dateStart, dateEnd, status },
      });

      dispatch({
          type: 'GET_POSTS_SUCCESS',
          payload: response.data,
      });
  } catch (error) {
      dispatch({
          type: 'GET_POSTS_FAIL',
          payload: error.message,
      });
  }
};

export const deletePost = (postId) => async (dispatch) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Токен не найден");
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    await axios.delete(`http://localhost:5000/api/posts/${postId}`, config);

    dispatch({ type: 'DELETE_POST_SUCCESS', payload: postId });
  } catch (error) {
    console.error("Ошибка при удалении поста:", error.message);
    dispatch({ type: 'DELETE_POST_FAIL', payload: error.message });
  }
};

export const fetchPost = (postId) => async (dispatch) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/posts/${postId}`);
    dispatch({ type: 'FETCH_POST_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_POST_FAIL', payload: error.message });
  }
};

export const savePost = (postId) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/save`, {}, config);
      dispatch({ type: 'SAVE_POST_SUCCESS', payload: postId });
  } catch (error) {
      console.error("Ошибка при сохранении поста:", error);
  }
};

export const removeSavedPost = (postId) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}/save`, config);
      dispatch({ type: 'REMOVE_SAVED_POST_SUCCESS', payload: postId });
  } catch (error) {
      console.error("Ошибка при удалении поста из сохраненных:", error);
  }
};

export const fetchSavedPosts = () => async (dispatch, getState) => {
  const { token } = getState().auth;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
      const response = await axios.get('http://localhost:5000/api/posts/saved', config);

      dispatch({ type: 'FETCH_SAVED_POSTS_SUCCESS', payload: response.data });
  } catch (error) {
      console.error("Ошибка при загрузке сохраненных постов:", error);
  }
};
