import mongoose, { ObjectId, Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    mail: { type: String, unique: true },
    password: String,
    role: Number,
    authToken: String,
    tokenExpiresAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

interface UserType {
    username?: string,
    mail?: string,
    password?: string,
    role?: number,
    authToken?: string,
    tokenExpiresAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
}

const UserModel = mongoose.model<UserType>('User', userSchema);

export default UserModel;
module.exports = UserModel;