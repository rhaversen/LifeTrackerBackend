// Node.js built-in modules

// Third-party libraries
import mongoose, { type Document, model } from 'mongoose'

// Own modules
import logger from '../utils/logger.js'
import { type IUser } from './User.js'

// Destructuring and global variables
const { Schema } = mongoose

export interface ITrack extends Document {
    trackName: string
    Date: Date
    userId: IUser['_id']
}

const trackSchema = new Schema<ITrack>({
    trackName: { type: String, required: true },
    Date: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

// Adding index to the userId field
trackSchema.index({ userId: 1 })

trackSchema.pre('save', function (next) {
    logger.silly('Saving track')
    next()
})

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
