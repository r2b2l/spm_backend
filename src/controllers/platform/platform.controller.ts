import * as express from 'express';
import ControllerInterface from '../controller.interface';
import PlatformModel from '../../models/Platform/Platform.model';
import PlatformDto from '../../models/Platform/Platform.dto';

/**
 * Plaform Controller
 */
/**
 * Controller for managing platform-related operations.
 */
class PlatformController implements ControllerInterface {
    public path = '/platform';
    public router = express.Router();

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