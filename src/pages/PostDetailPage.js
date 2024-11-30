import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchComments, addComment, editComment, deleteComment } from '../redux/actions/commentActions';
import { fetchPost } from '../redux/actions/postActions';
import { fetchLikesForPost, likePost, unlikePost, likeComment, unlikeComment } from '../redux/actions/likeActions';
import ConfirmModal from '../components/ConfirmModal';
import axios from 'axios';
import Alert from '../components/Alert';

const PostDetailPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const comments = useSelector((state) => state.comments.comments) || [];
  const post = useSelector((state) => state.posts.post);
  const likedComments = useSelector((state) => state.likes.likedComments);
  const likedPosts = useSelector((state) => state.likes.likedPosts);
  const [newComment, setNewComment] = useState('');
  const [editCommentContent, setEditCommentContent] = useState('');
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null); 
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const [sortCriteria, setSortCriteria] = useState('likes');
  const [likeCount, setLikeCount] = useState(0);
const [dislikeCount, setDislikeCount] = useState(0);

const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    dispatch(fetchPost(postId));
    dispatch(fetchLikesForPost(postId));
    dispatch(fetchComments(postId, page, pageSize));
  }, [dispatch, postId, page]);

  useEffect(() => {
    if (post) {
      setLikeCount(post.like_count || 0);
      setDislikeCount(post.dislike_count || 0);
    }
  }, [post]);
  
  useEffect(() => {
  const handleScroll = () => {
    if (!user) {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 50;

      if (scrollPosition >= threshold) {
        setIsAlertVisible(true);
      } else {
        setIsAlertVisible(false);
      }
    }
  };

  window.addEventListener('scroll', handleScroll);

  return () => window.removeEventListener('scroll', handleScroll);
}, [user]);
  const currentReaction = likedPosts[postId];

  const handleReaction = async (type) => {
    if (!user) {
        setAlertMessage("Login to like and dislike");
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
            setLikeCount(like_count);
            setDislikeCount(dislike_count);
        }

        dispatch(fetchLikesForPost(post.id));
    } catch (error) {
        console.error("Ошибка при изменении реакции на пост:", error);
    }
};

const handleCommentReaction = async (commentId, type) => {
  if (!user) {
    setAlertMessage("Log in to react to this post");
    return;
  }

  const currentCommentReaction = likedComments[commentId];

  try {
    if (currentCommentReaction === type) {
      await dispatch(unlikeComment(commentId));
    } else {
      if (currentCommentReaction) {
        await dispatch(unlikeComment(commentId));
      }
      await dispatch(likeComment(commentId, type));
    }

    dispatch(fetchComments(postId, page, pageSize));
  } catch (error) {
    console.error("Ошибка при изменении реакции на комментарий:", error);
  }
};

const handleAddComment = (e, parentId = null) => {
    e.preventDefault();
    if (!user) {
      setAlertMessage("Log in to add comments");
      return;
    }
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    dispatch(addComment(postId, content, token, parentId))
      .then(() => {
        if (parentId) {
          setReplyContent('');
          setReplyingToCommentId(null);
        } else {
          setNewComment('');
          setPage(1);
        }
        dispatch(fetchComments(postId, 1, pageSize));
      })
      .catch(() => setError("Не удалось добавить комментарий."));
  };

const handleDelete = async () => {
    if (!user) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertMessage("Post deleted");
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error("Ошибка при удалении поста:", err);
      setAlertMessage("Failed to delete post");
    }
  };

const handleReply = (commentId) => {
    setReplyingToCommentId(commentId);
    setReplyContent('');
};

