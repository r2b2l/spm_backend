import { IsBoolean, IsDate, IsMongoId } from "class-validator";

class PlatformLinkDTO {
    @IsMongoId()
    user: string;

    @IsMongoId()
    platform: string;

    @IsBoolean()
    isActive: boolean;

    @IsDate()
    createdAt: Date;
    
    @IsDate()
    updatedAt: Date;

    constructor(user: string, platform: string, isActive: boolean, createdAt: Date, updatedAt: Date) {
        this.user = user;
        this.platform = platform;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default PlatformLinkDTO;