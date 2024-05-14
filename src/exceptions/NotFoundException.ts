import HttpException from "./HttpException";

class NotFoundException extends HttpException {
    constructor(className: string, id: string) {
        super(404, className + ' with id ' + id + ' not found');
    }
}

export default NotFoundException;