import { Router } from 'express'

import { createUser, deleteUser, createAccessToken, requestPasswordResetEmail, resetPassword } from '../controllers/userController.js'

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
	createUser
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
	createAccessToken
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
	deleteUser
)

/**
 * @route POST api/v1/users/request-password-reset-email
 * @desc Request a password reset email
 * @access Public
 * @param {string} req.body.email The email of the user.
 * @return {number} res.status The status code of the HTTP response.
 */
router.post('/request-password-reset-email',
	requestPasswordResetEmail
)

/**
 * @route PATCH api/v1/users/reset-password
 * @desc Updates a users password using a password reset code
 * @access Public
 * @param {string} req.body.passwordResetCode The password reset code.
 * @param {string} req.body.password The new password for the user.
 * @param {string} req.body.confirmPassword The new password for the user.
*/
router.patch('/reset-password',
	resetPassword
)

export default router
