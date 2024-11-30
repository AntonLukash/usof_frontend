import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllPosts, fetchSavedPosts } from '../redux/actions/postActions';
import PostPreview from '../components/PostPreviewHomePage';

const HomePage = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const [sortOrder, setSortOrder] = useState('date');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const indexOfLastPost = currentPage * postsPerPage;
const indexOfFirstPost = indexOfLastPost - postsPerPage;

const totalPages = Math.ceil(allPosts.length / postsPerPage);
const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

useEffect(() => {
  setCurrentPage(1);
}, [allPosts]);

const maxVisiblePages = 5;
const [visiblePageNumbers, setVisiblePageNumbers] = useState([]);

useEffect(() => {
  const newVisiblePages = [];
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      newVisiblePages.push(i);
    }
  } else {
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = endPage - maxVisiblePages + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      newVisiblePages.push(i);
    }
  }
  setVisiblePageNumbers(newVisiblePages);
}, [totalPages, currentPage]);


const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
};

const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

const filteredPosts = allPosts
  .filter((post) => {
    if (selectedCategory) {
      if (post.categories) {
        const match = post.categories
          .split(',')
          .some((category) =>
            category.toLowerCase().trim().includes(selectedCategory.toLowerCase().trim())
          );
        return match;
      }
      return false;
    }

    if (startDate || endDate) {
      const postDate = new Date(post.publish_date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return postDate >= start && postDate <= end;
      } else if (start) {
        return postDate >= start;
      } else if (end) {
        return postDate <= end;
      }
    }

    return true;
  })
  .sort((a, b) => {
    if (sortOrder === 'popularity') {
      const aPopularity = (a.like_count || 0) - (a.dislike_count || 0);
      const bPopularity = (b.like_count || 0) - (b.dislike_count || 0);
      return bPopularity - aPopularity;
    } else if (sortOrder === 'date') {
      return new Date(b.publish_date) - new Date(a.publish_date);
    }
    return 0;
  });

const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    
    
    fetchAllPosts();
    if (isAuthenticated) {
      dispatch(fetchSavedPosts());
    }
  }, [sortOrder, selectedCategory]);
  const [userRating, setUserRating] = useState(user?.rating || 0); 

  useEffect(() => {
    fetchCategories();
  }, [token]);
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
  
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchPopularCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories/popular', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch popular categories');
      }
  
      const data = await response.json();
      setPopularCategories(data);
    } catch (error) {
      console.error('Error fetching popular categories:', error);
    }
  };
  
  useEffect(() => {
    fetchPopularCategories();
  }, [token]);
  
   const updateUserRating = (increment) => {
    setUserRating((prevRating) => prevRating + increment);
  };

  const fetchPosts = () => {
    const filters = {
      sort: sortOrder,
      category: selectedCategory,
      dateStart: startDate,
      dateEnd: endDate,
    };
    dispatch(getAllPosts(filters));
  };
  
  const fetchAllPosts = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/posts', { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      setAllPosts(data);
    } catch (error) {
      console.error('Error loading all posts:', error);
    }
};

  
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };
  const handleResetFilter = () => {
    setSortOrder('date');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    dispatch(getAllPosts());
  };
  const getCategoryIcon = (categoryTitle) => {
    switch (categoryTitle.toLowerCase()) {
      case "sports":
        return "fa-football";
      case "entertainment":
        return "fa-film";
      case "education":
        return "fa-graduation-cap";
      case "technology":
        return "fa-laptop-code";
      case "health":
        return "fa-heartbeat";
      default:
        return "fa-tags";
    }
  };
  
  const handleReactionUpdate = (updatedPost) => {
    setAllPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === updatedPost.id ? { ...post, ...updatedPost } : post
      )
    );
  };
  
  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <aside className="w-full md:w-1/5 bg-white shadow-lg rounded-lg p-4 md:mr-6 mb-4 md:mb-0">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-lg font-bold">Filters and sorting</h2>
    {/* Кнопка добавления поста */}
    {user && (
    <Link
      to="/create-post"
      className="bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 transition text-xl font-bold"
      title="Add post"
    >
      +
    </Link>
    )}
  </div>

  {/* Фильтры */}
  <div className="filter-section mb-6">
    <div className="mb-4">
      <label className="block text-gray-600 font-medium mb-2">Categories:</label>
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="w-full border border-gray-300 rounded-lg p-3 shadow-sm bg-gray-50 focus:outline-none focus:border-gray-500 transition duration-300 ease-in-out"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.title}>
            {category.title}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-gray-600 font-medium mb-2">Sort by:</label>
      <select
        value={sortOrder}
        onChange={handleSortChange}
        className="w-full border border-gray-300 rounded-lg p-3 shadow-sm bg-gray-50 focus:outline-none focus:border-gray-500 transition duration-300 ease-in-out"
      >
        <option value="date">By date</option>
        <option value="popularity">By popularity</option>
      </select>
    </div>

    {/* Диапазон дат */}
    <div className="flex items-end space-x-4 mb-4">
      <div className="flex flex-col w-1/2">
        <label className="text-gray-600 font-medium">Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm bg-gray-50"
        />
      </div>
      <div className="flex flex-col w-1/2">
        <label className="text-gray-600 font-medium">End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm bg-gray-50"
        />
      </div>
    </div>

    {/* Кнопки фильтрации */}
    <div className="flex justify-between mt-4">
      <button
        onClick={fetchPosts}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition w-1/2 mr-2"
      >
        Apply
      </button>
      <button
        onClick={handleResetFilter}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition w-1/2"
      >
        Reset
      </button>
    </div>
  </div>

  {/* Популярные категории */}
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">Popular Categories</h3>
    <ul>
      {popularCategories.map((category, index) => (
        <li key={category.id} className="mb-3">
          <button
            onClick={() => handleCategoryClick(category.title)}
            className="flex items-center gap-3 w-full text-left py-3 px-5 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm transition duration-300 ease-in-out"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-white rounded-full shadow-md relative">
              <i className={`fa-solid ${getCategoryIcon(category.title)} text-lg`}></i>
              {index === 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-crown"></i>
                </div>
              )}
            </div>
            {/* Текст категории */}
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{category.title}</p>
              <div className="flex items-center justify-start text-gray-500 text-sm mt-1">
                <i className="fa-solid fa-clipboard mr-1"></i>
                <span>{category.post_count}</span>
              </div>
            </div>

            <i className="fa-solid fa-chevron-right text-gray-500 text-lg"></i>
          </button>
        </li>
      ))}
    </ul>
  </div>
</aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
  {loading ? (
    <p className="text-center text-gray-600">Loading posts...</p>
  ) : error ? (
    <p className="text-center text-red-500">{error}</p>
  ) : (
    <>
      {/* Контейнер с постами */}
      <div className="flex flex-col justify-between flex-grow">
        <div className="grid gap-4">
          {currentPosts.map((post) => (
            <PostPreview key={post.id} post={post} setAllPosts={setAllPosts} handleReactionUpdate={handleReactionUpdate}  />

          ))}
        </div>

        {/* Кнопки пагинации */}
        {filteredPosts.length >= postsPerPage && (
          <div className="flex justify-center mt-4">
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
              >
                &laquo;
              </button>
            )}
            {visiblePageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`px-4 py-2 mx-1 rounded-lg ${
                  currentPage === number
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-800'
                } hover:bg-gray-700 hover:text-white`}
              >
                {number}
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
              >
                &raquo;
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )}
</main>
    </div>
  );
};

export default HomePage;
