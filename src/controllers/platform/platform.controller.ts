import * as express from 'express';
import ControllerInterface from '../controller.interface';
import PlatformModel from '../../models/Platform/Platform.model';
import PlatformDto from '../../models/Platform/Platform.dto';
import PlatformLinkModel from '../../models/PlatformLink/PlatformLink.model';
import UserModel from '../../models/User/User.model';
import UtilsService from '../../services/utilsService';
import axios from 'axios';

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
    }

    /**
     * Initializes all routes for the platform controller.
     */
    public initializeRoutes() {
        // this.router.post('/', this.login.bind(this)); // Bind this to login function to be able to call this.jwtService
        this.router.post(this.path + '/create', this.createPlatform);
        this.router.get(this.path + '/:id', this.getPlatformInformationsById);
        this.router.patch(this.path + '/:id', this.updatePlatform);
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
     * Create a connection of an user and a platform.
     *
     * @param request - The HTTP request object.
     * @param response - The HTTP response object.
     */
    async connectPlatform(request: express.Request, response: express.Response) {
        const userId = request.body.user.id;
        const platformId = request.body.platform.id;

        try {
            // Check if the platform exists
            const platform = await PlatformModel.findOne({ id: platformId });
            // Check if the user exists
            const user = await UserModel.findOne({ id: userId });

            if (!platform) {
                return response.status(401).json({ message: "La plateforme n'existe pas." });
            }

            if (!user) {
                return response.status(401).json({ message: "L'utilisateur n'existe pas." });
            }

            // Check if the user has already a link with the platform
            const platformLink = await PlatformLinkModel.findOne({ user: user, platform: platform });

            if (platformLink) {
                return response.status(401).json({ message: "L'utilisateur est déjà connecté à la plateforme." });
            } else {
                // Try to connect with the platform before creating the link
                const endpointUrl = platform.endpointUrl;

                // Call the platform endpoint to connect
                // const response = await axios.post(endpointUrl, { user: user });

                const state = this.utilsService.generateRandomString(16);
                const stateKey = 'spotify_auth_state';
                response.cookie(stateKey, state);

                const scope = 'user-read-private user-read-email';

    
                response.status(200).json([]);
            }
        }
        catch (error: any) {
            response.status(500).json({ message: error.message });
        }
    }

    /**
     * Callback function called by the platform after the user has connected or not.
     * Creates the link between the user and the platform if user has accepted the connection.
     * @param request 
     * @param response 
     */
    async connectCallback(request: express.Request, response: express.Response) {
        let isConnectionAccepted = true;
        if (isConnectionAccepted) {
            // Create the link between the user and the platform
            const platformLink = new PlatformLinkModel({
                user: user,
                platform: platform,
                isActive: true,
                token: '',
                tokenExpiresAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const newPlatformLink = await platformLink.save();

            response.status(201).json(newPlatformLink);
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