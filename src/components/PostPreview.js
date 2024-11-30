import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { likePost, unlikePost } from '../redux/actions/likeActions';
import { savePost, removeSavedPost, fetchSavedPosts } from '../redux/actions/postActions';
import axios from 'axios';
import { fetchLikesForPost } from '../redux/actions/likeActions';
import Alert from '../components/Alert';
import { updatePostReactions } from '../redux/actions/postActions';
const PostPreview = ({ post, onReactionUpdate, onPostDelete  }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const likedPosts = useSelector((state) => state.likes.likedPosts);
  const currentReaction = likedPosts[post.id];
  const savedPosts = useSelector((state) => state.posts.savedPosts);
  const isSaved = useMemo(() => savedPosts.some(savedPost => savedPost.id === post.id), [savedPosts, post.id]);
  const [alertMessage, setAlertMessage] = useState(null);
  const userId = user?.id;

  const likeCount = post.like_count;
const dislikeCount = post.dislike_count;
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    dispatch(fetchLikesForPost(post.id)).then((response) => {
      if (response && response.data) {
        const { like_count, dislike_count } = response.data;
        setLikeCount(like_count || 0);
        setDislikeCount(dislike_count || 0);
      }
    });

    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${post.id}/comments`);
        setCommentCount(response.data.totalComments || 0);
      } catch (error) {
        console.error("Error fetching comment count:", error);
      }
    };

    fetchCommentCount();
  }, [dispatch, post.id]);

  const handleSaveToggle = async () => {
    if (post.status == 'inactive') {
      setAlertMessage("Make post active to save it");
      return;
    }
    if (isSaved) {
      await dispatch(removeSavedPost(post.id));
      dispatch(fetchSavedPosts());
    } else {
      await dispatch(savePost(post.id));
      dispatch(fetchSavedPosts());
    }
  
  };

  const handleReaction = async (type) => {
    if (!user) {
        setAlertMessage("Log in to react to this post.");
        return;
    }
    try {
        let response;
        if (currentReaction === type) {
            response = await dispatch(unlikePost(post.id));
        } else {
            if (currentReaction) {
                await dispatch(unlikePost(post.id));
            }
            response = await dispatch(likePost(post.id, type));
        }

        if (response && response.data) {
          const { like_count, dislike_count } = response.data;
          dispatch(updatePostReactions(post.id, like_count, dislike_count));
      if (onReactionUpdate) {
        onReactionUpdate({ like_count, dislike_count });
      }
        }

        dispatch(fetchLikesForPost(post.id));
    } catch (error) {
        console.error("Error changing post reaction:", error);
    }
};

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertMessage("Post deleted");
      if (onPostDelete) {
        onPostDelete(post.id);
      }
      

      if (onPostDelete) {
        onPostDelete();
      }
      
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 2000);
    } catch (err) {
      console.error("Ошибка при удалении поста:", err);
      setAlertMessage("Failed to delete post");
    }
  };

  const formattedDate = post.publish_date
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      }).format(new Date(post.publish_date))
    : 'Unknown Date';

    function truncateTextMultiLine(text = '', maxLengthPerLine, maxLines) {
      let result = '';
      let lineCount = 0;
    
      for (let i = 0; i < text.length && lineCount < maxLines; i += maxLengthPerLine) {
        const line = text.slice(i, i + maxLengthPerLine);
        result += line;
        lineCount++;
    
        if (lineCount < maxLines && i + maxLengthPerLine < text.length) {
          result += '\n';
        }
      }
    
      if (text.length > maxLengthPerLine * maxLines) {
        result += '...';
      }
    
      return result;
    }
    

    
  const isAuthorOrAdmin = user && (post.author === user.login || user.role === 'admin');

  return (
    <div className="bg-white border border-gray-300 shadow-md rounded-lg p-6 my-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to={`/profile/${post.author_id}`} className="flex items-center">
            <img
              src={`http://localhost:5000/${post.author_avatar || 'uploads/avatars/default.png'}`}
              alt="Author avatar"
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="font-semibold text-gray-800">{post.author}</span>
          </Link>
        </div>
        {post.status === 'inactive' && (
          <span className="text-xs text-gray-500 italic flex items-center">
            <i className="fas fa-ban text-gray-500 mr-1"></i> Inactive
          </span>
        )}
        {user && (
        <button 
        onClick={handleSaveToggle} 
        className={`text-xl ${isSaved ? 'text-black' : 'text-gray-400'} hover:text-gray-600 transition duration-200`}
        title={isSaved ? 'Unsave Post' : 'Save Post'}
      >
        {isSaved ? (
          <i className="fas fa-star"></i>
        ) : (
          <i className="far fa-star"></i>
        )}
      </button>
      
          )}
      </div>

      <Link to={`/posts/${post.id}`} className="block mt-4 text-black hover:text-gray-600">
        <h3 className="text-lg font-bold">{post.title}</h3>
        <p className="text-gray-600 mt-2"style={{ whiteSpace: 'pre-line' }}>
  {truncateTextMultiLine(post.content, 80, 2)}</p>
      </Link>

      {post.categories && (
        <div className="flex flex-wrap mt-2">
          {post.categories.split(',').map((categoryPair, index) => {
            const [id, name] = categoryPair.split(':').map((str) => str.trim());
            return (
              <button
              key={id || index} 
                onClick={() => navigate(`/category/${id}`)}
                className="text-xs bg-gray-100 text-gray-600 py-1 px-3 rounded-full mr-2 mt-2 hover:bg-gray-200"
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-500 text-sm">{formattedDate}</span>
        {user ? (
        <div className="flex space-x-4 items-center">
          {isAuthorOrAdmin && (
            <>
              {/* Edit button */}
<button
  onClick={() => navigate(`/edit-post/${post.id}`)}
  className="text-gray-600 hover:text-black transition duration-200"
  title="Edit Post"
>
  <i className="fas fa-pen-to-square fa-lg"></i>
</button>

{/* Delete button */}
<button
  onClick={handleDelete}
  className="text-gray-600 hover:text-black transition duration-200"
  title="Delete Post"
>
  <i className="fas fa-trash-can fa-lg"></i>
</button>
            </>
          )}
          {/* Лайк */}
          <button 
            onClick={() => handleReaction('like')} 
            className="flex items-center text-gray-600 hover:text-black transition duration-200"
            title="Like"
          >
            <i className={`mr-1 ${currentReaction === 'like' ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'} fa-lg`}></i> {/* Добавлено fa-lg для увеличения */}
            <span>{likeCount}</span>
          </button>
        
          {/* Дизлайк */}
          <button 
            onClick={() => handleReaction('dislike')} 
            className="flex items-center text-gray-600 hover:text-black transition duration-200"
            title="Dislike"
          >
            <i className={`mr-1 ${currentReaction === 'dislike' ? 'fas fa-thumbs-down' : 'far fa-thumbs-down'} fa-lg`}></i> {/* Добавлено fa-lg для увеличения */}
            <span>{dislikeCount}</span>
          </button>
          {/* Коментарии */}
          <div className="flex space-x-4 items-center">
          <button className="flex items-center text-gray-600 hover:text-black transition duration-200">
            <i className="fa-regular fa-comments mr-1 fa-lg"></i>
            <span>{commentCount}</span>
          </button>
        </div>

        </div>
        ) : (<div className="flex space-x-4">
       <button
  onClick={() => setAlertMessage('Log in to react to this post')}
  className="flex items-center text-gray-600 hover:text-black"
>
  <i className="far fa-thumbs-up mr-1 fa-lg"></i>
  <span>{likeCount}</span>
</button>
<button
  onClick={() => setAlertMessage('Log in to react to this post')}
  className="flex items-center text-gray-600 hover:text-black"
>
  <i className="far fa-thumbs-down mr-1 fa-lg"></i>
  <span>{dislikeCount}</span>
</button>
      </div>
    )}
      </div>

      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </div>
  );
};

export default PostPreview;
