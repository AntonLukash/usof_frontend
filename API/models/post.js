const createConnection = require('../db');

const getAllPosts = async ({ sort, category, dateStart, dateEnd}) => {
    const db = await createConnection();

    const orderBy = sort === 'date' ? 'p.publish_date' : 'p.rating';

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
        whereClause += ` AND p.id IN (
            SELECT pc.post_id
            FROM post_categories pc
            JOIN categories c ON pc.category_id = c.id
            WHERE c.title = ?
        )`;
        params.push(category);
    }

    if (dateStart && dateEnd) {
        whereClause += ' AND p.publish_date BETWEEN ? AND ?';
        params.push(dateStart, dateEnd);
    }

    const [results] = await db.execute(
        `SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.publish_date, 
            p.status, 
            p.rating, 
            u.login as author, 
            u.id as author_id, 
            u.profile_picture as author_avatar,
            GROUP_CONCAT(DISTINCT CONCAT(c.id, ':', c.title) SEPARATOR ', ') AS categories,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'like') AS like_count,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'dislike') AS dislike_count
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${orderBy} DESC`,
        params
    );

    await db.end();

    return results;
};

const getPostById = async (postId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT p.*, u.login as author, GROUP_CONCAT(c.title) as categories
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = ?
        GROUP BY p.id`,
        [postId]
    );
    await db.end();
    return results[0] || null;
};

const createPost = async (postData) => {
    const db = await createConnection();
    const { authorId, title, content, categories, images } = postData;
  
    const [result] = await db.execute(
      'INSERT INTO posts (author_id, title, content, status, images) VALUES (?, ?, ?, "active", ?)',
      [authorId, title, content, JSON.stringify(images)]
    );
  
    const postId = result.insertId;
  
    if (categories && categories.length > 0) {
      const categoryValues = categories.map((categoryId) => [postId, categoryId]);
      await db.query('INSERT INTO post_categories (post_id, category_id) VALUES ?', [categoryValues]);
    }
  
    await db.end();
    return result;
  };
  
  const updatePost = async (postId, postData) => {
    const db = await createConnection();
    const { title, content, categories, status, images } = postData;

    let query = 'UPDATE posts SET ';
    const fields = [];
    const values = [];

    if (title !== undefined) {
        fields.push('title = ?');
        values.push(title);
    }

    if (content !== undefined) {
        fields.push('content = ?');
        values.push(content);
    }

    if (status !== undefined) {
        fields.push('status = ?');
        values.push(status);
    }

    if (images !== undefined) {
        fields.push('images = ?');
        values.push(images);
    }

    query += fields.join(', ') + ' WHERE id = ?';
    values.push(postId);

    const [result] = await db.execute(query, values);

    if (categories && categories.length > 0) {
        await db.execute('DELETE FROM post_categories WHERE post_id = ?', [postId]);
        const categoryValues = categories.map((categoryId) => [postId, categoryId]);
        await db.query('INSERT INTO post_categories (post_id, category_id) VALUES ?', [categoryValues]);
    }

    await db.end();
    return result;
};

const deletePost = async (postId) => {
    const db = await createConnection();
    const [result] = await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
    await db.end();
    return result;
};

const getCommentsByPostId = async (postId, offset = 0, limit = 5) => {
    const db = await createConnection();

    const parsedOffset = parseInt(offset, 10) || 0;
    const parsedLimit = parseInt(limit, 10) || 5;

    const [results] = await db.execute(
        `SELECT c.id, c.content, c.publish_date, c.is_active, c.parent_id, u.login as author, u.profile_picture as author_avatar,
        (SELECT COUNT(*) FROM likes l WHERE l.entity_type = 'comment' AND l.entity_id = c.id AND l.type = 'like') AS like_count,
        (SELECT COUNT(*) FROM likes l WHERE l.entity_type = 'comment' AND l.entity_id = c.id AND l.type = 'dislike') AS dislike_count
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.publish_date DESC
         LIMIT ${parsedLimit} OFFSET ${parsedOffset}`,
        [postId]
    );
    await db.end();
    return results;
};

const getTotalCommentsByPostId = async (postId) => {
    const db = await createConnection();
    const [result] = await db.execute(
        `SELECT COUNT(*) as total FROM comments WHERE post_id = ?`,
        [postId]
    );
    await db.end();
    return result[0].total;
};

const createComment = async ({ postId, authorId, content, parentId = null }) => {
    const db = await createConnection();

    const [result] = await db.execute(
        'INSERT INTO comments (post_id, author_id, content, publish_date, parent_id) VALUES (?, ?, ?, NOW(), ?)',
        [postId, authorId, content, parentId]
    );

    const [newComment] = await db.execute(
        'SELECT c.id, c.content, c.publish_date, u.login AS author, c.parent_id FROM comments c JOIN users u ON c.author_id = u.id WHERE c.id = ?',
        [result.insertId]
    );

    await db.end();
    return newComment[0];
};

const getCategoriesByPostId = async (postId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT c.id, c.title
        FROM categories c
        JOIN post_categories pc ON c.id = pc.category_id
        WHERE pc.post_id = ?`,
        [postId]
    );
    await db.end();
    return results;
};

