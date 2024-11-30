const db = require('../db');
const createConnection = require('../db');
const createCategory = async (categoryData) => {
  const db = await createConnection();
  const { title, description } = categoryData;
  const [result] = await db.execute(
    'INSERT INTO categories (title, description) VALUES (?, ?)',
    [title, description]
  );
  await db.end();
  return result;
};

const getAllCategories = async () => {
  const db = await createConnection();
  const [results] = await db.execute('SELECT * FROM categories');
  await db.end();
  return results;
};

const getCategoryById = async (categoryId) => {
  const db = await createConnection();
  const [results] = await db.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
  await db.end();
  return results[0] || null;
};

const updateCategory = async (categoryId, categoryData) => {
  const db = await createConnection();
  const { title, description } = categoryData;
  const [result] = await db.execute(
    'UPDATE categories SET title = ?, description = ? WHERE id = ?',
    [title, description, categoryId]
  );
  await db.end();
  return result;
};

const deleteCategory = async (categoryId) => {
  const db = await createConnection();
  const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [categoryId]);
  await db.end();
  return result;
};

const getPostsByCategory = async (categoryId, userId = null) => {
  const db = await createConnection();
  try {
    const query = `
      SELECT 
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
        GROUP_CONCAT(DISTINCT CONCAT(c.id, ':', c.title) SEPARATOR ', ') AS categories, -- Все категории поста
        MAX(main_c.title) AS category_name, -- Название запрашиваемой категории
        MAX(main_c.description) AS category_description -- Описание запрашиваемой категории
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id -- Все категории поста
      LEFT JOIN post_categories main_pc ON p.id = main_pc.post_id
      LEFT JOIN categories main_c ON main_pc.category_id = main_c.id -- Запрашиваемая категория
      LEFT JOIN users u ON p.author_id = u.id
      WHERE main_c.id = ?
      AND (
        p.status = 'active'
        OR (p.status = 'inactive' AND p.author_id = ?)
      )
      GROUP BY p.id
      ORDER BY p.publish_date DESC`;

    const params = userId ? [categoryId, userId] : [categoryId, null];
    const [results] = await db.execute(query, params);

    if (results.length > 0) {
      const { category_name, category_description } = results[0];
      return {
        posts: results,
        categoryName: category_name,
        categoryDescription: category_description,
      };
    }

    return {
      posts: [],
      categoryName: null,
      categoryDescription: null,
    };
  } catch (error) {
    console.error('Ошибка при выполнении запроса для постов категории:', error);
    throw new Error('Ошибка сервера. Проверьте запрос.');
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

    return category[0]?.title || null; // Возвращаем название категории или null, если она не найдена
  } catch (error) {
    console.error('Ошибка при выполнении запроса для названия категории:', error);
    throw error;
  } finally {
    await db.end();
  }
};
const getPopularCategories = async () => {
  const db = await createConnection();

  const query = `
    SELECT 
      c.id, 
      c.title, 
      COUNT(p.id) AS post_count
    FROM categories c
    LEFT JOIN post_categories pc ON c.id = pc.category_id
    LEFT JOIN posts p ON pc.post_id = p.id
    WHERE p.status = 'active' -- Учитываются только активные посты
    GROUP BY c.id
    ORDER BY post_count DESC
    LIMIT 3
  `;

  const [results] = await db.execute(query);
  await db.end();

  return results;
};




module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPostsByCategory,
  getCategoryNameById,
  getPopularCategories,
};
