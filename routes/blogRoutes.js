import express from 'express';
import blogController from '../controllers/blogController.js';

const router = express.Router();

// Get all blog articles
router.get('/', blogController.getAllArticles);

// Get a single article by slug
router.get('/:slug', blogController.getArticleBySlug);

// (Optional) Create a new article
router.post('/', blogController.createArticle);

// Update an article by slug
router.put('/:slug', blogController.updateArticleBySlug);

// Delete an article by slug
router.delete('/:slug', blogController.deleteArticleBySlug);

export default router;
