const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,  // This makes it mandatory
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'tailor', 'admin'],
        default: 'user'
    },
    // other fields ...
});

module.exports = mongoose.model('User', userSchema);