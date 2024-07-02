import { NextFunction, Request, Response } from "express";
import UserModel from "../models/User/User.model";

async function connectedUserMiddleware(request: Request, res: Response, next: NextFunction) {
    try {
        if (request.path === '/login' || request.path === '/user/create' || request.path.startsWith('/static')
            || request.path.startsWith('/platform/connect') // TEST
        ) {
            return next();
        }

        const authToken = request.headers.authorization;
        if (!authToken) {
            return res.status(401).send({ message: "Aucun token d'autorisation fourni." });
        }

        const user = await UserModel.findOne({ authToken });
        if (!user) {
            return res.status(404).send({ message: "Utilisateur non trouvé." });
        }

        // Attacher l'utilisateur dans le body de la requete
        request.body.connectedUser = user;
        next();
    } catch (error: any) {
        res.status(500).send({ message: "Erreur lors de la recherche de l'utilisateur.", error: error.message });
    }
}

export default connectedUserMiddleware;