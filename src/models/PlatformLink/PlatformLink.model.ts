import mongoose from "mongoose";

const platformLinkSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
    profileId: String,
    isActive: Boolean,
    token: String,
    tokenExpiresAt: Date,
    createdAt: Date,
    updatedAt: Date
});

const PlatformLinkModel = mongoose.model('PlatformLink', platformLinkSchema);
export default PlatformLinkModel;