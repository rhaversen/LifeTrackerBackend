// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'

// Own modules
import TrackModel, { type ITrack } from '../models/Track.js'

export async function createTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
    interface TrackRequestBody {
        trackName: string
        UTCDateTime: string
    }

    const {
        trackName,
        UTCDateTime
    } = req.body as TrackRequestBody

    const date = new Date(UTCDateTime)

    const newTrack = new TrackModel({
        trackName,
        UTCDateTime: date
    })

    const savedTrack = await newTrack.save() as ITrack

    res.status(201).json(savedTrack)
}
