import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { initializeAuth } from './redux/actions/authActions';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPostPage from './pages/EditPostPage';
import UserManagement from './pages/UserManagement';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import CategoryPage from './pages/CategoryPage';
import './App.css';
import { getAllPosts } from './redux/actions/postActions';
import Footer from './components/Footer'; 

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <div id="root">
  <Header />
  <div className="content">
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/password-reset/:token" element={<ChangePasswordPage />} />
      <Route path="/api/auth/confirm-email/:token" element={<EmailConfirmationPage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/posts/:postId" element={<PostDetailPage />} />
      <Route
        path="/profile/:id"
        element={
         
            <ProfilePage />

        }
      />
      <Route
        path="/create-post"
        element={
          <PrivateRoute>
            <CreatePostPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-post/:postId"
        element={
          <PrivateRoute>
            <EditPostPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <UserManagement />
          </PrivateRoute>
        }
      />
      
    </Routes>
  </div>
  <Footer />
</div>

  );
};

export default App;
