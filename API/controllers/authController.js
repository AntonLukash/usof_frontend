const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const nodemailer = require('nodemailer');

const JWT_SECRET = 'secret_key_verify';
const JWT_EXPIRES_IN = '1h';
const EMAIL_SECRET = 'email_secret_verify';
const EMAIL_FROM = 'antonlukash05@gmail.com';
const EMAIL_PASSWORD = 'yqds spla qmmv zape';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_FROM,
        pass: EMAIL_PASSWORD,
    },
});

const sendEmail = (to, subject, body) => {
    const mailOptions = {
        from: EMAIL_FROM,
        to: to,
        subject: subject,
        html: body,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info.response);
            }
        });
    });
};

const sendPostEmail = async (req, res) => {
    const { email, subject, body } = req.body;

    try {
        // Отправляем email с содержимым поста
        const response = await sendEmail(email, subject, body);
        res.status(200).json({ message: 'Email sent successfully', response });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send email', error });
    }
};
  
const register = async (req, res) => {
    const { login, password, passwordConfirmation, email } = req.body;

    if (password !== passwordConfirmation) {
        return res.status(400).json({ error: 'Passwords dont match' });
    }

    try {
        const existingUser = await userModel.getUserByLoginOrEmail(login || null, email || null);
        if (existingUser) {
    const existingField = existingUser.login === login ? 'login' : 'email';
    return res.status(400).json({ error: `A user with the same ${existingField} already exists` });
}

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = { login, password: hashedPassword, email };

        const result = await userModel.createUser(newUser);

        const emailToken = jwt.sign({ userId: result.insertId, email }, EMAIL_SECRET, { expiresIn: '1h' });

        const url = `http://localhost:3000/api/auth/confirm-email/${emailToken}`;

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

        res.status(201).json({ message: 'The user is registered. Check your email to confirm.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


const confirmEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, EMAIL_SECRET);
        await userModel.confirmUserEmail(decoded.userId);
        res.json({ message: 'Email has been successfully confirmed. You can now log in.' });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

const login = async (req, res) => {
    const { login, email, password } = req.body;

    try {
        const user = await userModel.getUserByLoginOrEmail(login || null, email || null);
       
        if (!user) {
            return res.status(400).json({ error: 'Invalid login or password' });
        }

        if (!user.email_confirmed) {
            return res.status(403).json({ error: 'Confirm your email to login' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid login or password' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({
            message: "Login successful",
            token,
            user: { // Добавьте данные пользователя
              id: user.id,
              login: user.login,
              email: user.email,
              avatar: user.profile_picture,
              rating: user.rating,
              role: user.role,
              
            },
          });
    } catch (error) {
        res.status(500).json({ error: 'An unexpected server error occurred. Please try again later.' });

    }
};

const logout = (req, res) => {
    res.json({ message: 'Exit successful' });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User with this email was not found' });
        }

        const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `http://localhost:3000/password-reset/${resetToken}`;

        await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <html>
                    <body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #fff; color: #333;">
                        <div style="width: 100%; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #333; font-size: 28px; margin: 0;">Password Reset</h1>
                                <p style="font-size: 18px; color: #555; margin-top: 5px;">We received a request to reset your password.</p>
                            </div>
                            <div style="text-align: center; font-size: 16px; line-height: 1.5; color: #333; margin-bottom: 30px;">
                                <p style="margin-bottom: 20px;">To reset your password, please click the button below:</p>
                                <a href="${resetUrl}" style="display: inline-block; background-color: #333; color: white; padding: 15px 30px; font-size: 16px; text-decoration: none; border-radius: 5px; transition: background-color 0.3s ease;">
                                    Reset Your Password
                                </a>
                            </div>
                            <div style="text-align: center; font-size: 14px; color: #777;">
                                <p>If you did not request a password reset, please ignore this email.</p>
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
        
        

        res.json({ message: 'An email with a link to reset password has been sent' });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ error: 'Error sending email' });
    }
    
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.updateUserPassword(decoded.userId, hashedPassword);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Token is invalid or expired' });
    }
};

module.exports = {
    register,
    confirmEmail,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    sendEmail,
    sendPostEmail,
};

