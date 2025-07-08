// import express from 'express';
// import User from '../models/User.js';

// const router = express.Router();

// // Temporary route to delete a user by email
// router.delete('/delete-user', async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ message: 'Email is required' });
//   }
//   try {
//     const result = await User.deleteOne({ email });
//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// export default router;
