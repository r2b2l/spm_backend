import mongoose, { Schema, ObjectId } from "mongoose";

const platformSchema = new mongoose.Schema({
    id: { type: Number, unique: true},
    name: String,
    endpointUrl: String,
    logoUrl: String,
    description: String,
    isActive: Boolean,
    createdAt: Date,
    updatedAt: Date
});

interface PlatformType {
    id: number,
    name?: string,
    endpointUrl?: string,
    logoUrl?: string,
    description?: string,
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date
}

const PlatformModel = mongoose.model<PlatformType>('Platform', platformSchema);

export default PlatformModel;
module.exports = PlatformModel;