import { type Document, type FlattenMaps, model, Schema, type Types } from 'mongoose'

import logger from '../utils/logger.js'

export interface ITrack extends Document {
	_id: Types.ObjectId
	trackName: string
	date: Date
	userId: Types.ObjectId

	createdAt: Date
	updatedAt: Date

	_wasNew?: boolean
}

export interface ITrackFrontend {
	_id: string
	trackName: string
	date: Date
	userId: string
	createdAt: Date
	updatedAt: Date
}

export function transformTrack (trackDoc: ITrack | FlattenMaps<ITrack>): ITrackFrontend {
	return {
		_id: trackDoc._id.toString(),
		trackName: trackDoc.trackName,
		date: trackDoc.date,
		userId: trackDoc.userId.toString(),
		createdAt: trackDoc.createdAt,
		updatedAt: trackDoc.updatedAt
	}
}

const trackSchema = new Schema<ITrack>({
	trackName: {
		type: Schema.Types.String,
		required: true,
		trim: true,
		maxLength: [100, 'Track name can be at most 100 characters']
	},
	date: {
		type: Schema.Types.Date,
		required: true,
		default: Date.now
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, {
	timestamps: true
})

trackSchema.index({ userId: 1 })
trackSchema.index({ trackName: 1 })
trackSchema.index({ date: -1 })

trackSchema.pre('save', function (next) {
	this._wasNew = this.isNew
	if (this.isNew) {
		logger.debug(`Saving new track: "${this.trackName}"`)
	} else {
		logger.debug(`Saving updated track: ID ${this.id}, "${this.trackName}"`)
	}
	next()
})

const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
