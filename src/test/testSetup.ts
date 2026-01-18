// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import { type Server } from 'http'

import * as Sentry from '@sentry/node'
import * as chai from 'chai'
import chaiHttp from 'chai-http'
import type MongoStore from 'connect-mongo'
import { before, beforeEach, afterEach, after } from 'mocha'
import mongoose from 'mongoose'
import { restore } from 'sinon'

import logger from '../app/utils/logger.js'
import { trackTypes } from '../app/utils/trackTypes.js'

import { disconnectFromInMemoryMongoDB } from './mongoMemoryReplSetConnector.js'
import { testTrackTypes } from './testTrackTypes.js'

// Test environment settings
process.env.NODE_ENV = 'test'
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.CSRF_TOKEN = 'TEST_CSRF_TOKEN'

Object.assign(trackTypes, testTrackTypes)

const chaiHttpObject = chai.use(chaiHttp)
let app: { server: Server, sessionStore: MongoStore }
let chaiAppAgent: ChaiHttp.Agent

const cleanDatabase = async function (): Promise<void> {
	// /////////////////////////////////////////////
	// ////////////////////////////////////////////
	if (process.env.NODE_ENV !== 'test') {
		logger.warn('Database wipe attempted in non-test environment! Shutting down.')
		return
	}
	// /////////////////////////////////////////////
	// ////////////////////////////////////////////
	logger.debug('Cleaning databases')
	if (mongoose.connection.db !== undefined) {
		await mongoose.connection.db.dropDatabase()
	}
}

before(async function () {
	this.timeout(20000)
	// Setting environment
	process.env.NODE_ENV = 'test'

	// Connect to the database
	const database = await import('./mongoMemoryReplSetConnector.js')
	await database.default()

	// Importing and starting the app
	app = await import('../app/index.js')
})

beforeEach(async function () {
	chaiAppAgent = chaiHttpObject.request(app.server).keepOpen()
})

afterEach(async function () {
	restore()
	await cleanDatabase()
	// Close the agent and wait for the callback using a Promise
	await new Promise<void>((resolve) => {
		chaiAppAgent.close(() => {
			resolve()
		})
	})
})

after(async function () {
	// Increase timeout to allow for potentially slow MongoDB shutdown
	this.timeout(40000)
	// Close the server
	app.server.close()
	// Disconnect from the database
	await disconnectFromInMemoryMongoDB(app.sessionStore)
	// Disconnect from sentry
	await Sentry.close()
})

export { chaiAppAgent }
