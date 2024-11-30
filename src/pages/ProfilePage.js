import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPosts, fetchSavedPosts } from '../redux/actions/postActions';
import PostPreview from '../components/PostPreview';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import { FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { posts, loading, error, savedPosts } = useSelector((state) => state.posts);
    const { user, token } = useSelector((state) => state.auth);
    const [profileData, setProfileData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [fullName, setFullName] = useState("");
    const [isEditingFullName, setIsEditingFullName] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [currentPagePosts, setCurrentPagePosts] = useState(1);
  const [currentPageSavedPosts, setCurrentPageSavedPosts] = useState(1);
  const postsPerPage = 5;
    const isCurrentUser = user && user.id === Number(id);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${id}`);
                setProfileData(response.data);
                setAvatar(response.data.profile_picture);
                setFullName(response.data.full_name || "");

                dispatch(getUserPosts(response.data.login));
                if (isCurrentUser) {
                    dispatch(fetchSavedPosts());
                }
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
            }
        };

        fetchProfileData();
    }, [id, isCurrentUser, dispatch]);

  const handlePostDelete = (postId) => {
    setAlertMessage("Post deleted");
    dispatch({
      type: "DELETE_POST",
      payload: postId,
    });
    
    
  };

    const handlePasswordResetRequest = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/password-reset', { email: profileData.email });
            setAlertMessage("A link to reset your password has been sent to your email");
        } catch (error) {
            console.error("Ошибка при запросе сброса пароля:", error);
            setAlertMessage("Failed to send password reset request");
        }
    };

    const handleAvatarClick = () => {
        if (isCurrentUser) document.getElementById('avatarUpload').click();
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.patch('http://localhost:5000/api/users/avatar', formData, config);
            const newAvatarPath = response.data.avatarPath;

            if (newAvatarPath) {
                setAvatar(newAvatarPath);
                dispatch({ type: 'UPDATE_USER_AVATAR', payload: newAvatarPath });
                //navigate(`/profile/${userId}`)
                setAlertMessage("Avatar updated successfully");
            } else {
                console.error("Поле avatarPath не найдено в ответе сервера");
            }
        } catch (error) {
            console.error("Ошибка при обновлении аватара:", error);
            setAlertMessage("Failed to update avatar");
        }
    };

    const handleFullNameSave = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.patch(
                `http://localhost:5000/api/users/${id}/full`,
                { full_name: fullName },
                config
            );
            setProfileData(prevData => ({ ...prevData, full_name: response.data.full_name }));
            setIsEditingFullName(false);
            setAlertMessage("Full name saved");
        } catch (error) {
            console.error("Ошибка при сохранении полного имени:", error);
            setAlertMessage("Failed to save full name");
        }
    };
   // Pagination calculations
   const paginate = (items, currentPage) => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return items.slice(startIndex, startIndex + postsPerPage);
};

const paginatedPosts = paginate(posts, currentPagePosts);
const paginatedSavedPosts = paginate(savedPosts, currentPageSavedPosts);

const totalPostPages = Math.ceil(posts.length / postsPerPage);
const totalSavedPostPages = Math.ceil(savedPosts.length / postsPerPage);
    if (!profileData) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 flex flex-col items-center py-8 px-6 md:px-16">
    <div className="relative bg-white p-8 rounded-3xl shadow-2xl w-full text-center mb-8 max-w-3xl transition-transform duration-300 hover:scale-105">
        {/* Иконка рейтинга */}
        <div className="absolute top-2 left-2 flex items-center bg-gray-800 text-white rounded-full p-2 shadow-md">
            <i className="fa-solid fa-hands-asl-interpreting  text-lg mr-1"></i>
            <span className="font-semibold">{profileData.rating}</span>
        </div>
 {/* Admin Badge */}
 {profileData && profileData.role === "admin" && (
                    <div className="absolute top-2 right-2 flex items-center bg-gray-500 text-white rounded-full p-2 shadow-md">
                        <FaShieldAlt className="text-xl" />
                        <span className="ml-1 text-sm font-semibold">Admin</span>
                    </div>
                )}
        <img
            src={`http://localhost:5000/${avatar || 'uploads/avatars/default.png'}`}
            alt="Avatar"
            className="w-32 h-32 rounded-full mx-auto mb-4 cursor-pointer border-4 border-gray-300 hover:border-gray-400 transition-colors duration-300"
            onClick={handleAvatarClick}
        />
        {isCurrentUser && (
            <input
                type="file"
                id="avatarUpload"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarChange}
            />
        )}
        <h2 className="text-3xl font-bold mb-1">{profileData.login}</h2>

        {/* Полное имя или форма для редактирования */}
        {isCurrentUser ? (
            isEditingFullName ? (
                <div className="flex justify-center items-center">
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 mr-2"
                        placeholder="Your full name"
                    />
                    <button
                        onClick={handleFullNameSave}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <p className="text-gray-500 cursor-pointer" onClick={() => setIsEditingFullName(true)}>
                    {profileData.full_name || "Add full name"}
                </p>
            )
        ) : (
            profileData.full_name && <p className="text-gray-500">Full Name: {profileData.full_name}</p>
        )}
        <p className="text-gray-500">
            {isCurrentUser 
                ? `Email: ${profileData.email}` 
                : null}
        </p>
        {isCurrentUser && (
            <button
                onClick={handlePasswordResetRequest}
                className="mt-6 px-6 py-3 bg-gray-800 text-white font-semibold rounded-full shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300"
            >
                Change Password
            </button>
        )}
    </div>

    
    <div className={`w-full grid gap-6 ${isCurrentUser ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 justify-center'}`}>
             {/* My Posts Section */}
             <section
  className={`bg-white p-6 rounded-3xl shadow-lg flex flex-col justify-between ${
    !isCurrentUser ? 'mx-auto' : ''
  }`}
  style={{ 
    height: 'calc(100%)',
    width: !isCurrentUser ? '90%' : '100%'
  }}
