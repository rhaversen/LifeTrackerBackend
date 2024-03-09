// Node.js built-in modules

// Third-party libraries
import mongoose, { type Document, model } from 'mongoose'
import { nanoid } from 'nanoid'

// Own modules
import logger from '../utils/logger.js'
import TrackModel from './Track.js'

// Destructuring and global variables
const { Schema } = mongoose

export interface IUser extends Document {
    userName: string // Username of the user
    accessToken: string // Unique access token for user authentication
    signUpDate: Date // The date the user signed up
    deleteUserAndAllAssociatedData: () => Promise<void>
}

// User schema definition
const userSchema = new Schema<IUser>({
    userName: { type: String, required: true },
    accessToken: { type: String, required: false, unique: true },
    signUpDate: { type: Date, required: true, default: Date.now }
})

// Pre-save middleware for User schema
userSchema.pre('save', async function (next) {
    logger.silly('Saving user')
    if (this.isNew) {
        this.accessToken = nanoid()
    }
    next()
})

// User methods
userSchema.methods.deleteUserAndAllAssociatedData = async function (this: IUser): Promise<void> {
    logger.silly('Deleting user and all associated data')

    // Start a mongoose session to use transactions
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // Delete the user
        await UserModel.findByIdAndDelete(this._id).session(session)

        // Delete all tracks created by the user
        await TrackModel.deleteMany({ userId: this._id }).session(session)

        await session.commitTransaction()
    } catch (error) {
        await session.abortTransaction()

        // Propagate the error
        throw error
    } finally {
        await session.endSession()
    }
}

// Compile the schema into a model
const UserModel = model<IUser>('User', userSchema) // Compiling the user schema into a mongoose model

export default UserModel // Export the compiled UserModel for use in other modules
