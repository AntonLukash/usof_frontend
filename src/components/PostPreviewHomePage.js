import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { likePost, unlikePost } from '../redux/actions/likeActions';
import { savePost, removeSavedPost, fetchSavedPosts } from '../redux/actions/postActions';
import axios from 'axios';
import { fetchLikesForPost } from '../redux/actions/likeActions';
import './fff.css';
import Alert from '../components/Alert';
import { updatePostReactions } from '../redux/actions/postActions';
import { FaSpinner } from 'react-icons/fa';

const PostPreview = ({ post, setAllPosts, handleReactionUpdate }) => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const likedPosts = useSelector((state) => state.likes.likedPosts);
  const [currentReaction, setCurrentReaction] = useState(null);
  const savedPosts = useSelector((state) => state.posts.savedPosts);
  const isSaved = useMemo(() => savedPosts.some(savedPost => savedPost.id === post.id), [savedPosts, post.id]);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [dislikeCount, setDislikeCount] = useState(post.dislike_count);
  const [alertMessage, setAlertMessage] = useState(null);
 const [commentCount, setCommentCount] = useState(0);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(post.publish_date));
  

  const handleSaveToggle = async () => {
    if (isSaved) {
      await dispatch(removeSavedPost(post.id));
      dispatch(fetchSavedPosts());
    } else {
      await dispatch(savePost(post.id));
      dispatch(fetchSavedPosts());
    }
  };

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${post.id}/comments`);
  
        if (response.data && typeof response.data.totalComments === "number") {
          setCommentCount(response.data.totalComments);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching comments count:", error);
      }
    };
  
    fetchCommentCount();
  }, [post.id]);
   useEffect(() => {
    if (user) {
      dispatch(fetchLikesForPost(post.id));
    }
  }, [dispatch, post.id, user]);

  useEffect(() => {
    if (likedPosts[post.id]) {
      setCurrentReaction(likedPosts[post.id]);
    }
  }, [likedPosts, post.id]);

  const handleReaction = async (type) => {
    if (!user) {
      setAlertMessage('Log in to react to this post.');
      return;
    }
  
    try {
      if (currentReaction === type) {
        await dispatch(unlikePost(post.id));
        setCurrentReaction(null);
  
        if (type === 'like') setLikeCount((prev) => prev - 1);
        if (type === 'dislike') setDislikeCount((prev) => prev - 1);
      } else {
        if (currentReaction) {
          await dispatch(unlikePost(post.id));
          if (currentReaction === 'like') setLikeCount((prev) => prev - 1);
          if (currentReaction === 'dislike') setDislikeCount((prev) => prev - 1);
        }
  
        await dispatch(likePost(post.id, type));
        setCurrentReaction(type);
  
        if (type === 'like') setLikeCount((prev) => prev + 1);
        if (type === 'dislike') setDislikeCount((prev) => prev + 1);
      }
  
      setAllPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id
            ? { ...p, like_count: likeCount, dislike_count: dislikeCount }
            : p
        )
      );
  
      handleReactionUpdate({
        ...post,
        like_count: likeCount,
        dislike_count: dislikeCount,
      });
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };
  

function truncateTextMultiLine(text, maxLengthPerLine, maxLines) {
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
const postUrl = `http://localhost:3000/posts/${post.id}`;

const [isLoading, setIsLoading] = useState(false);
if (!post) {
  return null;
}
const handleShareEmail = async () => {
  if (!email) {
    setAlertMessage('Please enter a valid email.');
    return;
  }
  setIsLoading(true); 
  const subject = "Interesting post, check it out!";
  const body = `
  <html>
  <body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #fff; color: #333;">
    <div style="width: 100%; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 28px; margin: 0;">Post Sharing</h1>
        <p style="font-size: 18px; color: #555; margin-top: 5px;">A post was shared with you!</p>
      </div>
      <div style="text-align: center; font-size: 16px; line-height: 1.5; color: #333; margin-bottom: 30px;">
        <p style="margin-bottom: 20px;">Hi! I found an interesting post and I want to share it with you. You can check it out by clicking the link below:</p>
        <a href="${postUrl}" style="display: inline-block; background-color: #333; color: white; padding: 15px 30px; font-size: 16px; text-decoration: none; border-radius: 5px; transition: background-color 0.3s ease;">
          View the Post
        </a>
      </div>
      <div style="text-align: center; font-size: 14px; color: #777;">
        <p style="font-size: 14px; color: #7f8c8d;">Don’t forget to leave a comment!</p>
        <footer style="margin-top: 20px; font-size: 12px; color: #95a5a6;">
          <p>Best regards, Your friend</p>
        </footer>
      </div>
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
        <p style="margin: 0;">This email was sent from an automated service. Please do not reply.</p>
      </div>
    </div>
  </body>
</html>

  `;
  const emailData = {
    email: email,
    subject: subject,
    body: body,
  };

  try {
    const response = await axios.post('http://localhost:5000/api/auth/send-email', emailData);
    setAlertMessage('Email sent successfully!');
    setEmail('');
    setShowModal(false);
  } catch (error) {
    console.error('Error sending email:', error);
    setAlertMessage('Error sending email. Please try again.');
    
  }finally {
    setIsLoading(false);
  }
};

  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
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
          <button onClick={handleSaveToggle} className={`text-xl ${isSaved ? 'text-black' : 'text-gray-400'}`}>
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
      const [id, name] = categoryPair.trim().split(':'); // Разделяем ID и название категории
      return (
        <Link
          to={`/category/${id}`}
          key={index}
          className="text-xs bg-gray-100 text-gray-600 py-1 px-3 rounded-full mr-2 mt-2 hover:bg-gray-200"
        >
          {name}
        </Link>
      );
    })}
  </div>
)}
      <div className="flex justify-between items-center mt-4">
      <span className="text-gray-500 text-sm">{formattedDate}</span>

        
          <div className="flex space-x-4">
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
          {/* Комментарии */}
          <div className="flex items-center text-gray-600">
            <i className="fa-regular fa-comments mr-1 fa-lg"></i>
            <span>{commentCount}</span>
          </div>
    <div className="flex space-x-4">
      

      {/* Кнопка для открытия модального окна */}
      <button 
  onClick={() => setShowModal(true)} 
  className="btn btn-primary d-flex align-items-center justify-content-center"
  title="Share post by email"
>
  <i className="fa-regular fa-envelope fa-sm fa-lg"></i>

</button>


      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Share post via email</h2>
              <button className="text-gray-500" onClick={() => setShowModal(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {alertMessage && <div className="text-red-500 mb-3">{alertMessage}</div>}

            <form onSubmit={(e) => { e.preventDefault(); handleShareEmail(); }}>
              <div className="mb-4">
                
                <input 
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="Enter email"
                  required
                />
              </div>

              {isLoading ? (
                 <FaSpinner className="spinner animate-spin" /> 
              ) : (
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Send Email
                </button>
              )}
            </form>
          </div>
        </div>
      )}

  {/* Share on Telegram 
  <a
    href={`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:text-blue-700"
  >
    <i className="fab fa-telegram-plane fa-lg"></i> Share on Telegram
  </a>*/}
    </div>
        </div>
        
      </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </div>
  );
};

export default PostPreview;
