import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/actions/authActions';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

let updateAllPosts = null;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.posts);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]); 
  const [filteredPosts, setFilteredPosts] = useState([]); 
  const [allPosts, setAllPosts] = useState([]); 
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setAllPosts(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке постов:', error);
    }
  };
  
  updateAllPosts = fetchPosts;

  const handleLogout = () => {
    if (user && user.login) {
      dispatch(logout(user.login));
      if (updateAllPosts) {
        updateAllPosts();
      }
      navigate('/login');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() !== '') {
      const results = allPosts.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase().trim())
      );
      setFilteredPosts(results);
    } else {
      setFilteredPosts([]);
    }
  };

  const addNewPost = (newPost) => {
    setAllPosts((prevPosts) => [newPost, ...prevPosts]);
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
  

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
      <div className="flex items-center space-x-4">
      <svg
  onClick={() => navigate('/')}
  width="40"
  height="40"
  viewBox="0 0 100 100"
  xmlns="http://www.w3.org/2000/svg"
  className="logo cursor-pointer"
>
  <g transform="translate(50,50)">
    <circle cx="0" cy="-30" r="10" fill="black" />
    <circle cx="30" cy="0" r="10" fill="black" />
    <circle cx="0" cy="30" r="10" fill="black" />
    <circle cx="-30" cy="0" r="10" fill="black" />
    <circle cx="0" cy="0" r="6" fill="black" />
  </g>
</svg>

        <h1 
          className="text-2xl font-bold cursor-pointer text-gray-800 "
          onClick={() => navigate('/')}
        >
          InquiNet
        </h1>
        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          
        {isAuthenticated && (
  <div className="flex items-center space-x-4">
        {/*<Link to={`/profile/${user.id}`} className="text-gray-600 hover:text-black">Profile</Link>*/}
    {/*<Link to={`/profile/${user.id}`} className="text-gray-600 hover:text-black">Saved posts</Link>*/}
    {user?.role === 'admin' && <Link to="/users" className="px-4 py-2 text-sm font-semibold text-gray-800 border border-gray-400 rounded-md hover:bg-gray-200 transition duration-300">Users</Link>}
    {user?.role === 'admin' && (
  <a 
    href="http://localhost:5000/admin" 
    target="_blank" 
    rel="noopener noreferrer"
    className="px-4 py-2 text-sm font-semibold text-gray-800 border border-gray-400 rounded-md hover:bg-gray-200 transition duration-300"
    title="Admin Panel"
  >
    Admin Panel
  </a>
)}

  </div>
)}
        </nav>
      </div>

     <div className="flex-1 mx-4 relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
        />
        {isSearchActive && searchQuery && (
          <div className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-lg p-4 max-h-60 overflow-y-auto z-50">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="p-4 border-b border-gray-200 hover:bg-gray-100 rounded-md flex items-center space-x-4"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={`http://localhost:5000/${post.author_avatar || 'uploads/avatars/default.png'}`}
                      alt="Author Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-gray-800 font-semibold">{post.title}</h4>
                    <p className="text-gray-500 text-sm"style={{ whiteSpace: 'pre-line' }}>
  {truncateTextMultiLine(post.content, 50, 2)}</p>
                    <span className="text-xs text-gray-500">By {post.author} </span>
                    <span className="text-xs text-gray-400">
  {new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(post.publish_date))}
</span>

                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No posts found</p>
            )}
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center text-center">
        <span className="text-gray-700 font-semibold">{user?.login}</span>
        <span className="text-xs text-gray-500 border border-gray-300 rounded-full px-2 py-0.5 mt-1">
          {user?.role}
        </span>
      </div>
            <Link to={`/profile/${user.id}`}>
              <img
                src={`http://localhost:5000/${user?.profile_picture || 'uploads/avatars/default.png'}`}
                alt="Avatar"
                className="w-12 h-12 rounded-full border border-gray-300"
              />
            </Link>
            <button 
  onClick={handleLogout} 
  className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition flex items-center justify-center"
  title="Logout"
>
  <i className="fas fa-sign-out-alt text-xl"></i>
</button>

          </div>
        ) : (
          <div className="flex items-center space-x-4">
  <button
    onClick={() => navigate('/login')}
    className="flex items-center px-6 py-2 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300 space-x-2"
  >
    <i className="fas fa-sign-in-alt"></i>
    <span>Log In</span>
  </button>

  <button
    onClick={() => navigate('/register')}
    className="flex items-center px-6 py-2 bg-white text-gray-800 border border-gray-300 rounded-md shadow-md hover:bg-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 space-x-2"
  >
    <i className="fas fa-user-plus"></i>
    <span>Register</span>
  </button>
</div>


        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-gray-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg py-4 md:hidden">
          <nav className="flex flex-col items-center space-y-4">
            <Link to="/" className="text-gray-600 hover:text-black" onClick={toggleMenu}>Home</Link>
            {isAuthenticated && (
              <>
                <Link to={`/profile/${user.id}`} className="text-gray-600 hover:text-black" onClick={toggleMenu}>Profile</Link>
                {user?.role === 'admin' && <Link to="/users" className="text-gray-600 hover:text-black" onClick={toggleMenu}>Users</Link>}
                {user?.role === 'admin' &&<a href="http://localhost:5000/admin" className="text-gray-600 hover:text-black" onClick={toggleMenu}>Admin Panel</a>}
              </>
            )}
            <div className="border-t border-gray-200 w-full"></div>
            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="text-gray-600 hover:text-black"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-black" onClick={toggleMenu}>Log In</Link>
                <Link to="/register" className="text-gray-600 hover:text-black" onClick={toggleMenu}>Register</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export { updateAllPosts };
export default Header;
