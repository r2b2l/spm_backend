import * as express from "express";
import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

class JwtService {
    private secretKey: Secret = process.env.API_JWT_SECRET as Secret;

    /**
     * Generate a JWT token
     * @param userId
     * @returns
     */
    generateToken(userId: string): string {
        return jwt.sign({ userId }, this.secretKey, { expiresIn: process.env.API_JWT_EXPIRES_IN });
    }

    /**
     * Decode JWT token for a given token
     * @param token
     * @returns
     */
    getDecodedData(token: string): any {
        return jwt.verify(token, this.secretKey);
    }

    /**
     * Decode JWT token for a Request
     * @param request
     * @returns
     */
    getSessionToken(request: express.Request): any {
        const token = request.header('Authorization')!;
        return this.getDecodedData(token);
    }
}

export default JwtService;