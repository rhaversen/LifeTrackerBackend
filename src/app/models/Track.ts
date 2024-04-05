// Node.js built-in modules

// Third-party libraries
import { type Document, model, Schema, type Types } from 'mongoose'

// Own modules
import logger from '../utils/logger.js'
const trackTypesModule = await import('../utils/trackTypes.js')

// Destructuring and global variables
const trackTypes = trackTypesModule.trackTypes

export interface ITrack extends Document {
    // Properties
    _id: Types.ObjectId
    trackName: string
    date: Date // The date the track took place
    duration?: number // The duration of the track in minutes
    userId: Types.ObjectId // The user who created the track
    createdAt: Date // The date the track was created in the system
    data?: Record<string, unknown> // The data of the track

    // Methods
    validateTrackNameAndData: (trackName: string, data?: Record<string, unknown>) => boolean
}

const trackSchema = new Schema<ITrack>({
    trackName: {
        type: Schema.Types.String,
        required: true,
        enum: Object.keys(trackTypes)
    },
    date: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now
    },
    duration: {
        type: Number,
        required: false,
        default: 0,
        validate: {
            validator: (value: number) => value >= 0,
            message: 'Duration must be a positive number'
        }
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    data: {
        type: Schema.Types.Mixed,
        required: false
    }
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

// Adding validation to data
trackSchema.path('data').validate(function () {
    validateTrackNameAndData(this.trackName, this.data)
}, 'Data is not valid')

export function validateTrackNameAndData (trackName: string, data?: Record<string, unknown>): boolean {
    // Check if the trackName is a valid track type
    if (!Object.keys(trackTypes).includes(trackName)) return false

    // No data is always valid data
    if (data === undefined || data === null) return true

    // Get the allowed keys for the track type
    const allowedKeys = trackTypes[trackName as keyof typeof trackTypes].allowedKeys as Record<string, unknown> // The type assertion is necessary because TypeScript does not know that the trackName is a valid key of trackType

    // Check if the data has the allowed keys and the correct types
    for (const key in data) {
        // Check if key is allowed
        if (!Object.keys(allowedKeys).includes(key)) return false
        // Check if the type is correct
        if (typeof data[key] !== typeof allowedKeys[key]) return false
    }

    // Data is valid
    return true
}

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
