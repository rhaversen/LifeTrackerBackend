// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { createUser } from '../controllers/userController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/tracks
 * @desc Create a new user with a username and return access token
 * @access Public
 */
router.post('/',
    asyncErrorHandler(createUser)
)

export default router
