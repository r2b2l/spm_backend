import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as express from 'express';

/**
 * Validate a request body against a Dto Model
 * If SkipMissingProperties, don't throw error if a property is not set
 * @param type
 * @param skipMissingProperties
 * @returns
 */
function validationMiddleware<T>(type: any, skipMissingProperties: boolean = false): express.RequestHandler {
    return (req, res, next) => {
        validate(plainToInstance(type, req.body), { skipMissingProperties })
            .then(errors => {
                if (errors.length > 0) {
                    const validationResults = errors.map((error) => ({
                        property: error.property,
                        message: error.constraints![Object.keys(error.constraints!)[0]]
                    }))
                    next(res.status(400).json({ isSuccess: false, message: validationResults }));
                } else {
                    next();
                }
            });
    };
}

export default validationMiddleware;