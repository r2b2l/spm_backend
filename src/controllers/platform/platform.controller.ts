import * as express from 'express';
import ControllerInterface from '../controller.interface';
import PlatformModel from '../../models/Platform/Platform.model';
import PlatformDto from '../../models/Platform/Platform.dto';
import PlatformLinkModel from '../../models/PlatformLink/PlatformLink.model';
import UserModel from '../../models/User/User.model';
import UtilsService from '../../services/utilsService';
import axios from 'axios';
import { json } from 'stream/consumers';
import qs from 'qs';

// const passport = require('passport');
// const SpotifyStrategy = require('passport-spotify').Strategy;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
// passport.serializeUser(function (user, done) {
//     done(null, user);
//   });

//   passport.deserializeUser(function (obj, done) {
//     done(null, obj);
//   });

/**
 * Plaform Controller
 */
/**
 * Controller for managing platform-related operations.
 */
class PlatformController implements ControllerInterface {

    public path = '/platform';
    public router = express.Router();
    private utilsService = new UtilsService();

    constructor() {
        this.initializeRoutes();
        this.initStrategies();
    }

    /**
     * Initializes all routes for the platform controller.
     */
    public initializeRoutes() {
        const passport = require('passport');
        // this.router.post('/', this.login.bind(this)); // Bind this to login function to be able to call this.jwtService
        this.router.post(this.path + '/create', this.createPlatform);
        this.router.get(this.path + '/:id', this.getPlatformInformationsById);
        this.router.get(this.path + '/isConnectedTo/:platformId', this.isConectedToPlatform);
        this.router.patch(this.path + '/changePlatformUser', this.changeUserPlatformLink);
        this.router.patch(this.path + '/:id', this.updatePlatform);
        this.router.get(this.path + '/connect/spotify', this.getSpotifyAuthUrl);
        // this.router.get(this.path + '/connect/spotify', passport.authenticate(
        //     'spotify',
        //     { scope: ['user-read-email', 'user-read-private'] }
        // ));
        this.router.get(this.path + '/connect/spotify/callback', this.connectCallback);
        // this.router.get(this.path + '/connect/spotify/callback', passport.authenticate('spotify', {
        //     failureRedirect: '/login',
        //     successRedirect: this.path + '/spotify/profile',
        //     session: false
        // }));
    }

    /**
     * Initializes all strategies for the platform controller.
     * TODO: Type variables to avoid any
     */
    private initStrategies() {
        console.log('initStrategies');
        const passport = require('passport');
        const SpotifyStrategy = require('passport-spotify').Strategy;
        passport.use(new SpotifyStrategy({
            clientID: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            callbackURL: process.env.SPOTIFY_CALLBACK_URL,
            passReqToCallback: true
        }, async (req: express.Request, accessToken: any, refreshToken: any, expiresIn: any, profile: any, done: any) => {
            try {
                const authToken = req.headers.authorization;
                console.log(authToken);
                const user = await UserModel.findOne({ authToken });
                console.log(user);
                if (!user) return done(null, false);
                const platform = await PlatformModel.findOne({ id: 1 }); // Enumération Spotify
                if (!platform) return done(null, false);

                // Delete all previous links
                await PlatformLinkModel.deleteMany({ user: user._id, platform: platform._id });

                console.log(expiresIn);
                console.log(refreshToken); // Token qui permet de faire la demande de refresh, see https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

                // Create the link between the user and the platform
                const platformLink = new PlatformLinkModel({
                    user: user._id,
                    platform: platform._id,
                    isActive: true,
                    token: accessToken,
                    refreshToken: accessToken,
                    tokenExpiresAt: refreshToken,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });


                await platformLink.save();
                return done(null, { profile, accessToken, refreshToken, expiresIn });
            } catch (error: any) {
                console.log(error);
                return done(error, null);
            }
        }));
    }

