// Node.js built-in modules

// Third-party libraries
import mongoose, { type Document, model, type Types } from 'mongoose'
import { nanoid } from 'nanoid'

// Own modules
import { type ITrack } from './Track.js'

// Destructuring and global variables
const { Schema } = mongoose

export interface IUserPopulated extends IUser {
    tracks: ITrack[]
}

export interface IUser extends Document {
    username: string
    accessToken: string
    tracks: Types.ObjectId[] | ITrack[]
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    accessToken: { type: String, required: false },
    tracks: [{ type: Schema.Types.ObjectId, ref: 'Track' }]
})

userSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.accessToken = nanoid()
    }
    next()
})

// Compile the schema into a model
const UserModel = model<IUser>('User', userSchema)

export default UserModel
