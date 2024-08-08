// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { createUser, deleteUser, createAccessToken } from '../controllers/userController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/users
 * @desc Create a new user
 * @access Public
 * @param {string} req.body.userName The username given to this user.
 * @param {string} req.body.email The email of the user.
 * @param {string} req.body.password The password of the user.
 * @param {string} req.body.confirmPassword The password of the user.
 * @return {number} res.status The status code of the HTTP response.
 * @return {string} res.body The newly created user.
 */
router.post('/',
    asyncErrorHandler(createUser)
)

/**
 * @route GET api/v1/users/:id/accessToken
 * @desc Create a new access token for the user
 * @access Public
 * @param {string} req.body.email The email of the user.
 * @param {string} req.body.password The password of the user.
 * @return {number} res.status The status code of the HTTP response.
 * @return {string} res.body The new accessToken.
 */
router.get('/:id/accessToken',
    asyncErrorHandler(createAccessToken)
)

/**
 * @route DELETE api/v1/users/:id
 * @desc Delete the user
 * @access Public
 * @param {string} req.body.email The users email.
 * @param {string} req.body.password The users password.
 * @param {string} req.params.id The id of the user to delete.
 * @param {boolean} req.body.confirmDeletion Must be true to confirm deletion.
 * @return {number} res.status The status code of the HTTP response.
 */
router.delete('/:id',
    asyncErrorHandler(deleteUser)
)

export default router
