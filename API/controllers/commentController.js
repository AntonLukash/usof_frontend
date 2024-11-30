const commentModel = require('../models/comment');

const createComment = async (req, res) => {
  const { content, parentId } = req.body;
  const postId = req.params.postId;
  const authorId = req.user.userId;

  try {
    await commentModel.createComment({ authorId, postId, content, parentId });
    res.status(201).json({ message: 'Комментарий успешно создан' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при создании комментария' });
  }
};

const getCommentsByPostId = async (req, res) => {
  const postId = req.params.postId;

  try {
    const comments = await commentModel.getCommentsByPostId(postId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении комментариев' });
  }
};


const getCommentById = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const comment = await commentModel.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Server error when receiving comment' });
  }
};

const getCommentLikes = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const likes = await commentModel.getCommentLikes(commentId);
    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: 'Server error when receiving likes' });
  }
};

const createCommentLike = async (req, res) => {
  const commentId = req.params.commentId;
  const authorId = req.user.userId;
  const { type } = req.body;

  try {
    await commentModel.createCommentLike(commentId, authorId, type);
    res.json({ message: 'Like added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error adding a like' });
  }
};

const updateComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { content } = req.body;

  try {
    await commentModel.updateComment(commentId, content);
    res.json({ message: 'Comment successfully updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating comment' });
  }
};

const deleteComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    await commentModel.deleteComment(commentId);
    res.json({ message: 'Comment successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting comment' });
  }
};

const deleteCommentLike = async (req, res) => {
  const commentId = req.params.commentId;
  const authorId = req.user.userId;

  try {
    await commentModel.deleteCommentLike(commentId, authorId);
    res.json({ message: 'Like removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting like' });
  }
};

const createOrUpdateCommentLike = async (req, res) => {
  const commentId = req.params.commentId;
  const authorId = req.user.userId;
  const { type } = req.body;

  if (!['like', 'dislike'].includes(type)) {
    return res.status(400).json({ error: 'Wrong like type' });
  }

  try {
    await commentModel.createOrUpdateCommentLike(commentId, authorId, type);
    res.status(201).json({ message: 'The like was successfully added or updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating a like' });
  }
};

const updateCommentStatus = async (req, res) => {
  const commentId = req.params.commentId;
  const { isActive } = req.body;


  try {
    const comment = await commentModel.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Проверка прав: только автор или админ могут изменять статус
    if (req.user.userId !== comment.author_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await commentModel.updateCommentStatus(commentId, isActive);
    res.json({ message: 'Comment status updated successfully', isActive });
  } catch (err) {
    res.status(500).json({ error: 'Error updating comment status' });
  }
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
  createOrUpdateCommentLike,
  updateCommentStatus,
};
