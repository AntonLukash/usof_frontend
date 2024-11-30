import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Alert from '../components/Alert';
import { FaImage } from 'react-icons/fa'; 
const EditPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('active');
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}`);
        const post = response.data;

        setTitle(post.title);
        setContent(post.content);
        setStatus(post.status);
        setCurrentImages(post.images || []);
        setIsAuthor(post.author_id === user.id);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке поста:', err);
        setError('Не удалось загрузить пост.');
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user.id]);

  const handleRemoveImage = (index) => {
    setCurrentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('status', status);
    if (isAuthor) formData.append('content', content);

    formData.append('currentImages', JSON.stringify(currentImages));

    newImages.forEach((image) => {
        formData.append('images', image);
    });

    try {
        await axios.patch(
            `http://localhost:5000/api/posts/${postId}`,
            formData,
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
        navigate(-1);
    } catch (err) {
        console.error('Ошибка при обновлении поста:', err);
        setAlertMessage('Не удалось обновить пост.');
    }
};


const handleImageChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  const totalImages = currentImages.length + selectedFiles.length;

  if (totalImages > 4) {
    setAlertMessage('You can upload a maximum of 4 images.');
    return;
  }

  setNewImages(selectedFiles);
};


  if (loading) return <p className="text-center text-gray-500">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex justify-center bg-gray-10 pt-10 pb-20">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Edit post</h2>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div className="relative">
            <label className="block text-gray-600 font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 max-w-screen-lg min-w-[400px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 transition"
              rows="7"
            />
          </div>

          {isAuthor && (
            <div className="relative">
              <label className="block text-gray-600 font-semibold mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full h-96 px-4 py-2 max-w-screen-lg min-w-[400px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 transition resize-none"
              />
            </div>
          )}
{isAuthor && (
  <div className="relative flex justify-center">
    <div>
      <label className="block text-gray-600 font-semibold mb-1 text-center">
        Current Images
      </label>
      <div className="flex flex-wrap justify-center gap-4">
        {currentImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 p-4">
            <FaImage className="text-4xl mb-2" />
            <p>No images added yet</p>
          </div>
        ) : (
          currentImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={`http://localhost:5000${image}`}
                alt={`Current image ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedImage(`http://localhost:5000${image}`)}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 bg-gray-600 text-white text-xs rounded-full p-1 hidden group-hover:block"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

{/* Модальное окно */}
{selectedImage && isAuthor &&(
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
    onClick={() => setSelectedImage(null)}
  >
    <div className="relative">
      <img
        src={selectedImage}
        alt="Full Size"
        className="max-w-full max-h-full rounded-lg shadow-lg"
      />
    </div>
  </div>
)}

{isAuthor && (
  <div className="relative mt-4 flex flex-col items-center">
    <label
      htmlFor="newImages"
      className="flex items-center justify-center w-60 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-gray-700 transition"
      style={{ minWidth: "15rem" }}
    >
      <i className="fas fa-upload mr-2"></i> Upload Images (Max 4)
    </label>
    <input
      id="newImages"
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="hidden"
    />
    {newImages.length > 0 && (
      <div className="mt-3 w-full">
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
          {newImages.map((file, index) => (
            <li key={index} className="flex justify-between items-center truncate" title={file.name}>
              {file.name}
              <button
                type="button"
                onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== index))}
                className="ml-2 bg-gray-400 text-white text-xs rounded-full p-1 hover:bg-gray-500 transition"
                title="Remove image"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}





          <div className="relative">
            <label className="block text-gray-600 font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 transition"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => navigate(`/posts/${postId}`)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </div>
  );
};

export default EditPostPage;
