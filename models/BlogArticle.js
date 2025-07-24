import mongoose from 'mongoose';

const BlogArticleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  content: { type: String, required: true }, // HTML or markdown
}, { timestamps: true });

const BlogArticle = mongoose.model('BlogArticle', BlogArticleSchema);
export default BlogArticle;
