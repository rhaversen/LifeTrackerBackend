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
    date: Date // The date the track took place
    userId: IUser['_id']
    createdAt: Date // The date the track was created in the system
}

const trackSchema = new Schema<ITrack>({
    trackName: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, required: true, default: Date.now }
})

// Adding indexes
trackSchema.index({ userId: 1 }) // Index for sorting by userId in ascending order (Or to find all tracks by a user id)
trackSchema.index({ createdAt: -1 }) // Index for sorting by creation date in descending order

// Pre-save middleware
trackSchema.pre('save', function (next) {
    logger.silly('Saving track')
    next()
})

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
