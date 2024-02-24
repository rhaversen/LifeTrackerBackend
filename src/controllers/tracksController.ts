// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'

// Own modules
import TrackModel, { type ITrack } from '../models/Track.js'
import UserModel from '../models/User.js'

export async function createTrackAtCurrentTime (req: Request, res: Response, next: NextFunction): Promise<void> {
    interface TrackRequestBody {
        accessToken: string
        trackName: string
    }

    const {
        accessToken,
        trackName
    } = req.body as TrackRequestBody

    const newTrack = new TrackModel({
        trackName,
        UTCDateTime: Date.now()
    })

    const savedTrack = await newTrack.save() as ITrack

    const filter = { accessToken }
    const update = { $push: { tracks: savedTrack } }
    await UserModel.findOneAndUpdate(filter, update).exec()

    res.status(201).json(savedTrack)
}

export async function createTrackAtRelativeTime (req: Request, res: Response, next: NextFunction): Promise<void> {
    interface TrackRequestBody {
        accessToken: string
        trackName: string
        timeOffset: number
    }

    const {
        accessToken,
        trackName,
        timeOffset
    } = req.body as TrackRequestBody

    const newTrack = new TrackModel({
        trackName,
        UTCDateTime: Date.now() + timeOffset
    })

    const savedTrack = await newTrack.save() as ITrack

    const filter = { accessToken }
    const update = { $push: { tracks: savedTrack } }
    await UserModel.findOneAndUpdate(filter, update).exec()

    res.status(201).json(savedTrack)
}
