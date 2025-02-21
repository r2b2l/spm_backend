import mongoose, { Schema } from "mongoose";

const playlistTracksSchema = new mongoose.Schema({
    playlist: { type: Schema.Types.ObjectId, ref: 'Playlist' },
    id: String,
    name: String,
    isrc: String,
    albumName: String,
    artists: [String],
    disabled: Boolean,
    addedAt: Date,
    updatedAt: Date,
});

interface PlaylistTracksType {
    playlist: Schema.Types.ObjectId,
    id: string,
    name: string,
    albumName: string,
    isrc: string,
    artists: [string],
    disabled: boolean,
    addedAt: Date,
    updatedAt: Date
}

const PlaylistTracksModel = mongoose.model<PlaylistTracksType>('PlaylistTracks', playlistTracksSchema);
export default PlaylistTracksModel;
module.exports = PlaylistTracksModel;