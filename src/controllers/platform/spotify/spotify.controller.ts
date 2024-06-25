import express, { NextFunction } from "express";
import ControllerInterface from "../../controller.interface";
import axios from "axios";
import PlatformLinkModel from "../../../models/PlatformLink/PlatformLink.model";
import UserModel from "../../../models/User/User.model";
import PlatformModel from "../../../models/Platform/Platform.model";
import PlaylistModel from "../../../models/Playlist/Playlist.model";
import PlaylistTrackModel from "../../../models/Track/Track.model";
import HttpException from "../../../exceptions/HttpException";

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
        this.router.get(this.path + '/playlist/:playlistId/tracks', this.getSpotifyPlaylistTracks.bind(this));
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

        if (!SpotifyLink) {
            throw new Error("Le token Spotify n'existe pas.");
        }
        return {
            token: SpotifyLink.token,
            user,
            platform,
            platformLink: SpotifyLink
        };

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
                    Authorization: `Bearer ${spotifyToken.token}`
                }
            });

            await PlatformLinkModel.updateOne({ _id: spotifyToken.platformLink._id }).set({ profileId: result.data.id, updatedAt: new Date() });

            return res.status(200).json(await result.data);
        } catch (error: any) {
            return res.status(500).json({
                type: typeof error,
                message: error.message
            });
        }
    }

    /**
     * Retrieves and save the Spotify playlists for the authenticated user.
     */
    async getSpotifyPlaylists(req: express.Request, res: express.Response) {
        try {
            const spotifyToken = await this.getSpotifyToken(req, res);
            const result = await axios.get(this.spotifyUrl + '/me/playlists', {
                headers: {
                    Authorization: `Bearer ${spotifyToken.token}`
                },
                params: {
                    limit: 50,
                    offset: 0
                }
            });

            // Save playlists in database
            if (result.data.items.length > 0) {
                for (const playlist of result.data.items) {
                    // update or create playlist
                    const searchPlaylist = await PlaylistModel.findOne({ id: playlist.id});

                    if (!searchPlaylist) {
                        // create playlist
                        await PlaylistModel.create({
                            user: spotifyToken.user._id,
                            platform: spotifyToken.platform._id,
                            id: playlist.id,
                            name: playlist.name,
                            description: playlist.description,
                            externalUrl: playlist.external_urls.spotify,
                            imageUrl: playlist.images[0].url,
                            snapshot_id: playlist.snapshot_id,
                            public: playlist.public,
                            tracksNumber: playlist.tracks.total,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    } else {
                        // update playlist
                        await PlaylistModel.updateOne({ id: playlist.id }).set({
                            user: spotifyToken.user._id,
                            platform: spotifyToken.platform._id,
                            id: playlist.id,
                            name: playlist.name,
                            description: playlist.description,
                            externalUrl: playlist.external_urls.spotify,
                            imageUrl: playlist.images[0].url,
                            snapshot_id: playlist.snapshot_id,
                            public: playlist.public,
                            tracksNumber: playlist.tracks.total,
                            updatedAt: new Date()
                        });
                    }
                }
            }

            return res.status(200).json(await result.data);
        }
        catch (error: any) {
            if (error instanceof HttpException) {
                return res.status(error.status).json({
                    type: typeof error,
                    message: error.message
                });
            } else {
                return res.status(500).json({
                    type: typeof error,
                    message: error.message
                });
            }
        }
    }

    async getSpotifyPlaylistTracks(req: express.Request, res: express.Response,  next: NextFunction) {
        try {
            const spotifyToken = await this.getSpotifyToken(req, res);
            const playlistId = req.params.playlistId;
            console.log(this.spotifyUrl + '/playlists/' + playlistId + '/tracks');
            const result = await axios.get(this.spotifyUrl + '/playlists/' + playlistId + '/tracks', {
                headers: {
                    Authorization: `Bearer ${spotifyToken.token}`
                },
                params: {
                    limit: 50,
                    offset: 0
                }
            });

            const response = await result.data;
            let tracksItems = response.items;
            if (response.total > 50) {
                // repeat until all tracks are fetched
                let offset = 50;
                while (offset < response.total) {
                    const result = await axios.get(this.spotifyUrl + '/playlists/' + playlistId + '/tracks', {
                        headers: {
                            Authorization: `Bearer ${spotifyToken.token}`
                        },
                        params: {
                            limit: 50,
                            offset
                        }
                    });
                    tracksItems = tracksItems.concat(result.data.items);
                    offset += 50;
                }
            }

            // Get playlist model
            const playlist = await PlaylistModel.findOne({ id: playlistId });
            console.log('Playlist: ' + playlist?.name);

            const responseTracks: any = [];
            tracksItems.forEach(async (track: any) => {
                responseTracks.push({
                    id: track.track.id,
                    type: track.track.type,
                    name: track.track.name,
                    artists: track.track.artists.map((artist: any) => artist.name),
                    album: track.track.album.name,
                    isrc: track.track.external_ids.isrc,
                    ean: track.track.external_ids.ean,
                    upc: track.track.external_ids.upc,
                    addedAt: track.added_at
                });

                // Save tracks in database
                const searchTrack = await PlaylistTrackModel.findOne({ id: track.track.id });
                if (!searchTrack) {
                    console.log('Track: ' + track.track.name + ' by ' +  track.track.artists[0].name + ' - NOT FOUND !');
                    await PlaylistTrackModel.create({
                        playlist,
                        id: track.track.id,
                        name: track.track.name,
                        artists: track.track.artists.map((artist: any) => artist.name),
                        albumName: track.track.album.name,
                        type: track.track.type,
                        isrc: track.track.external_ids.isrc,
                        ean: track.track.external_ids.ean,
                        upc: track.track.external_ids.upc,
                        addedAt: track.added_at
                    });
                } else {
                    // update playlistTrack
                    console.log('Track: ' + track.track.name + ' by ' +  track.track.artists[0].name + ' - FOUND !');
                    await PlaylistTrackModel.updateOne({ id: track.track.id }).set({
                        playlist,
                        id: track.track.id,
                        name: track.track.name,
                        artists: track.track.artists.forEach((artist: any) => {
                            return artist.name;
                        }),
                        albumName: track.track.album.name,
                        type: track.track.type,
                        isrc: track.track.external_ids.isrc,
                        ean: track.track.external_ids.ean,
                        upc: track.track.external_ids.upc,
                        addedAt: track.added_at
                    });
                }
            });

            const rawResult = false;
            return res.status(200).json({
                playlistId,
                items: rawResult ? tracksItems : responseTracks,
                total: response.total
            });
        } catch (error: any) {
            console.log('Error catched');
            if (error instanceof HttpException) {
                console.log('HttpException catched');
                const httpException = new HttpException(error.status, error.message);
                next(httpException);
            } else {
                console.log('Other error catched');
                return res.status(500).json({
                    type: typeof error,
                    message: error.message
                });
            }
        }
    }
}

export default SpotifyController;