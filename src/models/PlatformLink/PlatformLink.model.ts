import mongoose, { Schema } from "mongoose";

const platformLinkSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    platform: { type: Schema.Types.ObjectId, ref: 'Platform' },
    profileId: String,
    isActive: Boolean,
    token: String,
    tokenExpiresAt: Date,
    createdAt: Date,
    updatedAt: Date
});

const PlatformLinkModel = mongoose.model('PlatformLink', platformLinkSchema);
export default PlatformLinkModel;