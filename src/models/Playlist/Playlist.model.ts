import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    platform: { type: Schema.Types.ObjectId, ref: 'Platform' },
    id: String,
    name: String,
    description: String,
    externalUrl: String,
    imageUrl: String,
    snapshot_id: String,
    isPublic: Boolean,
    tracksNumber: Number,
    createdAt: Date,
    updatedAt: Date
});

interface PlaylistType {
    user: Schema.Types.ObjectId,
    platform: Schema.Types.ObjectId,
    id: string,
    name: string,
    description: string,
    externalUrl: string,
    imageUrl: string,
    snapshot_id: string,
    isPublic: boolean,
    tracksNumber: number,
    createdAt: Date,
    updatedAt: Date
}

const PlaylistModel = mongoose.model<PlaylistType>('Playlist', playlistSchema);
export default PlaylistModel;
module.exports = PlaylistModel;