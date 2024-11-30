import React, { useState } from 'react';

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [login, setLogin] = useState(user.login);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');

  const handleSave = () => {
    const updatedData = {};
    if (login) updatedData.login = login;
    if (email) updatedData.email = email;
    if (password) updatedData.password = password;

    onSave(updatedData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit profile</h2>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Login"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (leave blank to keep current)"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditProfileModal;
