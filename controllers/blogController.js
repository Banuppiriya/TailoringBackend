// BlogArticle Controller
import BlogArticle from '../models/BlogArticle.js';

// Get all articles (sorted by date descending)
const getAllArticles = async (req, res) => {
  try {
    const articles = await BlogArticle.find().sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single article by slug
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await BlogArticle.findOne({ slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new article
const createArticle = async (req, res) => {
  try {
    const { slug, title, date, content } = req.body;
    const article = new BlogArticle({ slug, title, date, content });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: 'Could not create article' });
  }
};

// Update article by slug
const updateArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, date, content } = req.body;
    const article = await BlogArticle.findOneAndUpdate(
      { slug },
      { title, date, content },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(400).json({ error: 'Could not update article' });
  }
};

// Delete article by slug
const deleteArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await BlogArticle.findOneAndDelete({ slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Could not delete article' });
  }
};

export default {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticleBySlug,
  deleteArticleBySlug,
};
