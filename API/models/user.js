const createConnection = require('../db');

const getAllUsers = async () => {
    const db = await createConnection();
    const [results] = await db.execute('SELECT id, login, email, role, profile_picture FROM users');
    await db.end();
    return results;
};

const getUserById = async (id) => {
    const db = await createConnection();
    const [results] = await db.execute('SELECT id, full_name, login, email, role, profile_picture, rating FROM users WHERE id = ?', [id]);
    await db.end();
    return results[0] || null;
};

const getUserByLogin = async (login) => {
    const db = await createConnection();
    const [results] = await db.execute('SELECT * FROM users WHERE login = ?', [login]);
    await db.end();
    return results[0] || null;
};

const getUserByEmail = async (email) => {
    const db = await createConnection();
    const [results] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    await db.end();
    return results[0] || null;
};

const getUserByLoginOrEmail = async (login = null, email = null) => {
    if (login === null && email === null) {
        throw new Error('Both login and email cannot be null');
    }
    const db = await createConnection();
    const [results] = await db.execute('SELECT * FROM users WHERE login = ? OR email = ?', [login, email]);
    await db.end();
    return results[0] || null;
};

const createUser = async (userData) => {
    const db = await createConnection();
    const { login, password, email, role = 'user' } = userData;
    const [result] = await db.execute(
        'INSERT INTO users (login, password, email, role) VALUES (?, ?, ?, ?)',
        [login, password, email, role]
    );
    await db.end();
    return result;
};

const updateUser = async (userId, updateData) => {
    const db = await createConnection();
    
    const fields = [];
    const values = [];

    if (updateData.login) {
        fields.push('login = ?');
        values.push(updateData.login);
    }
    if (updateData.email) {
        fields.push('email = ?');
        values.push(updateData.email);
    }
    if (updateData.password) {
        fields.push('password = ?');
        values.push(updateData.password);
    }

    if (fields.length === 0) {
        await db.end();
        throw new Error('No fields to update');
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(userId);

    const [result] = await db.execute(query, values);
    await db.end();
    return result;
};

const updateUserAvatar = async (userId, avatarPath) => {
    const db = await createConnection();
    const [result] = await db.execute('UPDATE users SET profile_picture = ? WHERE id = ?', [avatarPath, userId]);
    await db.end();
    return result;
};

const deleteUser = async (userId) => {
    const db = await createConnection();
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    await db.end();
    return result;
};

const savePasswordResetToken = async (userId, tokenHash, expires) => {
    const db = await createConnection();
    await db.execute('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [tokenHash, expires, userId]);
    await db.end();
};

const getUserByPasswordResetToken = async (tokenHash) => {
    const db = await createConnection();
    const [results] = await db.execute('SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()', [tokenHash]);
    await db.end();
    return results[0] || null;
};

const updateUserPassword = async (userId, newPassword) => {
    const db = await createConnection();
    const [result] = await db.execute('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
    await db.end();
    return result;
};

const clearPasswordResetToken = async (userId) => {
    const db = await createConnection();
    await db.execute('UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = ?', [userId]);
    await db.end();
};

const confirmUserEmail = async (userId) => {
    const db = await createConnection();
    const [result] = await db.execute('UPDATE users SET email_confirmed = 1 WHERE id = ?', [userId]);
    await db.end();
    return result;
};

const updateUserFullName = async (userId, fullName) => {
    const db = await createConnection();

    try {
        const query = `UPDATE users SET full_name = ? WHERE id = ?`;
        const [result] = await db.execute(query, [fullName, userId]);

        return result;
    } catch (err) {
        console.error('Error updating full name:', err);
        throw new Error('Error updating full name');
    } finally {
        await db.end();
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    getUserByLogin,
    getUserByEmail,
    getUserByLoginOrEmail,
    createUser,
    updateUser,
    updateUserAvatar,
    deleteUser,
    savePasswordResetToken,
    getUserByPasswordResetToken,
    updateUserPassword,
    clearPasswordResetToken,
    confirmUserEmail,
    updateUserFullName,
};
