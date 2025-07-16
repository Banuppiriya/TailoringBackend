import mongoose from 'mongoose';

const BlogArticleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  content: { type: String, required: true }, // Store as HTML or markdown
}, { timestamps: true });

const BlogArticle = mongoose.model('BlogArticle', BlogArticleSchema);
export default BlogArticle;
