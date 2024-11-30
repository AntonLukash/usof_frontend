const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const EMAIL_SECRET = 'email_secret_verify';
const EMAIL_FROM = 'antonlukash05@gmail.com';
const EMAIL_PASSWORD = 'yqds spla qmmv zape';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_FROM,
        pass: EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});


const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error getting users' });
    }
};

const getUserById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userModel.getUserById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error while retrieving user data' });
    }
};

const createUser = async (req, res) => {
    const { login, password, passwordConfirmation, email, role } = req.body;

    if (password !== passwordConfirmation) {
        return res.status(400).json({ error: 'Passwords dont match' });
    }

    try {
        const existingUser = await userModel.getUserByLoginOrEmail(login, email);
        if (existingUser) {
            return res.status(400).json({ error: 'A user with the same login or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { login, password: hashedPassword, email, role: role || 'user' };

        const result = await userModel.createUser(newUser);

        const emailToken = jwt.sign({ userId: result.insertId, email }, EMAIL_SECRET, { expiresIn: '1h' });

        const url = `http://localhost:3000/api/auth/confirm-email/${emailToken}`;

        try {
            await transporter.sendMail({
                from: EMAIL_FROM,
                to: email,
                subject: 'Please confirm your email',
                html: `
                    <html>
                        <body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #fff; color: #333;">
                            <div style="width: 100%; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #333; font-size: 28px; margin: 0;">Email Confirmation</h1>
                                    <p style="font-size: 18px; color: #555; margin-top: 5px;">Welcome to our service!</p>
                                </div>
                                <div style="text-align: center; font-size: 16px; line-height: 1.5; color: #333; margin-bottom: 30px;">
                                    <p style="margin-bottom: 20px;">Thank you for registering with us! Please confirm your email address by clicking the button below:</p>
                                    <a href="${url}" style="display: inline-block; background-color: #333; color: white; padding: 15px 30px; font-size: 16px; text-decoration: none; border-radius: 5px; transition: background-color 0.3s ease;">
                                        Confirm Your Email
                                    </a>
                                </div>
                                <div style="text-align: center; font-size: 14px; color: #777;">
                                    <p>If you did not register for an account, please ignore this email.</p>
                                    <p>Best regards,</p>
                                    <p><strong>InquiNet</strong></p>
                                </div>
                                <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
                                    <p style="margin: 0;">This email was sent from an automated service. Please do not reply.</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `,
                headers: { 'Content-Type': 'text/html; charset=UTF-8' }
            });
            
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            return res.status(500).json({ error: 'Failed to send email' });
        }

        res.status(201).json({ message: 'User successfully created. Check your email to confirm.' });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Error creating user' });
    }
};


const updateAvatar = async (req, res) => {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Avatar was not loaded' });
    }

    const avatarPath = path.join('uploads', 'avatars', file.filename);

    try {
        await userModel.updateUserAvatar(userId, avatarPath);
        res.json({ message: 'Avatar successfully updated', avatarPath });
    } catch (err) {
        res.status(500).json({ error: 'Avatar update error' });
    }
};

const updateUserData = async (req, res) => {
    const userId = req.params.userId;
    const { login, email, password } = req.body;

    try {
        const user = await userModel.getUserById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updateData = {};

        if (login) updateData.login = login;
        if (email) updateData.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await userModel.updateUser(userId, updateData);
        res.json({ message: 'User data has been successfully updated' });
    } catch (err) {
        console.error('Error updating user data:', err);
        res.status(500).json({ error: 'Error updating user data' });
    }
};


const deleteUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const result = await userModel.deleteUser(userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

const updateUserFullName = async (req, res) => {
    const userId = req.params.userId;
    const { full_name } = req.body;

    if (!full_name) {
        return res.status(400).json({ error: 'Full name is required' });
    }

    try {
        const user = await userModel.getUserById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await userModel.updateUserFullName(userId, full_name);
        res.json({ message: 'Full name has been successfully updated', full_name });
    } catch (err) {
        console.error('Error updating full name:', err);
        res.status(500).json({ error: 'Error updating full name' });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateAvatar,
    updateUserData,
    deleteUser,
    updateUserFullName,
};
