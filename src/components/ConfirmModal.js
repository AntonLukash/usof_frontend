import React from 'react';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal">
            <div className="modal-content">
                <h3>{message}</h3>
                <button onClick={onConfirm} className="delete-button">Delete</button>
                <button onClick={onCancel} className="cancel-button">Cancel</button>
            </div>
        </div>
    );
};

export default ConfirmModal;
