// Node.js built-in modules

// Third-party libraries
import mongoose, { type Document, model } from 'mongoose'
import { nanoid } from 'nanoid'

// Own modules
import logger from '../utils/logger.js'

// Destructuring and global variables
const { Schema } = mongoose

export interface IUser extends Document {
    userName: string
    accessToken: string
    signUpDate: Date
}

const userSchema = new Schema<IUser>({
    userName: { type: String, required: true },
    accessToken: { type: String, required: false, unique: true },
    signUpDate: { type: Date, required: true }
})

userSchema.pre('save', async function (next) {
    logger.silly('Saving user')
    if (this.isNew) {
        this.accessToken = nanoid()
    }
    next()
})

// Compile the schema into a model
const UserModel = model<IUser>('User', userSchema)

export default UserModel
