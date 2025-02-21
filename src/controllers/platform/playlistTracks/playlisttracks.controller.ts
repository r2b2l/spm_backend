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
    }

    async getPlaylistTracks(req: express.Request, res: express.Response): Promise<express.Response> {
        const playlistId = req.params.playlistId;
        console.log(playlistId);

        const playlist = await PlaylistModel.findOne({ id: playlistId });
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found'
            });
        }

        const tracks = await PlaylistTracksModel.find({ playlist: playlist._id });
        return res.status(200).json(tracks);
    }
}

export default PlaylistTracksController;