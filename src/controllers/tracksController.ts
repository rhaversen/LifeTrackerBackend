// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'

// Own modules
import TrackModel from '../models/Track.js'
import UserModel from '../models/User.js'
import logger from '../utils/logger.js'

export async function createTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Creating track')

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
        res.status(400).json({ error: 'accessToken is not valid.' })
        return
    }

    const newTrack = new TrackModel({
        trackName,
        date,
        userId: user._id
    })

    const savedTrack = await newTrack.save()

    res.status(201).json(savedTrack)
}

export async function deleteLastTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Deleting last track')

    const {
        accessToken
    } = req.body as {
        accessToken?: unknown
    }

    if (typeof accessToken !== 'string' || accessToken === '') {
        res.status(400).json({ error: 'accessToken must be a non-empty string.' })
        return
    }

    const user = await UserModel.findOne({ accessToken })

    if (user === null) {
        res.status(400).json({ error: 'accessToken is not valid.' })
        return
    }

    // Find and delete the last track created by the user
    await TrackModel.findOneAndDelete({ userId: user._id }).sort({ createdAt: -1 })

    res.status(204).send()
}

export async function getTracksWithQuery (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Fetching tracks with query')

    const {
        accessToken
    } = req.body as {
        accessToken?: unknown
    }

    const {
        trackName
    } = req.query as {
        trackName?: unknown
    }

    if (typeof accessToken !== 'string' || accessToken === '') {
        res.status(400).json({ error: 'accessToken must be a non-empty string.' })
        return
    }

    // If trackName is provided, it must be a non-empty string
    if (trackName !== undefined && (typeof trackName !== 'string' || trackName === '')) {
        res.status(400).json({ error: 'trackName must be a non-empty string.' })
        return
    }

    const user = await UserModel.findOne({ accessToken })

    if (user === null) {
        res.status(400).json({ error: 'accessToken is not valid.' })
        return
    }

    const tracks = await TrackModel.find({
        userId: user._id,
        trackName
    })

    res.status(200).send(tracks)
}
