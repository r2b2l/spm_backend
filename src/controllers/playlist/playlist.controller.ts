import express, { NextFunction } from "express";
import ControllerInterface from "../controller.interface";
// import PlatformModel from "../../models/Platform/Platform.model";
import PlaylistModel from "../../models/Playlist/Playlist.model";

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
    }

    /**
     * Retrieve playlists for the authenticated user.
     * @todo: Filter by platform
     * @argument {express.Request} req
     * @argument {express.Response} res
     * @returns {Promise<express.Response>}
     */
    async getPlaylists(req: express.Request, res: express.Response): Promise<express.Response> {
        const playlists = await PlaylistModel.find();
        return res.status(200).json(playlists);
    }
}

export default PlaylistController;