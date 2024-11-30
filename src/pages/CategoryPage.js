import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import PostPreview from '../components/PostPreview';
import { fetchSavedPosts } from '../redux/actions/postActions';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [posts, setPosts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const savedPosts = useSelector((state) => state.posts.savedPosts);
  const dispatch = useDispatch();

  const updatePostInState = (updatedPost) => {
    setPosts((prevPosts) =>
      (Array.isArray(prevPosts) ? prevPosts : []).map((post) =>
        post.id === updatedPost.id ? { ...post, ...updatedPost } : post
      )
    );
  };

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/categories/${categoryId}/posts`);
        const fetchedPosts = response.data.posts?.posts || [];
        setPosts(fetchedPosts);
        setCategoryName(response.data.categoryName || 'Unknown');
        setCategoryDescription(response.data.posts?.categoryDescription || 'No description available.');
      } catch (err) {
        console.error('Ошибка при загрузке постов категории:', err);
        setError('Не удалось загрузить данные. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryPosts();
    dispatch(fetchSavedPosts());
  }, [categoryId, dispatch]);

  useEffect(() => {
    setPosts((prevPosts) =>
      (Array.isArray(prevPosts) ? prevPosts : []).map((post) => ({
        ...post,
        is_saved: savedPosts.some((savedPost) => savedPost.id === post.id),
      }))
    );
  }, [savedPosts]);

  const handleReactionUpdate = (postId, updatedData) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, ...updatedData } : post
      )
    );
  };
  
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-800"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-16 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-8 border-t-4 border-gray-800 animate-fade-in flex flex-col min-h-[600px]">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center tracking-wide">
          {categoryName}
        </h1>
        <p className="text-gray-600 text-center text-lg italic mb-8">
          {categoryDescription}
        </p>
        <div className="flex-grow">
          {currentPosts.length > 0 ? (
            <div className="space-y-8">
              {currentPosts.map((post) => (
                <PostPreview
  key={post.id}
  post={post}
  onLikeUpdate={updatePostInState}
  onSaveUpdate={updatePostInState}
  onReactionUpdate={(updatedData) => handleReactionUpdate(post.id, updatedData)}
/>

              ))}
            </div>
          ) : (
            <p className="text-gray-600 mt-8 text-center text-lg">
              No posts found in this category.
            </p>
          )}
        </div>
        {/* Пагинация */}
        {posts.length > postsPerPage && (
        <div className="flex justify-center mt-6">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
            >
              &laquo;
            </button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 mx-1 rounded-lg ${
                currentPage === page
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-800'
              } hover:bg-gray-700 hover:text-white`}
            >
              {page}
            </button>
          ))}
          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
            >
              &raquo;
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
