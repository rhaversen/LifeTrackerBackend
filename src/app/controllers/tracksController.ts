import { type NextFunction, type Request, type Response } from 'express'
import mongoose from 'mongoose'

import TrackModel, { transformTrack } from '../models/Track.js'
import UserModel, { type IUser } from '../models/User.js'
import logger from '../utils/logger.js'

// Webhook endpoints - accessToken authentication for external integrations

export async function createTrackWebhook (req: Request, res: Response, next: NextFunction): Promise<void> {
	logger.info('Webhook: Creating track')

	const {
		accessToken,
		trackName,
		timeOffset
	} = req.body as {
		accessToken?: unknown
		trackName?: unknown
		timeOffset?: unknown
	}

	if (typeof trackName !== 'string' || trackName === '') {
		res.status(400).json({ error: 'trackName must be a non-empty string.' })
		return
	}

	if (typeof accessToken !== 'string' || accessToken === '') {
		res.status(400).json({ error: 'accessToken must be a non-empty string.' })
		return
	}

	// If timeOffset is provided, it must be a number
	if (timeOffset !== undefined && typeof timeOffset !== 'number') {
		res.status(400).json({ error: 'timeOffset must be a number.' })
		return
	}

	const date = new Date(Date.now() + (timeOffset ?? 0))

	// Check if the potential date is valid
	if (isNaN(date.getTime())) {
		res.status(400).json({ error: 'Provided timeOffset results in an invalid date.' })
		return
	}

	const user = await UserModel.findOne({ accessToken })

	if (user === null) {
		res.status(404).json({ error: 'accessToken is not valid.' })
		return
	}

	try {
		const newTrack = await TrackModel.create({
			trackName,
			date,
			userId: user._id
		})

		res.status(201).json(transformTrack(newTrack))
	} catch (error) {
		logger.error('Webhook: Track creation failed', { error })
		if (error instanceof mongoose.Error.ValidationError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	}
}

export async function deleteLastTrackWebhook (req: Request, res: Response, _next: NextFunction): Promise<void> {
	logger.info('Webhook: Deleting last track')

	const { accessToken } = req.body as { accessToken?: unknown }

	if (typeof accessToken !== 'string' || accessToken === '') {
		res.status(400).json({ error: 'accessToken must be a non-empty string.' })
		return
	}

	const user = await UserModel.findOne({ accessToken })

	if (user === null) {
		res.status(404).json({ error: 'accessToken is not valid.' })
		return
	}

	// Find and delete the last track created by the user
	await TrackModel.findOneAndDelete({ userId: user._id }).sort({ createdAt: -1 })

	res.status(204).send()
}

// RESTful endpoints - session authentication

export async function createTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
	logger.info(`Creating track with name: ${req.body.trackName ?? 'N/A'}`)

	const user = req.user as IUser | undefined

	if (user === undefined) {
		res.status(401).json({ error: 'User not found.' })
		return
	}

	const allowedFields: Record<string, unknown> = {
		trackName: req.body.trackName,
		date: req.body.date ?? new Date(),
		userId: user._id
	}

	try {
		const newTrack = await TrackModel.create(allowedFields)
		logger.debug(`Track created successfully: ID ${newTrack.id}`)
		res.status(201).json(transformTrack(newTrack))
	} catch (error) {
		logger.error(`Track creation failed for name: ${req.body.trackName ?? 'N/A'}`, { error })
		if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	}
}

export async function importTracks (req: Request, res: Response, next: NextFunction): Promise<void> {
	logger.info('Bulk importing tracks')

	const user = req.user as IUser | undefined

	if (user === undefined) {
		res.status(401).json({ error: 'User not found.' })
		return
	}

	const { trackName, dates } = req.body as { trackName?: unknown, dates?: unknown }

	if (typeof trackName !== 'string' || trackName.trim() === '') {
		res.status(400).json({ error: 'trackName must be a non-empty string.' })
		return
	}

	if (!Array.isArray(dates) || dates.length === 0) {
		res.status(400).json({ error: 'dates must be a non-empty array.' })
		return
	}

	const validDates: Date[] = []
	for (const dateStr of dates) {
		if (typeof dateStr !== 'string') {
			res.status(400).json({ error: 'Each date must be a string.' })
			return
		}
		const date = new Date(dateStr)
		if (isNaN(date.getTime())) {
			res.status(400).json({ error: `Invalid date: ${dateStr}` })
			return
		}
		validDates.push(date)
	}

	try {
		const tracksToCreate = validDates.map(date => ({
			trackName: trackName.trim(),
			date,
			userId: user._id
		}))

		const created = await TrackModel.insertMany(tracksToCreate)
		logger.info(`Bulk import: created ${created.length} tracks`)
		res.status(201).json({ created: created.length })
	} catch (error) {
		logger.error('Bulk import failed', { error })
		if (error instanceof mongoose.Error.ValidationError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	}
}

export async function getTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
	const trackId = req.params.id
	logger.debug(`Getting track: ID ${trackId}`)

	const user = req.user as IUser | undefined

	if (user === undefined) {
		res.status(401).json({ error: 'User not found.' })
		return
	}

	try {
		const track = await TrackModel.findOne({ _id: trackId, userId: user._id }).lean()

		if (track === null || track === undefined) {
			logger.warn(`Get track failed: Track not found. ID: ${trackId}`)
			res.status(404).json({ error: 'Track not found.' })
			return
		}

		logger.debug(`Retrieved track successfully: ID ${trackId}`)
		res.status(200).json(transformTrack(track))
	} catch (error) {
		logger.error(`Get track failed: Error retrieving track ID ${trackId}`, { error })
		if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	}
}

