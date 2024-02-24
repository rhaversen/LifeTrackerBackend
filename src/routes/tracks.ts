// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import {
    createTrackAtCurrentTime
} from '../controllers/tracksController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/tracks
 * @desc Post a new track at the current time to the access token provided in the body.
 * @access Public
 * @param {string} req.body.accessToken The access token required to authenticate the request.
 * @param {Object} req.body.name The name of the track.
 */
router.post('/current-time',
    asyncErrorHandler(createTrackAtCurrentTime)
)

export default router
