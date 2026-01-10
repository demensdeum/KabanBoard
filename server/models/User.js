const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    // Fine-grained permissions
    isAdmin: { type: Boolean, default: false }, // Superuser
    canManageUsers: { type: Boolean, default: false },
    canManageBoards: { type: Boolean, default: false },
    canManageTasks: { type: Boolean, default: false },
    allowedBoards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
