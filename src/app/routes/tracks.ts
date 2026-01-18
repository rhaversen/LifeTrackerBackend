import { Router } from 'express'

import { ensureAuthenticated } from '../controllers/authController.js'
import {
	createTrackWebhook,
	deleteLastTrackWebhook,
	createTrack,
	importTracks,
	getTrack,
	getTracks,
	patchTrack,
	deleteTrack
} from '../controllers/tracksController.js'

const router = Router()

// Webhook endpoints - accessToken authentication for external integrations

/**
 * @route POST api/v1/tracks/webhook
 * @desc Create a track via webhook using accessToken
 * @access Public
 * @param {string} req.body.accessToken - The access token for authentication.
 * @param {string} req.body.name - The name of the track.
 * @param {number} [req.body.timeOffset] - Relative time offset in milliseconds.
 * @returns {number} res.status - The status code of the HTTP response.
 * @returns {Object} res.body - The newly created track.
 */
router.post('/webhook',
	createTrackWebhook
)

/**
 * @route DELETE api/v1/tracks/webhook
 * @desc Delete the last created track via webhook using accessToken
 * @access Public
 * @param {string} req.body.accessToken - The access token for authentication.
 * @returns {number} res.status - The status code of the HTTP response.
 */
router.delete('/webhook',
	deleteLastTrackWebhook
)

// RESTful endpoints - session authentication

/**
 * @route POST api/v1/tracks
 * @desc Create a new track
 * @access Private
 * @middleware ensureAuthenticated
 * @param {string} req.body.name - The name of the track.
 * @param {string} [req.body.date] - The date of the track (defaults to now).
 * @returns {number} res.status - The status code of the HTTP response.
 * @returns {Object} res.body - The newly created track.
 */
router.post('/',
	ensureAuthenticated,
	createTrack
)

/**
 * @route POST api/v1/tracks/import
 * @desc Bulk import tracks
 * @access Private
 * @middleware ensureAuthenticated
 * @param {string} req.body.trackName - The name for all tracks.
 * @param {string[]} req.body.dates - Array of ISO date strings.
 * @returns {number} res.status - The status code of the HTTP response.
 * @returns {Object} res.body - Import results with created count.
 */
router.post('/import',
	ensureAuthenticated,
	importTracks
)

/**
 * @route GET api/v1/tracks
 * @desc Get all tracks for the authenticated user
 * @access Private
 * @middleware ensureAuthenticated
 * @param {string} [req.query.trackName] - Filter by track name.
 * @param {string} [req.query.fromDate] - Filter tracks from this date.
 * @param {string} [req.query.toDate] - Filter tracks until this date.
 * @param {number} [req.query.limit] - Limit the number of tracks returned.
 * @param {number} [req.query.skip] - Number of tracks to skip (for pagination).
 * @param {string} [req.query.sort] - Sort order (e.g., '-date' for descending by date).
 * @returns {number} res.status - The status code of the HTTP response.
 * @returns {Array<Object>} res.body - The list of tracks.
 */
router.get('/',
	ensureAuthenticated,
	getTracks
)

/**
 * @route GET api/v1/tracks/:id
 * @desc Get a track by its ID
 * @access Private
 * @middleware ensureAuthenticated
 * @param {string} req.params.id - The ID of the track to be fetched.
 * @returns {number} res.status - The status code of the HTTP response.
 * @returns {Object} res.body - The track details.
 */
router.get('/:id',
	ensureAuthenticated,
	getTrack
)

/**
 * @route PATCH api/v1/tracks/:id
 * @desc Update a track by its ID
 * @access Private
 * @middleware ensureAuthenticated
 * @param {string} req.params.id - The ID of the track to be patched.
 * @param {string} [req.body.name] - The new name of the track.
 * @param {string} [req.body.date] - The new date of the track.
 * @returns {number} res.status - The status code of the HTTP response.
 * @returns {Object} res.body - The updated track.
 */
router.patch('/:id',
	ensureAuthenticated,
	patchTrack
)

/**
 * @route DELETE api/v1/tracks/:id
 * @desc Delete a track by its ID
 * @access Private
 * @middleware ensureAuthenticated
 * @param {string} req.params.id - The ID of the track to be deleted.
 * @param {boolean} req.body.confirm - Confirmation of the deletion.
 * @returns {number} res.status - The status code of the HTTP response.
 */
router.delete('/:id',
	ensureAuthenticated,
	deleteTrack
)

export default router
