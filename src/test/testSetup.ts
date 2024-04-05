// Node.js built-in modules

// Third-party libraries
import sinon from 'sinon'
import chaiHttp from 'chai-http'
import * as chai from 'chai'
import mongoose from 'mongoose'

// Own modules
import logger from '../app/utils/logger.js'
import { trackTypes } from '../app/utils/trackTypes.js'
import { testTrackTypes } from './testTrackTypes.js'

// Test environment settings
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.CSRF_TOKEN = 'TEST_CSRF_TOKEN'

// Expanding test track types
Object.assign(trackTypes, testTrackTypes)

const chaiHttpObject = chai.use(chaiHttp)

const cleanDatabase = async function (): Promise<void> {
    /// ////////////////////////////////////////////
    /// ///////////////////////////////////////////
    if (process.env.NODE_ENV !== 'test') {
        logger.error('Database wipe attempted in non-test environment! Shutting down.')
        await app.shutDown(1)
        return
    }
    /// ////////////////////////////////////////////
    /// ///////////////////////////////////////////
    logger.debug('Cleaning databases')
    await mongoose.connection.db.dropDatabase()
}

before(async function () {
    this.timeout(10000)
    // Connect to the database
    const database = await import('./mongoMemoryReplSetConnector.js')
    await database.default()

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
