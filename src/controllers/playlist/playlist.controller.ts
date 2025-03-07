import express, { NextFunction } from "express";
import ControllerInterface from "../controller.interface";
// import PlatformModel from "../../models/Platform/Platform.model";
import PlaylistModel from "../../models/Playlist/Playlist.model";
import PlaylistTracksModel from "../../models/Playlist/PlaylistTracks.model";

/**
 * PlaylistController
 */
class PlaylistController implements ControllerInterface {
    public path = '/playlist';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Initializes the routes for PlaylistController.
     */
    public initializeRoutes() {
        this.router.get(this.path + '/playlists', this.getPlaylists.bind(this));
        this.router.get(this.path + '/playlists/count', this.getPlaylistsCount.bind(this));
        this.router.get(this.path + '/playlists/tracks/count', this.getPlaylistsTracksCount.bind(this));
    }

    /**
     * Retrieve playlists for the authenticated user.
     * @todo: Filter by platform
     * @argument {express.Request} req
     * @argument {express.Response} res
     * @returns {Promise<express.Response>}
     */
    async getPlaylists(req: express.Request, res: express.Response): Promise<express.Response> {
        // Get user from connectedUser middleware
        const user = req.body.connectedUser;


        // Get playlists for user
        const playlists = await PlaylistModel.find({ user: user._id });
        return res.status(200).json(playlists);
    }

    async getPlaylistsCount(req: express.Request, res: express.Response): Promise<express.Response> {
        // Get user from connectedUser middleware
        const user = req.body.connectedUser;

        // Get playlists count for user
        const count = await PlaylistModel.countDocuments({ user: user._id });
        return res.status(200).json({ count });
    }

    async getPlaylistsTracksCount(req: express.Request, res: express.Response): Promise<express.Response> {
        // Get user from connectedUser middleware
        const user = req.body.connectedUser;
        let totalTracks = 0;

        // Get playlists for user
        const playlists = await PlaylistModel.find({ user: user._id });

        // for each playlist, get the tracks count
        await Promise.all(playlists.map(async (playlist) => {
            const count = await PlaylistTracksModel.countDocuments({ playlist: playlist._id });
            totalTracks += count;
        }));

        // Return the total tracks count
        return res.status(200).json({ totalTracks });
    }
}

export default PlaylistController;