const getLikesByPostId = async (postId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT 
            l.id, 
            l.type, 
            l.publish_date, 
            u.login as author,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = ? AND type = 'like') AS like_count,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = ? AND type = 'dislike') AS dislike_count
        FROM likes l
        JOIN users u ON l.author_id = u.id
        WHERE l.entity_type = 'post' AND l.entity_id = ?`,
        [postId, postId, postId]
    );
    await db.end();
    return results;
};

const addLike = async (likeData) => {
    const db = await createConnection();
    const { postId, userId, type } = likeData;
    const ratingChange = type === 'like' ? 1 : -1;

    const [existingLikes] = await db.execute(
        'SELECT * FROM likes WHERE entity_type = "post" AND entity_id = ? AND author_id = ?', 
        [postId, userId]
    );
    if (existingLikes.length > 0) throw new Error('You have already left a like or dislike');

    const [postAuthor] = await db.execute('SELECT author_id FROM posts WHERE id = ?', [postId]);
    const authorId = postAuthor[0].author_id;

    await db.execute(
        'INSERT INTO likes (entity_type, entity_id, author_id, type) VALUES ("post", ?, ?, ?)', 
        [postId, userId, type]
    );
    await db.execute('UPDATE posts SET rating = rating + ? WHERE id = ?', [ratingChange, postId]);
    await db.execute('UPDATE users SET rating = rating + ? WHERE id = ?', [ratingChange, authorId]);

    const [likeCountResults] = await db.execute(
        'SELECT SUM(type = "like") AS like_count, SUM(type = "dislike") AS dislike_count FROM likes WHERE entity_type = "post" AND entity_id = ?', 
        [postId]
    );

    await db.end();

    return {
        like_count: likeCountResults[0].like_count || 0,
        dislike_count: likeCountResults[0].dislike_count || 0
    };
};

const removeLike = async (likeData) => {
    const db = await createConnection();
    const { postId, userId } = likeData;

    const [likes] = await db.execute(
        'SELECT type FROM likes WHERE entity_type = "post" AND entity_id = ? AND author_id = ?', 
        [postId, userId]
    );
    if (likes.length === 0) throw new Error('Like or dislike not found');

    const ratingChange = likes[0].type === 'like' ? -1 : 1;

    const [postAuthor] = await db.execute('SELECT author_id FROM posts WHERE id = ?', [postId]);
    const authorId = postAuthor[0].author_id;

    await db.execute(
        'DELETE FROM likes WHERE entity_type = "post" AND entity_id = ? AND author_id = ?', 
        [postId, userId]
    );
    await db.execute('UPDATE posts SET rating = rating + ? WHERE id = ?', [ratingChange, postId]);
    await db.execute('UPDATE users SET rating = rating + ? WHERE id = ?', [ratingChange, authorId]);

    const [likeCountResults] = await db.execute(
        'SELECT SUM(type = "like") AS like_count, SUM(type = "dislike") AS dislike_count FROM likes WHERE entity_type = "post" AND entity_id = ?', 
        [postId]
    );

    await db.end();

    return {
        like_count: likeCountResults[0].like_count || 0,
        dislike_count: likeCountResults[0].dislike_count || 0
    };
};


const updatePostStatus = async (postId, status) => {
    const db = await createConnection();
    const [result] = await db.execute(
        'UPDATE posts SET status = ? WHERE id = ?',
        [status, postId]
    );
    await db.end();
    return result;
};

const getUserAccessiblePosts = async (userId, { sort, category, dateStart, dateEnd, status }) => {
    const db = await createConnection();

    const orderBy = sort === 'date' ? 'p.publish_date' : 'p.rating';

    let whereClause = 'WHERE (p.status = "active" OR p.author_id = ?)';
    const params = [userId];

    if (category) {
        whereClause += ' AND c.title = ?';
        params.push(category);
    }

    if (dateStart && dateEnd) {
        whereClause += ' AND p.publish_date BETWEEN ? AND ?';
        params.push(dateStart, dateEnd);
    }

    if (status) {
        whereClause += ' AND p.status = ?';
        params.push(status);
    }

    const [results] = await db.execute(
        `SELECT p.id, p.title, p.content, p.publish_date, p.status, p.rating, u.login as author, u.id as author_id, u.profile_picture as author_avatar,
        GROUP_CONCAT(CONCAT(c.id, ':', c.title) SEPARATOR ', ') AS categories,
        (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'like') AS like_count,
        (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'dislike') AS dislike_count
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${orderBy} DESC`,
        params
    );

    await db.end();
    return results;
};

const savePost = async (userId, postId) => {
    const db = await createConnection();
    await db.execute(
        'INSERT IGNORE INTO saved_posts (user_id, post_id) VALUES (?, ?)',
        [userId, postId]
    );
    await db.end();
};

const getSavedPosts = async (userId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.publish_date, 
            p.status, 
            p.rating,
            u.id AS author_id, 
            u.login AS author, 
            u.profile_picture AS author_avatar,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'like') AS like_count,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'dislike') AS dislike_count,
            GROUP_CONCAT(CONCAT(c.id, ':', c.title) SEPARATOR ', ') AS categories
        FROM posts p
        JOIN saved_posts sp ON p.id = sp.post_id
        JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE sp.user_id = ?
        GROUP BY p.id`,
        [userId]
    );
    await db.end();
    return results;
};

