// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import {
    createTrack
} from '../controllers/tracksController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/tracks
 * @desc Post a new track
 * @access Public
 * @param {string} req.body.accessToken The access token required to authenticate the request.
 * @param {Object} req.body.trackName The name of the track.
 * @param {Object} [req.body.timeOffset] Relative Time Offset (milliseconds).
 */
router.post('/',
    asyncErrorHandler(createTrack)
)

export default router
