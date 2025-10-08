const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: null
    },
    organization: {
        type: String,
        default: null
    },
    designation: {
        type: String,
        default: null
    },
    profilePicture: {
        type: String,
        default: '/images/default-profile.png'
    },
    bio: {
        type: String,
        maxlength: 300,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin', 'organizer', 'attendee'],
        default: 'attendee'
    },
    conferences: [{
        type: Schema.Types.ObjectId,
        ref: 'Conference'
    }],
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

ProfileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Profile', ProfileSchema);
