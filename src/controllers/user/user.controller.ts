import * as express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import ControllerInterface from '../controller.interface';
import bcrypt from 'bcrypt';
import JwtService from '../../services/jwtService';
import UserModel from '../../models/User/User.model';
import UserDto from '../../models/User/User.dto';
import { Error } from 'mongoose';

/**
 * User Controller
 */
class UserController implements ControllerInterface {
    public path = '/user';
    public router = express.Router();
    public jwtService: JwtService = new JwtService();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Init all routes
     */
    public initializeRoutes() {
        this.router.post('/login', this.login.bind(this)); // Bind this to login function to be able to call this.jwtService
        this.router.post(this.path + '/create', this.createUser);
        this.router.post('/resetPassword', this.resetPassword);
    }

    async createUser(request: express.Request, response: express.Response) {
        try {
            const saltRounds = 10; // hashing rounds
            const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);

            const user = new UserModel({
                mail: request.body.mail,
                password: hashedPassword,
                role: request.body.role
            });

            const newDbUSer = await user.save();
            response.status(201).json(newDbUSer);
        } catch (error: any) {
            response.status(400).json({ message: error.message });
        }
    }

    async login(request: express.Request, response: express.Response) {
        const { mail, password } = request.body;

        try {
            const errorMessage = "Utilisateur ou mot de passe incorrect.";
            // Type UserDto si non vide
            const user: UserDto = await UserModel.findOne({ $or: [{ mail }] });

            if (!user) {
                return response.status(401).json({ message: errorMessage })
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return response.status(401).json({ message: errorMessage });
            }
            const token = this.jwtService.generateToken(user.mail);
            response.status(200).json({ isSuccess: true, token });
        } catch (error: any) {
            response.status(500).json({ message: error.message });
        }
    }

    async resetPassword(request: express.Request, response: express.Response) {
        const mail: string = request.body.mail;
        const force: boolean = request.body.force;

        try {
            const errorMessage = "Utilisateur incorrect.";
            const user = await UserModel.findOne({ $or: [{ mail }] });

            if (!user) {
                return response.status(401).json({ message: errorMessage })
            }

            if (force && request.body.password) {
                const saltRounds = 10; // hashing rounds
                const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
                user.password = hashedPassword;
                const modifiedDbUser = await user.save();
                response.status(200).json({modifiedDbUser});
            }
            response.status(401).json({ message: 'Modification de mot de passe non autorisée.'})
        } catch (error: any) {
            response.status(500).json({ message: error.message });
        }
    }

}

export default UserController;