// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { loginUserLocal, logoutUser } from '../controllers/authController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/auth/login-local
 * @desc Login user and return session cookie
 * @access Public
 * @param {string} req.body.email The email of the user.
 * @param {string} req.body.password The password of the user.
 * @param {string} [req.body.stayLoggedIn] Whether to stay logged in or not.
 * @return {number} res.status The status code of the HTTP response.
 * @return {object} res.body The user object.
 * @return {string} res.headers['set-cookie'] The session cookie.
 */
router.post('/login-local',
    asyncErrorHandler(loginUserLocal)
)

/**
 * @route POST api/v1/auth/logout
 * @desc Logout user and clear session cookie
 * @access Private
 * @return {number} res.status The status code of the HTTP response.
 */
router.post('/logout',
    asyncErrorHandler(logoutUser)
)

export default router
