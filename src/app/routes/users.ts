// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { createUser, deleteUser } from '../controllers/userController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/users
 * @desc Create a new user
 * @access Public
 * @param {string} req.body.userName The username given to this user.
 * @return {number} res.status The status code of the HTTP response.
 * @return {string} res.body The accessToken of the newly created user.
 */
router.post('/',
    asyncErrorHandler(createUser)
)

/**
 * @route DELETE api/v1/users
 * @desc Delete the user
 * @access Public
 * @param {string} req.body.email The users email.
 * @param {string} req.body.password The users password.
 * @param {boolean} req.body.confirmDeletion Must be true to confirm deletion.
 * @return {number} res.status The status code of the HTTP response.
 */
router.delete('/',
    asyncErrorHandler(deleteUser)
)

export default router
