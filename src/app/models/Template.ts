// Node.js built-in modules

// Third-party libraries
import { type Document, model, Schema, type Types } from 'mongoose'

// Own modules
import logger from '../utils/logger.js'
import { validateTrackNameAndData } from './Track.js'

export interface ITemplate extends Document {
    // Properties
    _id: Types.ObjectId
    templateName: string
    userId: Types.ObjectId // The user who created the template
    createdAt: Date // The date the template was created in the system
    data: Record<string, Record<string, unknown>> // The data of the template (Collection of tracks)

    // Methods
    validateTemplateTracks: (template: ITemplate) => boolean
}

const templateSchema = new Schema<ITemplate>({
    templateName: {
        type: Schema.Types.String,
        required: true
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
        required: true
    }
})

// Adding indexes
templateSchema.index({ userId: 1 })
templateSchema.index({ templateName: 1 })
templateSchema.index({ createdAt: -1 })

// Pre-save middleware
templateSchema.pre('save', function (next) {
    logger.silly('Saving template')
    next()
})

// Adding validation to data
templateSchema.path('data').validate(function () {
    validateTemplateTracks(this.data)
}, 'Data is not valid')

export function validateTemplateTracks (data: Record<string, Record<string, unknown>>): boolean {
    const entries = Object.entries(data)
    // Validate each entry in the data
    return entries.every(([trackName, trackData]) => {
        return validateTrackNameAndData(trackName, trackData)
    })
}

// Compile the schema into a model
const TemplateModel = model<ITemplate>('Template', templateSchema, 'templates')

export default TemplateModel
