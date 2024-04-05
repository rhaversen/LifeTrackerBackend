// Node.js built-in modules

// Third-party libraries
import sinon from 'sinon'
import chaiHttp from 'chai-http'
import * as chai from 'chai'
import mongoose from 'mongoose'

// Own modules
import logger from '../app/utils/logger.js'

// Connect to the database
import './mongoMemoryReplSetConnector.js'

// Test environment settings
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.CSRF_TOKEN = 'TEST_CSRF_TOKEN'

// Importing the server
const app = await import('../app/index.js')

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
