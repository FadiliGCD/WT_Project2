const mongoose = require('mongoose');

// Credentials and display name password stored as hash only
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 40 },
    // Used for uniqueness 
    email: { type: String, required: true, trim: true, lowercase: true },
    // Bcrypt hash of password
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