const handleEditComment = (comment) => {
  if (editingCommentId === comment.id) {
    setEditingCommentId(null);
    setEditCommentContent('');
  } else {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  }
};


  const handleSaveEditComment = () => {
    if (!editCommentContent.trim()) return;

    dispatch(editComment(editingCommentId, editCommentContent, token))
      .then(() => {
        setEditingCommentId(null);
        setEditCommentContent('');
        dispatch(fetchComments(postId, page, pageSize));
      })
      .catch(() => setError("Не удалось редактировать комментарий."));
  };

  const handleDeleteComment = (commentId) => {
    setDeletingCommentId(commentId);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteComment = () => {
    dispatch(deleteComment(deletingCommentId, token))
      .then(() => {
        setDeletingCommentId(null);
        dispatch(fetchComments(postId, page, pageSize));
      })
      .catch(() => setError("Не удалось удалить комментарий."));
    setIsConfirmModalOpen(false);
  };

  const cancelDeleteComment = () => {
    setDeletingCommentId(null);
    setIsConfirmModalOpen(false);
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };
  const handleSortCriteriaChange = (event) => {
    setSortCriteria(event.target.value);
  };

  const sortedComments = comments
    .filter((comment) => comment.parent_id === null)
    .sort((a, b) => {
      if (sortCriteria === 'likes') {
        return (b.like_count || 0) - (a.like_count || 0);
      } else if (sortCriteria === 'date') {
        return new Date(b.publish_date) - new Date(a.publish_date); 
      }
      return 0;
    });

    const toggleCommentStatus = async (comment) => {
      try {
        const response = await axios.patch(
          `http://localhost:5000/api/comments/${comment.id}/status`,
          { isActive: !comment.is_active },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        setAlertMessage(
          `Comment status updated to: ${
            response.data.is_active ? "Active" : "Inactive"
          }`
        );

        dispatch(fetchComments(postId, page, pageSize));
      } catch (error) {
        console.error("Error toggling comment status:", error);
        setAlertMessage("Failed to toggle comment status");
      }
    };
    
  if (!post) return <p>Loading...</p>;
  const canPerformActions = (comment) => {
    return user && (user.role === 'admin' || user.login === comment.author);
  };
  
  const isAuthor = user && (user.role === 'admin' || user.id === post.author_id);
  const isAuthorOrAdmin = user && (user.login === post.author || user.role === 'admin');
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(post.publish_date));

  const timeAgo = (publishDate) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(publishDate)) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
     // Если прошло больше 24 часов, выводим дату
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishDate));
  return formattedDate;
  };

  return (
    <div className="post-detail-page bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      {/* Галерея изображений */}
    <div className="image-gallery">
      {post.images &&
        post.images.map((image, index) => (
          <img
            key={index}
            src={`http://localhost:5000${image}`}
            alt={`Thumbnail ${index + 1}`}
            className="image-thumbnail"
            onClick={() => setSelectedImage(`http://localhost:5000${image}`)}
          />
        ))}
    </div>
   {/* Модальное окно */}
   {selectedImage && (
      <div className="modal" onClick={() => setSelectedImage(null)}>
        <img src={selectedImage} alt="Full Size" />
        <span className="modal-close" onClick={() => setSelectedImage(null)}>
          &times;
        </span>
      </div>
    )}
      <p className="text-gray-700 mb-4">{post.content}</p>

      <div className="flex items-center justify-between">
        <small className="text-gray-500">{formattedDate}</small>
        
        {user && (<div className="flex space-x-4">
          {/* Like button */}
          <button 
            onClick={() => handleReaction('like')} 
            className="flex items-center text-gray-600 hover:text-black transition duration-200"
            title="Like"
          >
            <i className={`mr-1 ${currentReaction === 'like' ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'} fa-lg`}></i> {/* Добавлено fa-lg для увеличения */}
          </button>
        
          {/* Дизлайк */}
          <button 
            onClick={() => handleReaction('dislike')} 
            className="flex items-center text-gray-600 hover:text-black transition duration-200"
            title="Dislike"
          >
            <i className={`mr-1 ${currentReaction === 'dislike' ? 'fas fa-thumbs-down' : 'far fa-thumbs-down'} fa-lg`}></i> {/* Добавлено fa-lg для увеличения */}
          </button>
        </div>
        )}
      </div>

      {isAuthor && (
        <div className="flex space-x-4 mt-4">
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

        </div>
      )}

      <h3 className="text-xl font-semibold mt-8 mb-4">Comments</h3>
       {/* Sort Criteria Dropdown */}
       {comments.length > 1 && (
  <div className="mb-4">
    <label htmlFor="sortCriteria" className="mr-2 text-gray-700">Sort by:</label>
    <select
      id="sortCriteria"
      value={sortCriteria}
      onChange={handleSortCriteriaChange}
      className="border border-gray-300 rounded-lg p-2"
    >
      <option value="likes">Most Liked</option>
      <option value="date">Newest</option>
    </select>
  </div>
)}

      <ul className="space-y-4">
{/* Комментарий */}
{sortedComments.map((comment) => (
        <li
        key={comment.id}
        className={`p-4 rounded-lg relative ${
          comment.is_active ? "bg-gray-100" : ""
        }`}
        style={{
          position: 'relative',
        }}
      >
        {/* Туман */}
        {!comment.is_active && (
          <div
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 11,
            }}
          ></div>
        )}
  <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{comment.author}</p>
            {/* Если ID редактируемого комментария совпадает, отображаем поле ввода для редактирования */}
            {editingCommentId === comment.id ? (
              <>
                <textarea
                  value={editCommentContent}
                  onChange={(e) => setEditCommentContent(e.target.value)}
                  className="w-full max-w-screen-lg min-w-[640px] border border-gray-300 rounded-lg p-2 mt-2"
                  rows="4"
                  required
                />
                <div className="flex space-x-2 mt-2">
                  <button onClick={handleSaveEditComment} className="bg-gray-800 text-white rounded-lg px-4 py-2">
                    Edit
                  </button>
                  <button onClick={() => setEditingCommentId(null)} className="bg-gray-500 text-white rounded-lg px-4 py-2">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700">{comment.content}</p>
                
              </>
            )}
          </div>
          {canPerformActions(comment) && (
          <div className="flex space-x-2">
          
  <button
  onClick={() => toggleCommentStatus(comment)}
  className={`flex items-center justify-center w-8 h-8 rounded-full ${
    comment.is_active ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"
  } hover:bg-gray-600 transition duration-200`}
  title={comment.is_active ? "Deactivate comment" : "Activate comment"}
>
  <i
    className={`fas ${
      comment.is_active ? "fa-eye-slash" : "fa-eye"
    } text-sm`}
  ></i>
</button>
            {/* Кнопка "Редактировать" */}
            
              <>
                <button
  onClick={() => handleEditComment(comment)}
  className="text-gray-600 hover:text-black transition duration-200"
  title="Edit Comment"
>
  <i className="fas fa-pen-to-square fa-lg"></i>
</button>
<button
  onClick={() => handleDeleteComment(comment.id)}
  className="text-gray-600 hover:text-black transition duration-200"
  title="Delete Comment"
>
  <i className="fas fa-trash-can fa-lg"></i>
</button>

              </>
            
        </div>
        )}
      </div>
      </div>
  {/* Лайки и дизлайки */}
<div className="flex items-center space-x-4 mt-4">
  
    <>
      <button
        onClick={() => handleCommentReaction(comment.id, 'like')}
        className="flex items-center space-x-1 text-gray-600 hover:text-black transition"
        title="Like"
      >
        <i className={`${likedComments[comment.id] === 'like' ? 'fas' : 'far'} fa-thumbs-up fa-lg`}></i>
        <span className="text-sm">{comment.like_count || 0}</span>
      </button>
      <button
        onClick={() => handleCommentReaction(comment.id, 'dislike')}
        className="flex items-center space-x-1 text-gray-600 hover:text-black transition"
        title="Dislike"
      >
        <i className={`${likedComments[comment.id] === 'dislike' ? 'fas' : 'far'} fa-thumbs-down fa-lg`}></i>
        <span className="text-sm">{comment.dislike_count || 0}</span>
      </button>
    </>
  
</div>

<small className="text-gray-500">
  {timeAgo(comment.publish_date)}
</small>
      {/* Кнопка "Ответить" с изменяющейся стрелкой */}
      {user && (
  <div className="flex justify-end mt-2">
    <button
      onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
      className="text-gray-900 hover:text-gray-600"
    >
      {replyingToCommentId === comment.id ? (
    <i className="fas fa-solid fa-reply"></i>
  ) : (
    <i className="fas fa-regular fa-share"></i>
  )}
    </button>
  </div>
)}


      {/* Форма для ответа на комментарий */}
      {replyingToCommentId === comment.id && (
        <form onSubmit={(e) => handleAddComment(e, comment.id)} className="mt-2 w-full reply-form">
          <textarea
            placeholder="Reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 reply-input"
            required
          />
          <button className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-2 hover:bg-gray-700">
            Reply
          </button>
        </form>
      )}

      {/* Вложенные ответы */}
      {comments
  .filter((reply) => reply.parent_id === comment.id)
  .map((reply) => (
    <div
      key={reply.id}
      className={`ml-6 mt-4 p-4 rounded-lg ${
        reply.is_active ? "bg-gray-50" : "bg-gray-100"
      }`}
      style={{
        position: "relative",
        zIndex: 20,
        opacity: reply.is_active ? 1 : 0.7,
      }}
    >
      {!reply.is_active && (
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.68)",
            zIndex: 10,
          }}
        ></div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{reply.author}</p>
          {editingCommentId === reply.id ? (
            <>
              <textarea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                className="w-full  max-w-screen-lg min-w-[580px] border border-gray-300 rounded-lg p-2 mt-2"
                rows="3"
                required
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleSaveEditComment}
                  className="bg-gray-800 text-white rounded-lg px-4 py-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => setEditingCommentId(null)}
                  className="bg-gray-500 text-white rounded-lg px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700">{reply.content}</p>
              <small className="text-gray-500">
  {timeAgo(reply.publish_date)}
</small>
            </>
          )}
        </div>

        {/* Кнопки управления */}
        {canPerformActions(reply) && (
          <div className="flex space-x-2">
            {/* Кнопка активации/деактивации */}
            <button
              onClick={() => toggleCommentStatus(reply)}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                reply.is_active
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-600"
              } hover:bg-gray-600 transition duration-200`}
              title={
                reply.is_active ? "Deactivate comment" : "Activate comment"
              }
            >
              <i
                className={`fas ${
                  reply.is_active ? "fa-eye-slash" : "fa-eye"
                } text-sm`}
              ></i>
            </button>

            {/* Кнопка редактирования */}
            <button
              onClick={() => handleEditComment(reply)}
              className="text-gray-600 hover:text-black"
              title="Edit Comment"
            >
              <i className="fas fa-pen-to-square fa-lg"></i>
            </button>

            {/* Кнопка удаления */}
            <button
              onClick={() => handleDeleteComment(reply.id)}
              className="text-gray-600 hover:text-black"
              title="Delete Comment"
            >
              <i className="fas fa-trash-can fa-lg"></i>
            </button>
          </div>
        )}
      </div>

      {/* Лайки и дизлайки для вложенных комментариев */}
<div className="flex items-center space-x-4 mt-4">
  
    <>
      <button
        onClick={() => handleCommentReaction(reply.id, 'like')}
        className="flex items-center space-x-1 text-gray-600 hover:text-black transition"
        title="Like"
      >
        <i className={`${likedComments[reply.id] === 'like' ? 'fas' : 'far'} fa-thumbs-up fa-lg`}></i>
        <span className="text-sm">{reply.like_count || 0}</span>
      </button>
      <button
        onClick={() => handleCommentReaction(reply.id, 'dislike')}
        className="flex items-center space-x-1 text-gray-600 hover:text-black transition"
        title="Dislike"
      >
        <i className={`${likedComments[reply.id] === 'dislike' ? 'fas' : 'far'} fa-thumbs-down fa-lg`}></i>
        <span className="text-sm">{reply.dislike_count || 0}</span>
      </button>
    </>
  
</div>
    </div>
  ))}
    </li>
  ))}
</ul>
      {/* Confirm Delete Modal */}
      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onConfirm={confirmDeleteComment}
          onCancel={cancelDeleteComment}
          message="Are you sure you want to delete this comment?"
        />
      )}
      
      {/* Pagination Controls */}
      <div className="pagination-controls flex justify-center mt-6 space-x-4">
        {page > 1 && (
          <button onClick={handlePreviousPage} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
            ⟸
          </button>
        )}
        {comments.length === pageSize && (
          <button onClick={handleNextPage} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
            ⟹
          </button>
        )}
      </div>

      {user && (
  <form onSubmit={handleAddComment} className="mt-6 w-full comment-form">
    <textarea
      placeholder="Write comment..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-3 comment-input"
      required
    />
    <button className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-2 hover:bg-gray-700">
      Comment
    </button>
  </form>
)}
      {error && <p className="text-red-500 mt-4">{error}</p>}
       {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
       {isAlertVisible && (
  <Alert message="Log in to add reactions and comments" onClose={() => setIsAlertVisible(false)} />
)}

    </div>
  );
};

export default PostDetailPage;
