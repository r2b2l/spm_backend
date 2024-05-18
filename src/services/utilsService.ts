import crypto from 'crypto';
// Purpose: Service for utility functions.

class UtilsService {
    generateRandomString(length: number) {
        return crypto
        .randomBytes(60)
        .toString('hex')
        .slice(0, length);
      }
}

export default UtilsService;