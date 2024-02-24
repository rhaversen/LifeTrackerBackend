// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { createTrack } from '../controllers/tracksController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/tracks
 * @desc Post a new track to the access token provided in the body
 * @access Public
 */
router.post('/',
    asyncErrorHandler(createTrack)
)

export default router