>
  <div className="flex justify-between items-center mb-4">
  <h3 className="text-2xl font-semibold pb-2">
  {isCurrentUser  ? "My Posts" : "Posts"}
</h3>

    {isCurrentUser && (
      <Link
        to="/create-post"
        className="text-3xl text-white bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 transition"
        title="Create post"
      >
        +
      </Link>
    )}
  </div>
  {loading ? (
    <p className="text-gray-600">Loading posts...</p>
  ) : error ? (
    <p className="text-red-500 font-semibold">{error}</p>
  ) : posts.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12">
      <i className="fas fa-clipboard-list text-9xl text-gray-400 mb-4"></i>
      <p className="text-gray-600 text-xl">No posts available</p>
    </div>
  ) : (
    <div
      className="space-y-4"
      style={{
        flexGrow: 1,
        marginBottom: '10px',
      }}
    >
      {paginatedPosts.map((post) => (
        <PostPreview 
          key={post.id} 
          post={post} 
          onPostDelete={(postId) => handlePostDelete(postId)} 
        />
      ))}
    </div>
  )}
  {posts.length > postsPerPage && (
  <div className="flex justify-center mt-4" style={{ marginTop: 'auto' }}>
    
    {currentPagePosts > 1 && (
      <button
        onClick={() => setCurrentPagePosts(currentPagePosts - 1)}
        className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
      >
        &laquo;
      </button>
    )}
    {Array.from({ length: totalPostPages }, (_, i) => i + 1)
      .slice(
        Math.max(0, currentPagePosts - 3),
        Math.min(totalPostPages, currentPagePosts + 2)
      )
      .map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPagePosts(page)}
          className={`px-4 py-2 mx-1 rounded-lg ${
            currentPagePosts === page
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-800'
          } hover:bg-gray-700 hover:text-white`}
        >
          {page}
        </button>
      ))}
    {currentPagePosts < totalPostPages && (
      <button
        onClick={() => setCurrentPagePosts(currentPagePosts + 1)}
        className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
      >
        &raquo;
      </button>
    )}
  </div>
  )}
</section>


{/* Saved Posts Section */}
{isCurrentUser && (
  <section
    className="bg-white p-6 rounded-3xl shadow-lg flex flex-col justify-between"
    style={{ height: '1600px' }}
  >
    <div>
      <h3 className="text-2xl font-semibold pb-2 mb-4">Saved Posts</h3>
      
      {loading ? (
        <p className="text-gray-600">Loading saved posts...</p>
      ) : error ? (
        <p className="text-red-500 font-semibold">{error}</p>
      ) : savedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <i className="fas fa-clipboard-list text-9xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-xl">No saved posts</p>
        </div>
      ) : (
        <div
          className="space-y-4 flex-grow"
          style={{
            maxHeight: 'calc(100% - 60px)',
          }}
        >
          {paginatedSavedPosts.map((post) => (
            <PostPreview key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
    {savedPosts.length > postsPerPage && (
      <div className="flex justify-center mt-4">
        {currentPageSavedPosts > 1 && (
          <button
            onClick={() => setCurrentPageSavedPosts(currentPageSavedPosts - 1)}
            className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
          >
            &laquo;
          </button>
        )}
        {Array.from({ length: totalSavedPostPages }, (_, i) => i + 1)
          .slice(
            Math.max(0, currentPageSavedPosts - 3),
            Math.min(totalSavedPostPages, currentPageSavedPosts + 2)
          )
          .map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPageSavedPosts(page)}
              className={`px-4 py-2 mx-1 rounded-lg ${
                currentPageSavedPosts === page
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-800'
              } hover:bg-gray-700 hover:text-white`}
            >
              {page}
            </button>
          ))}
        {currentPageSavedPosts < totalSavedPostPages && (
          <button
            onClick={() => setCurrentPageSavedPosts(currentPageSavedPosts + 1)}
            className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
          >
            &raquo;
          </button>
        )}
      </div>
    )}
  </section>
)}
            </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
        </div>
    );
};

export default ProfilePage;
