import { IsBoolean, IsDate, IsNumber, IsString, IsUrl, MaxLength, isString } from "class-validator";

class PlatformDto {
    @IsNumber()
    public id: number;

    @IsString()
    @MaxLength(100, {
        message: 'name is too long'
    })
    public name: string;

    @IsString()
    public endpointUrl: string;

    @IsUrl()
    public logoUrl: string;

    @IsString()
    @MaxLength(200, {
        message: 'description is too long'
    })
    public description: string;

    @IsBoolean()
    public isActive: boolean;

    @IsDate()
    public createdAt: Date;

    @IsDate()
    public updatedAt: Date;

    constructor(id: number, name: string, endpointUrl: string, logoUrl: string, description: string, isActive: boolean, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.name = name;
        this.endpointUrl = endpointUrl;
        this.logoUrl = logoUrl;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default PlatformDto;