import { type Server } from 'http'

import * as chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'
import sinon from 'sinon'

import logger from '../app/utils/logger.js'
import { trackTypes } from '../app/utils/trackTypes.js'

import { testTrackTypes } from './testTrackTypes.js'

process.env.NODE_ENV = 'test'
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.CSRF_TOKEN = 'TEST_CSRF_TOKEN'

Object.assign(trackTypes, testTrackTypes)

const chaiHttpObject = chai.use(chaiHttp)
let app: { shutDown: (exitCode?: number) => Promise<void>, server: Server }
let chaiAppServer: ChaiHttp.Agent

const cleanDatabase = async function (): Promise<void> {
	// / ////////////////////////////////////////////
	// / ///////////////////////////////////////////
	if (process.env.NODE_ENV !== 'test') {
		logger.error('Database wipe attempted in non-test environment! Shutting down.')
		await app.shutDown(1)
		return
	}
	// / ////////////////////////////////////////////
	// / ///////////////////////////////////////////
	logger.debug('Cleaning databases')
	await mongoose.connection.db.dropDatabase()
}

before(async function () {
	this.timeout(10000)
	// Setting environment
	process.env.NODE_ENV = 'test'

	// Connect to the database
	const database = await import('./mongoMemoryReplSetConnector.js')
	await database.default()

	// Importing and starting the app
	app = await import('../app/index.js')
})

beforeEach(async function () {
	chaiAppServer = chaiHttpObject.request(app.server).keepOpen()
})

afterEach(async function () {
	sinon.restore()
	await cleanDatabase()
})

after(function () {
	void app.shutDown()
})

export { chaiAppServer }
