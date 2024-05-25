import express from "express";
import ControllerInterface from "../../controller.interface";
import axios from "axios";
import PlatformLinkModel from "../../../models/PlatformLink/PlatformLink.model";
import UserModel from "../../../models/User/User.model";
import PlatformModel from "../../../models/Platform/Platform.model";

/**
 * SpotifyController class that implements the ControllerInterface.
 * Handles requests related to Spotify platform.
 */
class SpotifyController implements ControllerInterface {
    public path = '/spotify';
    public spotifyUrl = 'https://api.spotify.com/v1';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Initializes the routes for SpotifyController.
     */
    public initializeRoutes() {
        this.router.get(this.path + '/profile', this.getSpotifyProfile.bind(this));
        this.router.get(this.path + '/playlists', this.getSpotifyPlaylists.bind(this));
    }

    async getSpotifyToken(req: express.Request, res: express.Response) {
        // get spotify bearer token in PlatformLink with user token
        const user = await UserModel.findOne({ authToken: req.headers.authorization });
        if (!user) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        const platform = await PlatformModel.findOne({ id: 1 });
        if (!platform) {
            throw new Error("La plateforme n'existe pas");
        }

        const SpotifyLink = await PlatformLinkModel.findOne({ user: user._id, platform: platform._id });
        console.log(user);
        console.log(platform._id);
        if (!SpotifyLink) {
            throw new Error("Le token Spotify n'existe pas.");
        }
        return SpotifyLink.token;

    }

    /**
     * Retrieves the Spotify profile for the authenticated user.
     * @param req - The express Request object.
     * @param res - The express Response object.
     * @returns The Spotify profile data as a JSON response.
     */
    async getSpotifyProfile(req: express.Request, res: express.Response) {
        try {
            const spotifyToken = await this.getSpotifyToken(req, res);
            // get spotify profile
            const result = await axios.get(this.spotifyUrl + '/me', {
                headers: {
                    Authorization: `Bearer ${spotifyToken}`
                }
            });

            return res.status(200).json(await result.data);
        } catch (error: any) {
            return res.status(500).json({
                type: typeof error,
                message: error.message
            });
        }
    }

    async getSpotifyPlaylists(req: express.Request, res: express.Response) {
        try {
            const spotifyToken = await this.getSpotifyToken(req, res);
            const result = await axios.get(this.spotifyUrl + '/me/playlists', {
                headers: {
                    Authorization: `Bearer ${spotifyToken}`
                },
                params: {
                    limit: 50,
                    offset: 0
                }
            });

            return res.status(200).json(await result.data);
        }
        catch (error: any) {
            return res.status(500).json({
                type: typeof error,
                message: error.message
            });
        }
    }
}

export default SpotifyController;