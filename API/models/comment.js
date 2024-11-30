const db = require('../db');

const createComment = async (commentData) => {
    const { authorId, postId, content, parentId = null } = commentData;
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        'INSERT INTO comments (author_id, post_id, content, parent_id) VALUES (?, ?, ?, ?)',
        [authorId, postId, content, parentId]
    );
    await dbConnection.end();
    return result;
};

const getCommentsByPostId = async (postId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        `SELECT c.*, u.login AS author_login
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.post_id = ?
         ORDER BY COALESCE(c.parent_id, c.id), c.publish_date ASC`,
        [postId]
    );
    await dbConnection.end();
    return results;
};


const getCommentById = async (commentId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        'SELECT * FROM comments WHERE id = ?',
        [commentId]
    );
    await dbConnection.end();
    return results[0];
};

const getCommentLikes = async (commentId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        'SELECT * FROM likes WHERE entity_type = "comment" AND entity_id = ?',
        [commentId]
    );
    await dbConnection.end();
    return results;
};

const createCommentLike = async (commentId, authorId, type) => {
    const dbConnection = await db();
    const ratingChange = type === 'like' ? 1 : -1;

    const [existingLikes] = await dbConnection.execute(
        'SELECT * FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );
    if (existingLikes.length > 0) {
        await dbConnection.end();
        throw new Error('You have already liked or disliked this comment');
    }

    const [commentAuthor] = await dbConnection.execute(
        'SELECT author_id FROM comments WHERE id = ?',
        [commentId]
    );
    const commentAuthorId = commentAuthor[0].author_id;

    await dbConnection.execute(
        'INSERT INTO likes (entity_type, entity_id, author_id, type) VALUES ("comment", ?, ?, ?)',
        [commentId, authorId, type]
    );

    await dbConnection.execute(
        'UPDATE comments SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentId]
    );

    await dbConnection.execute(
        'UPDATE users SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentAuthorId]
    );

    await dbConnection.end();
};

const deleteCommentLike = async (commentId, authorId) => {
    const dbConnection = await db();

    const [likes] = await dbConnection.execute(
        'SELECT type FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );
    if (likes.length === 0) {
        await dbConnection.end();
        throw new Error('Like or dislike not found');
    }

    const ratingChange = likes[0].type === 'like' ? -1 : 1;

    const [commentAuthor] = await dbConnection.execute(
        'SELECT author_id FROM comments WHERE id = ?',
        [commentId]
    );
    const commentAuthorId = commentAuthor[0].author_id;

    await dbConnection.execute(
        'DELETE FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );

    await dbConnection.execute(
        'UPDATE comments SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentId]
    );

    await dbConnection.execute(
        'UPDATE users SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentAuthorId]
    );

    await dbConnection.end();
};


const updateComment = async (commentId, content) => {
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        'UPDATE comments SET content = ? WHERE id = ?',
        [content, commentId]
    );
    await dbConnection.end();
    return result;
};

const deleteComment = async (commentId) => {
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        'DELETE FROM comments WHERE id = ?',
        [commentId]
    );
    await dbConnection.end();
    return result;
};

const checkCommentLikeExists = async (commentId, authorId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        'SELECT * FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );
    await dbConnection.end();
    return results.length > 0;
};

const createOrUpdateCommentLike = async (commentId, authorId, type) => {
    const dbConnection = await db();

    const [existingLikes] = await dbConnection.execute(
        'SELECT type FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );

    const [commentAuthor] = await dbConnection.execute(
        'SELECT author_id FROM comments WHERE id = ?',
        [commentId]
    );
    const commentAuthorId = commentAuthor[0].author_id;

    if (existingLikes.length > 0) {
        if (existingLikes[0].type === type) {
            await dbConnection.end();
            throw new Error('Вы уже поставили такую реакцию на этот комментарий');
        }

        const ratingChange = type === 'like' ? 2 : -2;

        await dbConnection.execute(
            'UPDATE likes SET type = ? WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
            [type, commentId, authorId]
        );

        await dbConnection.execute(
            'UPDATE comments SET rating = rating + ? WHERE id = ?',
            [ratingChange, commentId]
        );

        await dbConnection.execute(
            'UPDATE users SET rating = rating + ? WHERE id = ?',
            [ratingChange, commentAuthorId]
        );
    } else {
        const initialRatingChange = type === 'like' ? 1 : -1;

        await dbConnection.execute(
            'INSERT INTO likes (entity_type, entity_id, author_id, type) VALUES ("comment", ?, ?, ?)',
            [commentId, authorId, type]
        );

        await dbConnection.execute(
            'UPDATE comments SET rating = rating + ? WHERE id = ?',
            [initialRatingChange, commentId]
        );

        await dbConnection.execute(
            'UPDATE users SET rating = rating + ? WHERE id = ?',
            [initialRatingChange, commentAuthorId]
        );
    }

    await dbConnection.end();
};

const updateCommentStatus = async (commentId, isActive) => {
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        'UPDATE comments SET is_active = ? WHERE id = ?',
        [isActive, commentId]
    );
    await dbConnection.end();
    return result;
};

module.exports = {
    createComment,
    getCommentsByPostId,
    getCommentById,
    getCommentLikes,
    createCommentLike,
    updateComment,
    deleteComment,
    deleteCommentLike,
    checkCommentLikeExists,
    createOrUpdateCommentLike,
    updateCommentStatus,
};