    /**
     * Creates a new platform.
     *
     * @param request - The HTTP request object.
     * @param response - The HTTP response object.
     */
    async createPlatform(request: express.Request, response: express.Response) {
        try {
            const platform = new PlatformModel({
                id: request.body.id,
                name: request.body.name,
                endpointUrl: request.body.endpointUrl,
                logoUrl: request.body.logoUrl,
                description: request.body.description,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const newPlatform = await platform.save();

            response.status(201).json(newPlatform);
        } catch (error: any) {
            response.status(400).json({ message: error.message });
        }
    }

    /**
     * Change the user linked to a platform.
     *
     * @param request - The HTTP request object.
     * @param response - The HTTP response object.
     */
    async changeUserPlatformLink(request: express.Request, response: express.Response) {
        const { originalMail, newMail, platformId } = request.body;

        const originalUser = await UserModel.findOne({ mail: originalMail });

        if (!originalUser) {
            return response.status(401).json({ message: "Utilisateur d'origine incorrect." })
        }

        const newUser = await UserModel.findOne({ mail: newMail });

        if (!newUser) {
            return response.status(401).json({ message: "Utilisateur destinataire incorrect." })
        }

        const platform = await PlatformModel.findOne({ id: platformId });
        if (!platform) {
            throw new Error("La plateforme n'existe pas");
        }

        const platformLink = await PlatformLinkModel.findOne({ user: originalUser._id, platform: platform._id });
        if (!platformLink) {
            return response.status(401).json({ message: "Platform incorrect." })
        }

        await PlatformLinkModel.updateOne({ user: originalUser._id, platform: platform._id }).set({ user: newUser._id, updatedAt: new Date() });

        response.status(200).json({ isSuccess: true });
    }

    async isConectedToPlatform(request: express.Request, response: express.Response) {
        const user = request.body.connectedUser;
        const platformId = request.params.platformId;

        // const user = await UserModel.findOne({ id: userId });
        const platform = await PlatformModel.findOne({ id: platformId });

        if (!user) {
            return response.status(401).json({ message: "L'utilisateur n'existe pas." });
        }

        if (!platform) {
            return response.status(401).json({ message: "La plateforme n'existe pas." });
        }

        const currentDate = new Date().toISOString();
        const platformLink = await PlatformLinkModel.find({ user, platform, tokenExpiresAt: { $gte: currentDate } });

        if (platformLink.length === 0) {
            return response.status(200).json({ isSuccess: true, isConnected: false });
        }

        // for (const link of platformLink) {
        //     console.log(link);
        // }

        response.status(200).json({ isSuccess: true, isConnected: true, comment: "Les validités des tokens ne sont pas controlées." });
    }


    async getSpotifyAuthUrl(request: express.Request, response: express.Response) {
        const clientID = process.env.SPOTIFY_CLIENT_ID;
        const callbackURL = process.env.SPOTIFY_CALLBACK_URL ? process.env.SPOTIFY_CALLBACK_URL : 'http://localhost:3000/platform/connect/spotify/callback';
        const scope = 'user-read-private user-read-email';
        // clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=code&redirect_uri=${encodeURIComponent(callbackURL)}&scope=${encodeURIComponent(scope)}`;

        console.log('Authorized passed, go to: ' + spotifyAuthUrl);
        // Retourner l'URL d'authentification au client
        response.status(200).json({ url: spotifyAuthUrl });
    }

    /**
     * SPOTIFY HANDCRAFTED
     * Callback function called by the platform after the user has connected or not.
     * Creates the link between the user and the platform if user has accepted the connection.
     * @param request
     * @param response
     */
    async connectCallback(request: express.Request, response: express.Response) {
        if (request.query.code) {
            console.log('User accepted Spotify connection');
            const code = request.query.code;
            console.log('Code Spotify:');
            console.log(code);

            const state = request.query.state;
            console.log('State:');
            console.log(state);

            const apiAuthToken = request.query.token;
            console.log('Own Auth token: ');
            console.log(apiAuthToken);

            // Ask https://accounts.spotify.com/api/token for the access token
            const url = 'https://accounts.spotify.com/api/token';
            const clientID = process.env.SPOTIFY_CLIENT_ID;
            const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
            const redirectUri = process.env.SPOTIFY_CALLBACK_URL ? process.env.SPOTIFY_CALLBACK_URL : 'http://localhost:3000/platform/connect/spotify/callback';

            const clientEncoded = Buffer.from(clientID + ':' + clientSecret).toString('base64');

            const data = qs.stringify({
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            });
            const options = {
                headers: {
                    'Authorization': 'Basic ' + clientEncoded,
                    'Content-type': 'application/x-www-form-urlencoded'
                }
            }

            await axios.post(url, data, options)
                .then(async (result) => {
                    const access_token = result.data.access_token;
                    const refresh_token = result.data.refresh_token;
                    const expires_in = result.data.expires_in;

                    // Save the token in the database
                    const user = await UserModel.findOne({ apiAuthToken });
                    console.log('User: ');
                    console.log(user);
                    const platform = await PlatformModel.findOne({ id: 1 }); // Enumération Spotify

                    if (user && platform) {
                        // Delete all previous links
                        await PlatformLinkModel.deleteMany({ user: user._id, platform: platform._id });

                        // Create the link between the user and the platform
                        const platformLink = new PlatformLinkModel({
                            user: user._id,
                            platform: platform._id,
                            isActive: true,
                            token: access_token,
                            refreshToken: refresh_token,
                            tokenExpiresAt: new Date(Date.now() + expires_in * 1000), // expires_in is in seconds, add it to the current date to get the expiration date
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });

                        await platformLink.save();

                        console.log('Spotify token saved !');
                        response.redirect('http://localhost:4200/spotify');
                    }
                })
                .catch((error) => {
                    console.log(error.code);
                    console.log(error.response.status);
                    console.log(error.response.statusText);
                });

            // const access_token = result.data.access_token;
            // const refresh_token = result.data.refresh_token;
            // const expires_in = result.data.expires_in;

            // // Save the token in the database
            // const authToken = request.headers.authorization;
            // console.log('SPM authToken: ');
            // console.log(authToken);
            // const user = await UserModel.findOne({ authToken });
            // const platform = await PlatformModel.findOne({ id: 1 }); // Enumération Spotify

            // if (user && platform) {
            //     // Delete all previous links
            //     await PlatformLinkModel.deleteMany({ user: user._id, platform: platform._id });

            //     // Create the link between the user and the platform
            //     const platformLink = new PlatformLinkModel({
            //         user: user._id,
            //         platform: platform._id,
            //         isActive: true,
            //         token: access_token,
            //         refreshToken: refresh_token,
            //         tokenExpiresAt: expires_in,
            //         createdAt: new Date(),
            //         updatedAt: new Date()
            //     });

            //     await platformLink.save();

            //     console.log('Spotify token saved !');
            // }

            // response.redirect('http://localhost:4200/spotify');
        }
        if (request.query.error) {
            console.log('User refused Spotify connection');
            console.log(request.query.error);
            response.redirect('http://localhost:4200/spotify');
        }
    }

    /**
     * Retrieves platform information by ID.
     *
     * @param request - The HTTP request object.
     * @param response - The HTTP response object.
     */
    async getPlatformInformationsById(request: express.Request, response: express.Response) {
        const id = request.params.id;

        try {
            const errorMessage = "La plateform n'existe pas.";
            const platform: PlatformDto = await PlatformModel.findOne({ $or: [{ id }] }) as PlatformDto;

            if (!platform) {
                return response.status(401).json({ message: errorMessage })
            }

            response.status(200).json({ isSuccess: true, platform });
        } catch (error: any) {
            response.status(500).json({ message: error.message });
        }
    }

    /**
     * Updates a platform.
     *
     * @param request - The HTTP request object.
     * @param response - The HTTP response object.
     */
    async updatePlatform(request: express.Request, response: express.Response) {
        const id = request.params.id;
        const platform = request.body;

        try {
            const errorMessage = "La plateform n'existe pas.";
            const updatedPlatform = await PlatformModel.findOneAndUpdate({ $or: [{ id }] }, platform, { new: true });
            response.status(200).json({ isSuccess: true, updatedPlatform });
        } catch (error: any) {
            response.status(500).json({ message: error.message });
        }
    }
}

export default PlatformController;