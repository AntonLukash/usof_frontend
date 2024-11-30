const categoryModel = require('../models/category');

const createCategory = async (req, res) => {
  const { title, description } = req.body;

  try {
    await categoryModel.createCategory({ title, description });
    res.status(201).json({ message: 'Category created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating category' });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("Error getting categories:", err);
    res.status(500).json({ error: 'Error getting categories' });
  }
};

const getCategoryById = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await categoryModel.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const { title, description } = req.body;

  try {
    const result = await categoryModel.updateCategory(categoryId, { title, description });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category successfully updated' });
  } catch (err) {
    res.status(500).json({ error: 'Category update error' });
  }
};

const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const result = await categoryModel.deleteCategory(categoryId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting category' });
  }
};

const getPostsByCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  const userId = req.user ? req.user.userId : null;

  try {
    const posts = await categoryModel.getPostsByCategory(categoryId, userId);
    const categoryName = await categoryModel.getCategoryNameById(categoryId);

    if (!categoryName) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json({ posts, categoryName });
  } catch (error) {
    console.error('Ошибка при получении постов категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getPopularCategories = async (req, res) => {
  const userId = req.user ? req.user.userId : null;
  const userRole = req.user ? req.user.role : 'guest';

  try {
    const popularCategories = await categoryModel.getPopularCategories(userId, userRole);
    res.json(popularCategories);
  } catch (error) {
    console.error('Ошибка при получении популярных категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};


module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPostsByCategory,
  getPopularCategories,
};
