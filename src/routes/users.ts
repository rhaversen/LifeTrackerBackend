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
 * @route POST api/v1/users
 * @desc Create a new user
 * @access Public
 * @param {string} req.body.userName The username given to this user
 * @return {string} accessToken
 */
router.post('/',
    asyncErrorHandler(createUser)
)

export default router
