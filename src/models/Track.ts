// Node.js built-in modules

// Third-party libraries
import { type Document, model, type Types, Schema } from 'mongoose'

// Own modules
import logger from '../utils/logger.js'

// Destructuring and global variables

export interface ITrack extends Document {
    // Properties
    _id: Types.ObjectId
    trackName: string
    date: Date // The date the track took place
    userId: Types.ObjectId // The user who created the track
    createdAt: Date // The date the track was created in the system
}

const trackSchema = new Schema<ITrack>({
    trackName: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, required: true, default: Date.now }
})

// Adding indexes
trackSchema.index({ userId: 1 })
trackSchema.index({ trackName: 1 })
trackSchema.index({ createdAt: -1 })

// Pre-save middleware
trackSchema.pre('save', function (next) {
    logger.silly('Saving track')
    next()
})

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
