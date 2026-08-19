const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Standard Fields
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['seeker', 'employer', 'superadmin'], default: 'seeker' },

    // ✅ SUPER ADMIN & VERIFICATION FIELDS
    isVerified: { type: Boolean, default: false }, // Only applies to employers
    isBlocked: { type: Boolean, default: false },

    // ✅ NEW PROFILE FIELDS (Added for My Account)
    contact: { type: String },
    gender: { type: String },
    dob: { type: Date },

    // Employer Specific
    companyName: { type: String },

    // Seeker Specific
    skills: [String],
    resume: { type: String } // URL to resume

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);