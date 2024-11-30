import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';
import { updateAllPosts } from '../components/Header';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [image, setImage] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setAllCategories(response.data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || categories.length === 0) {
        setAlertMessage("Fill in all fields and select at least one category");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('categories', JSON.stringify(categories));

        images.forEach((image) => {
          formData.append('images', image);
      });     

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        const response = await axios.post('http://localhost:5000/api/posts', formData, config);


        await updateAllPosts();

        setAlertMessage("Post successfully created");
        setTimeout(() => {
            navigate(-1);
        }, 2000);
    } catch (err) {
        console.error("Error while creating post:", err);
        setAlertMessage("Failed to create post");
    }
};




  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value, 10);
    setCategories((prevCategories) =>
      prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId]
    );
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 4) {
      setAlertMessage('You can upload a maximum of 4 images.');
      return;
    }
    setImages(selectedFiles);
  };

  return (
    <div className="create-post-page">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 max-w-screen-lg min-w-[350px] border border-gray-300 rounded-lg"
          rows="3"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full px-4 py-2 max-w-screen-lg min-w-[350px] border border-gray-300 rounded-lg"
          rows="7"
        ></textarea>

        <div className="categories">
          <h3 className="text-lg font-semibold">Select Categories</h3>
          {allCategories.map((category) => (
            <label
              key={category.id}
              style={{ display: 'block', marginBottom: '5px' }}
            >
              <input
                type="checkbox"
                value={category.id}
                checked={categories.includes(category.id)}
                onChange={handleCategoryChange}
              />
              {category.title}
            </label>
          ))}
        </div>

        <div className="image-upload">
  <label
    htmlFor="images"
    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-gray-700 transition"
  >
    <i className="fas fa-upload mr-2"></i> Upload Images (Max 4)
  </label>
  <input
    id="images"
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageChange}
    className="hidden"
  />
  {images.length > 0 && (
    <p className="mt-2 text-sm text-gray-600">
      {images.map((img) => img.name).join(', ')}
    </p>
  )}
</div>


        <button
          type="submit"
          className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
        >
          Create
        </button>
      </form>

      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </div>
  );
};

export default CreatePostPage;
