// Node.js built-in modules

// Third-party libraries
import mongoose, { type Document, model, type Types } from 'mongoose'
import { nanoid } from 'nanoid'

// Own modules
import { type ITrack } from './Track.js'
import logger from '../utils/logger.js'

// Destructuring and global variables
const { Schema } = mongoose

export interface IUserPopulated extends IUser {
    tracks: ITrack[]
}

export interface IUser extends Document {
    userName: string
    accessToken: string
    tracks: Types.ObjectId[] | ITrack[]
}

const userSchema = new Schema<IUser>({
    userName: { type: String, required: true },
    accessToken: { type: String, required: false },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
})

userSchema.pre('save', async function (next) {
    logger.silly('Saving user')
    if (this.isNew as boolean) {
        this.accessToken = nanoid()
    }
    next()
})

// Compile the schema into a model
const UserModel = model<IUser>('User', userSchema)

export default UserModel
