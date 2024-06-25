import HttpException from "./HttpException";

export class SpotifyException extends HttpException {
    constructor(status: number, message: string) {
        super(status, `Spotify API Error - ${message}`);
    }
}
