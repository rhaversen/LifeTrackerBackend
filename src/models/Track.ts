// Node.js built-in modules

// Third-party libraries
import mongoose, { type Document, model } from 'mongoose'

// Own modules

// Destructuring and global variables
const { Schema } = mongoose

export interface ITrack extends Document {
    trackName: string
    UTCDateTime: Date
}

const trackSchema = new Schema<ITrack>({
    trackName: { type: String, required: true },
    UTCDateTime: { type: Date, required: true }
})

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
