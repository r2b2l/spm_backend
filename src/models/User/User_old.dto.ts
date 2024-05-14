// import { IsString, MaxLength, IsPositive, IsEmail, IsStrongPassword, Max } from 'class-validator';

// class UserDtoOld {

//     @IsString()
//     @MaxLength(50, {
//         message: 'Description is too long'
//     })
//     public username: string;

//     @IsEmail({}, {
//         message: 'Invalid mail'
//     })
//     @MaxLength(320, {
//         message: 'Invalid mail'
//     })
//     public mail: string;

//     @IsStrongPassword({
//         minLength: 6,
//         minLowercase: 1,
//         minNumbers: 1,
//         minSymbols: 1,
//         minUppercase: 1
//     }, {
//         message: 'Invalid password'
//     })
//     @MaxLength(250, {
//         message: 'Invalid password'
//     })
//     public password: string;

//     @IsPositive()
//     @Max(10)
//     public role: number;

//     constructor(username: string, mail: string, password: string, role: number) {
//         this.username = username;
//         this.mail = mail;
//         this.password = password;
//         this.role = role;
//     }
// }

// export default UserDto;