const removeSavedPost = async (userId, postId) => {
    const db = await createConnection();
    await db.execute(
        'DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?',
        [userId, postId]
    );
    await db.end();
};

const getActivePosts = async ({ sort, category, dateStart, dateEnd }) => {
    const db = await createConnection();

    const orderBy = sort === 'date' ? 'p.publish_date' : 'p.rating';
    let whereClause = 'WHERE p.status = "active"';
    const params = [];

    if (category) {
        whereClause += ` AND p.id IN (
            SELECT pc.post_id
            FROM post_categories pc
            JOIN categories c ON pc.category_id = c.id
            WHERE c.title = ?
        )`;
        params.push(category);
    }

    if (dateStart && dateEnd) {
        whereClause += ' AND p.publish_date BETWEEN ? AND ?';
        params.push(dateStart, dateEnd);
    }

    const [results] = await db.execute(
        `SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.publish_date, 
            p.status, 
            p.rating, 
            u.login AS author, 
            u.id AS author_id, 
            u.profile_picture AS author_avatar,
            GROUP_CONCAT(DISTINCT CONCAT(c.id, ':', c.title) SEPARATOR ', ') AS categories,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'like') AS like_count,
            (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'dislike') AS dislike_count
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${orderBy} DESC`,
        params
    );

    await db.end();
    return results;
};

const getPostsByCategory = async (categoryId) => {
  const db = await createConnection();
  try {
    const [posts] = await db.execute(
      `SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.publish_date, 
        p.status, 
        p.rating,
        u.id AS author_id, 
        u.login AS author, 
        u.profile_picture AS author_avatar,
        (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'like') AS like_count,
        (SELECT COUNT(*) FROM likes WHERE entity_type = 'post' AND entity_id = p.id AND type = 'dislike') AS dislike_count,
        GROUP_CONCAT(CONCAT(c.id, ':', c.title) SEPARATOR ', ') AS categories
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE c.id = ?
      GROUP BY p.id`,
      [categoryId]
    );

    return posts;
  } catch (error) {
    console.error('Ошибка при выполнении запроса для постов:', error);
    throw error;
  } finally {
    await db.end();
  }
};

const getCategoryNameById = async (categoryId) => {
  const db = await createConnection();
  try {
    const [category] = await db.execute(
      'SELECT title FROM categories WHERE id = ?',
      [categoryId]
    );

    return category[0]?.title || null;
  } catch (error) {
    console.error('Ошибка при выполнении запроса для названия категории:', error);
    throw error;
  } finally {
    await db.end();
  }
};
  
module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getCommentsByPostId,
    createComment,
    getCategoriesByPostId,
    getLikesByPostId,
    addLike,
    removeLike,
    updatePostStatus,
    getUserAccessiblePosts,
    savePost,
    getSavedPosts,
    removeSavedPost,
    getActivePosts,
    getTotalCommentsByPostId,
    getPostsByCategory,
    getCategoryNameById, 
};

