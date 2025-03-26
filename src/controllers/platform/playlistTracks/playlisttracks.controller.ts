import express from "express";
import ControllerInterface from "../../controller.interface";
import PlaylistTracksModel from "../../../models/Playlist/PlaylistTracks.model";
import PlaylistModel from "../../../models/Playlist/Playlist.model";

/**
 * PlaylistTracksController
 */
class PlaylistTracksController implements ControllerInterface {
    public path = '/playlisttracks/:playlistId';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Initializes the routes for PlaylistTracksController.
     */
    public initializeRoutes() {
        this.router.get(this.path + '/tracks', this.getPlaylistTracks.bind(this));
        this.router.patch(this.path + '/track/:trackId/sync', this.patchTrackSync.bind(this));
    }

    async getPlaylistTracks(req: express.Request, res: express.Response): Promise<express.Response> {
        const playlistId = req.params.playlistId;

        const playlist = await PlaylistModel.findOne({ id: playlistId });
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found'
            });
        }

        const tracks = await PlaylistTracksModel.find({ playlist: playlist._id }).sort({ addedAt: -1 });

        return res.status(200).json(tracks);
    }

    async patchTrackSync(req: express.Request, res: express.Response): Promise<express.Response> {
        const trackId = req.params.trackId;
        const isDisabled = req.body.isDisabled;

        const track = await PlaylistTracksModel.findOne({ id: trackId });
        if (!track) {
            return res.status(404).json({
                message: 'Track not found'
            });
        }

        track.disabled = isDisabled;
        await track.save();

        return res.status(200).json(track);
    }
}

export default PlaylistTracksController;