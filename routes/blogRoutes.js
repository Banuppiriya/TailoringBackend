import express from 'express';
import blogController from '../controllers/blogController.js';
const router = express.Router();

// Get all articles
router.get('/', blogController.getAllArticles);

// Get article by slug
router.get('/:slug', blogController.getArticleBySlug);


// (Optional) Create article
router.post('/', blogController.createArticle);

// Update article by slug
router.put('/:slug', blogController.updateArticleBySlug);

// Delete article by slug
router.delete('/:slug', blogController.deleteArticleBySlug);

export default router;
