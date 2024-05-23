import { IsBoolean, IsDate, IsMongoId, IsString } from "class-validator";

class PlatformLinkDTO {
    @IsMongoId()
    user: string;

    @IsMongoId()
    platform: string;

    @IsString()
    profileId: string;

    @IsBoolean()
    isActive: boolean;

    @IsString()
    token: string;

    @IsDate()
    tokenExpiresAt: Date;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    constructor(user: string, platform: string, profileId: string, isActive: boolean, token: string, tokenExpiresAt: Date, createdAt: Date, updatedAt: Date) {
        this.user = user;
        this.platform = platform;
        this.profileId = profileId;
        this.isActive = isActive;
        this.token = token;
        this.tokenExpiresAt = tokenExpiresAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default PlatformLinkDTO;