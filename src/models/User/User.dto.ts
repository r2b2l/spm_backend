import { IsEmail, IsNumber, IsString, IsStrongPassword, MaxLength } from "class-validator";

class UserDto {

    @IsString()
    @MaxLength(50, {
        message: 'username is too long'
    })
    public username: string;

    @IsEmail()
    public mail: string;

    @IsStrongPassword() // Check if match 6+ char aBcd5%
    public password: string;

    @IsNumber()
    public role: number;

    constructor(username: string, mail: string, password: string, role: number) {
        this.username = username;
        this.mail = mail;
        this.password = password;
        this.role = role;
    }
}

export default UserDto;