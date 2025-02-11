import express, { NextFunction } from "express";
import ControllerInterface from "../../controller.interface";
import axios from "axios";
import PlatformLinkModel from "../../../models/PlatformLink/PlatformLink.model";
import UserModel from "../../../models/User/User.model";
import PlatformModel from "../../../models/Platform/Platform.model";
import PlaylistModel from "../../../models/Playlist/Playlist.model";
import PlaylistTrackModel from "../../../models/Track/Track.model";
import HttpException from "../../../exceptions/HttpException";
import { SpotifyException } from "../../../exceptions/SpotifyException";

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
        this.router.patch(this.path + '/playlist/:playlistId/disableTracks', this.disablePlaylistTracks.bind(this));
        this.router.patch(this.path + '/playlist/:playlistId/activeTracks', this.activePlaylistTracks.bind(this));
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

            const playlists = [];

            // Save playlists in database
            if (result.data.items.length > 0) {
                for (const playlist of result.data.items) {
                    // update or create playlist
                    const searchPlaylist = await PlaylistModel.findOne({ id: playlist.id });

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

                    // Add playlist to json response
                    playlists.push({
                        id: playlist.id,
                        name: playlist.name,
                        description: playlist.description,
                        ownerName: playlist.owner.display_name,
                        externalUrl: playlist.external_urls.spotify,
                        imageUrl: playlist.images[0].url,
                        snapshot_id: playlist.snapshot_id,
                        isPublic: playlist.public,
                        tracksNumber: playlist.tracks.total,
                        updatedAt: new Date()
                    });
                }

                return res.status(200).json(playlists);
            }

            return res.status(200).json([]);
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

    /**
     * Retrieves the tracks of a Spotify playlist.
     * @param req - The express Request object.
     * @param res - The express Response object.
     * @param next - The express NextFunction object.
     * @returns The tracks of the Spotify playlist as a JSON response.
     */
    async getSpotifyPlaylistTracks(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const spotifyToken = await this.getSpotifyToken(req, res);
            const playlistId = req.params.playlistId;

            // Get playlist model
            const playlist = await PlaylistModel.findOne({ id: playlistId });

            if (!playlist) {
                throw new HttpException(404, 'Playlist not found');
            }

            console.log(this.spotifyUrl + '/playlists/' + playlistId + '/tracks');
            const tracksResult = await axios.get(this.spotifyUrl + '/playlists/' + playlistId + '/tracks', {
                headers: {
                    Authorization: `Bearer ${spotifyToken.token}`
                },
                params: {
                    limit: 50,
                    offset: 0
                }
            });

            const response = await tracksResult.data;
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

            // Get all tracks from the playlist in the database
            const playlistTracks = await PlaylistTrackModel.find({ playlist: playlist._id });

            const responseTracks: any = [];
            const rawResult = false;

            await Promise.all(tracksItems.map(async (track: any) => {
                if (track.is_local === false) {
                    const searchTrack = await PlaylistTrackModel.findOne({ id: track.track.id, playlist: playlist._id });
                    if (!searchTrack) {
                        // console.log('Track: ' + track.track.name + ' by ' + track.track.artists[0].name + ' - NOT FOUND !');

                        // Find if track is already in the database.
                        // If found, delete in PlaylistTrackModel.
                        // If not found, create in PlaylistTrackModel
                        const trackInDb = await PlaylistTrackModel.findOne({ id: track.track.id });
                        if (trackInDb) {
                            console.log('Track: ' + track.track.name + ' by ' + track.track.artists[0].name + ' - NOT FOUND ! - DELETED !');
                            await PlaylistTrackModel.deleteOne({ id: track.track.id });
                        } else {
                            console.log('Track: ' + track.track.name + ' by ' + track.track.artists[0].name + ' - NOT FOUND ! - ADDED TO PLAYLIST !');
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
                                disabled: false,
                                addedAt: track.added_at,
                                updatedAt: new Date()
                            });
                            responseTracks.push({
                                id: track.track.id,
                                type: track.track.type,
                                name: track.track.name,
                                artists: track.track.artists.map((artist: any) => artist.name),
                                album: track.track.album.name,
                                isrc: track.track.external_ids.isrc,
                                ean: track.track.external_ids.ean,
                                upc: track.track.external_ids.upc,
                                addedAt: track.added_at,
                                disabled: false
                            });
                        }
                    } else {
                        console.log('Track: ' + track.track.name + ' by ' + track.track.artists[0].name + ' - ALREADY IN PLAYLIST !');
                        responseTracks.push({
                            id: searchTrack,
                            type: track.track.type,
                            name: searchTrack.name,
                            artists: searchTrack.artists,
                            album: track.track.album.name,
                            isrc: searchTrack.isrc,
                            ean: searchTrack.ean,
                            upc: searchTrack.upc,
                            addedAt: searchTrack.addedAt,
                            disabled: searchTrack.disabled
                        });
                    }
                }
            }));

            // Sort responseTracks by addedAt date in descending order
            responseTracks.sort((a: any, b: any) => {
                return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
            });

            // Wait for all tracks to be processed before returning the response
            return res.status(200).json({
                playlistId,
                items: rawResult ? tracksItems : responseTracks,
                total: response.total
            });
        } catch (error: any) {
            if (error.response) {
                let httpError: HttpException | SpotifyException;
                if (error.response.request.host === 'api.spotify.com') {
                    httpError = new SpotifyException(error.response.status, error.response.data.error.message);
                } else {
                    httpError = new HttpException(error.response.status, error.response.statusText);
                }
                next(httpError);
            } else {
                return res.status(500).json({
                    type: typeof error,
                    message: error.message
                });
            }
        }
    }

    async disablePlaylistTracks(req: express.Request, res: express.Response) {
        // Set disable to true or false for all tracks json array for playlistId
        const playlistId = req.params.playlistId;
        const tracksIds = req.body.tracksIds;

        const playlist = await PlaylistModel.findOne({ id: playlistId });
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found'
            });
        }

        const returnedTracks = [];
        for (const trackId of tracksIds) {
            const filter = { playlist: playlist._id, 'id': trackId};
            const update = { disabled: true, updatedAt: new Date() };

            returnedTracks.push(await PlaylistTrackModel.findOneAndUpdate(filter, update));
        }

        // Retourner les tracks sans les propriétés inutiles
        return res.status(200).json({
            isSuccess: true,
            tracks: returnedTracks
        });
    }

    async activePlaylistTracks(req: express.Request, res: express.Response) {
        // Set disable to true or false for all tracks json array for playlistId
        const playlistId = req.params.playlistId;
        const tracksIds = req.body.tracksIds;

        const playlist = await PlaylistModel.findOne({ id: playlistId });
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found'
            });
        }

        const returnedTracks = [];
        for (const trackId of tracksIds) {
            const filter = { playlist: playlist._id, 'id': trackId};
            const update = { disabled: false, updatedAt: new Date() };

            returnedTracks.push(await PlaylistTrackModel.findOneAndUpdate(filter, update));
        }

        // Retourner les tracks sans les propriétés inutiles
        return res.status(200).json({
            isSuccess: true,
            tracks: returnedTracks
        });
    }
}

export default SpotifyController;