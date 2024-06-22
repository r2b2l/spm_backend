import mongoose, { Schema } from "mongoose";

const playlistTrackSchema = new mongoose.Schema({
    playlist: { type: Schema.Types.ObjectId, ref: 'Playlisy' },
    id: String,
    name: String,
    artists: Array,
    albumName: String,
    type: String,
    isrc: String,
    ean: String,
    upc: String,
    addedAt: Date
});

interface PlaylistTrackType {
    playlist: Schema.Types.ObjectId,
    id: string,
    name: string,
    artists: string[],
    albumName: string,
    type: string,
    isrc: string,
    ean: string,
    upc: string,
    addedAt: Date
}

const PlaylistTrackModel = mongoose.model<PlaylistTrackType>('PlaylistTrack', playlistTrackSchema);
export default PlaylistTrackModel;
module.exports = PlaylistTrackModel;