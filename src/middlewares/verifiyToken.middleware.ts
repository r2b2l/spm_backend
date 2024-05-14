import { NextFunction, Request, Response } from 'express';
import jwt, {Secret} from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Verify JWT Token passed in 'Authorization' header
 * Throw an error if Authorization is not present or invalid
 * If current route is login or user create, don't verify. We can't have a token at these points
 * @param request
 * @param response
 * @param next
 */
function verifyTokenMiddleware(request: Request, response: Response, next: NextFunction) {
    const token = request.header('Authorization');
    const FAILURE_MESSAGE = { isSuccess: false, reason: 'INVALID_TOKEN' };

    // If /login or /user/create, don't verify token
    if (request.path === '/login' || request.path === '/user/create') {
        return next();
    }

    if (!token) {
        return response.status(401).json({ ...FAILURE_MESSAGE, message: 'Token missing. Unauthorized access.' });
    }

    const secretKey: Secret = process.env.API_JWT_SECRET as Secret;

    jwt.verify(token, secretKey, (error) => {
        if (error) {
            return response.status(403).json({ ...FAILURE_MESSAGE, message: 'Invalid token. Unauthorized access.' });
        }

        // All good
        next();
    })
}

export default verifyTokenMiddleware;