export async function getTracks (req: Request, res: Response, next: NextFunction): Promise<void> {
	logger.debug('Getting tracks')

	const user = req.user as IUser | undefined

	if (user === undefined) {
		res.status(401).json({ error: 'User not found.' })
		return
	}

	const { trackName, fromDate, toDate, limit, skip, sort } = req.query as Record<string, unknown>

	try {
		const query = TrackModel.find({
			userId: user._id,
			...(trackName !== undefined && { trackName }),
			...(fromDate !== undefined && { date: { $gte: new Date(fromDate as string) } }),
			...(toDate !== undefined && { date: { ...((fromDate !== undefined) && { $gte: new Date(fromDate as string) }), $lte: new Date(toDate as string) } })
		})

		// Apply sorting
		if (sort !== undefined && typeof sort === 'string') {
			query.sort(sort)
		}

		// Apply skip
		if (skip !== undefined && typeof skip === 'string') {
			const skipNum = parseInt(skip, 10)
			if (!isNaN(skipNum) && skipNum >= 0) {
				query.skip(skipNum)
			}
		}

		// Apply limit
		if (limit !== undefined && typeof limit === 'string') {
			const limitNum = parseInt(limit, 10)
			if (!isNaN(limitNum) && limitNum > 0) {
				query.limit(limitNum)
			}
		}

		const tracks = await query.lean()

		logger.debug(`Retrieved ${tracks.length} tracks`)
		res.status(200).json(tracks.map(transformTrack))
	} catch (error) {
		logger.error('Failed to get tracks', { error })
		if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	}
}

export async function patchTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
	const trackId = req.params.id
	logger.info(`Patching track: ID ${trackId}`)

	const user = req.user as IUser | undefined

	if (user === undefined) {
		res.status(401).json({ error: 'User not found.' })
		return
	}

	const session = await mongoose.startSession()
	session.startTransaction()

	try {
		const track = await TrackModel.findOne({ _id: trackId, userId: user._id }).session(session)

		if (track === null || track === undefined) {
			logger.warn(`Patch track failed: Track not found. ID: ${trackId}`)
			res.status(404).json({ error: 'Track not found.' })
			await session.abortTransaction()
			await session.endSession()
			return
		}

		let updateApplied = false

		if (req.body.trackName !== undefined && track.trackName !== req.body.trackName) {
			logger.debug(`Updating trackName for track ID ${trackId}`)
			track.trackName = req.body.trackName
			updateApplied = true
		}

		if (req.body.date !== undefined) {
			logger.debug(`Updating date for track ID ${trackId}`)
			track.date = new Date(req.body.date)
			updateApplied = true
		}

		if (!updateApplied) {
			logger.info(`Patch track: No changes detected for track ID ${trackId}`)
			res.status(200).json(transformTrack(track))
			await session.commitTransaction()
			await session.endSession()
			return
		}

		await track.validate()
		await track.save({ session })

		await session.commitTransaction()
		logger.info(`Track patched successfully: ID ${trackId}`)
		res.status(200).json(transformTrack(track))
	} catch (error) {
		await session.abortTransaction()
		logger.error(`Patch track failed: Error updating track ID ${trackId}`, { error })
		if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	} finally {
		await session.endSession()
	}
}

export async function deleteTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
	const trackId = req.params.id
	logger.info(`Deleting track: ID ${trackId}`)

	const user = req.user as IUser | undefined

	if (user === undefined) {
		res.status(401).json({ error: 'User not found.' })
		return
	}

	if (req.body == null || typeof req.body !== 'object') {
		logger.warn(`Delete track failed: Request body is missing or invalid. ID: ${trackId}`)
		res.status(400).json({ error: 'Request body is required.' })
		return
	}

	const { confirm } = req.body as { confirm?: unknown }

	if (confirm !== true) {
		logger.warn(`Delete track failed: Confirmation not provided. ID: ${trackId}`)
		res.status(400).json({ error: 'Deletion must be confirmed.' })
		return
	}

	try {
		const track = await TrackModel.findOne({ _id: trackId, userId: user._id })

		if (track === null || track === undefined) {
			logger.warn(`Delete track failed: Track not found. ID: ${trackId}`)
			res.status(404).json({ error: 'Track not found.' })
			return
		}

		await track.deleteOne()
		logger.info(`Track deleted successfully: ID ${trackId}`)
		res.status(204).send()
	} catch (error) {
		logger.error(`Delete track failed: Error deleting track ID ${trackId}`, { error })
		if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	}
}

export async function bulkRenameTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
	logger.info('Bulk renaming tracks')

	const user = req.user as IUser | undefined

	if (user === undefined) {
		res.status(401).json({ error: 'User not found.' })
		return
	}

	const { oldName, newName } = req.body as { oldName?: unknown, newName?: unknown }

	if (typeof oldName !== 'string' || oldName === '') {
		res.status(400).json({ error: 'oldName must be a non-empty string.' })
		return
	}

	if (typeof newName !== 'string' || newName === '') {
		res.status(400).json({ error: 'newName must be a non-empty string.' })
		return
	}

	if (oldName === newName) {
		res.status(400).json({ error: 'oldName and newName must be different.' })
		return
	}

	try {
		const result = await TrackModel.updateMany(
			{ userId: user._id, trackName: oldName },
			{ $set: { trackName: newName } }
		)

		logger.info(`Bulk rename: ${result.modifiedCount} tracks renamed from "${oldName}" to "${newName}"`)
		res.status(200).json({ modifiedCount: result.modifiedCount })
	} catch (error) {
		logger.error('Bulk rename failed', { error })
		if (error instanceof mongoose.Error.ValidationError) {
			res.status(400).json({ error: error.message })
		} else {
			next(error)
		}
	}
}
