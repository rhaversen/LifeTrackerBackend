import { Router } from 'express'

import { ensureAuthenticated, getAuthenticatedUser } from '../controllers/authController.js'
import { createUser, deleteUser, createAccessToken, requestPasswordResetEmail, resetPassword, updateTrackNameTranslations } from '../controllers/userController.js'

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

/**
 * @route GET api/v1/users/user
 * @desc Get authenticated user data
 * @access Private
 * @return {number} res.status The status code of the HTTP response.
 * @return {object} res.body The user object with trackNameTranslations.
 */
router.get('/user',
	ensureAuthenticated,
	getAuthenticatedUser
)

/**
 * @route PATCH api/v1/users/track-name-translations
 * @desc Update track name translations for the authenticated user
 * @access Private
 * @param {Record<string, string>} req.body.translations The track name translations object
 * @return {number} res.status The status code of the HTTP response
 * @return {Record<string, string>} res.body The updated translations
 */
router.patch('/track-name-translations',
	ensureAuthenticated,
	updateTrackNameTranslations
)

export default router
