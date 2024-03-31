// Node.js built-in modules

// Third-party libraries
import sinon from 'sinon'
import chaiHttp from 'chai-http'
import * as chai from 'chai'
import mongoose from 'mongoose'

// Own modules
import logger from '../app/utils/logger.js'
import databaseConnector from '../app/utils/databaseConnector.js'

// Connect to the database
import './mongoMemoryReplSetConnector.js'

// Test environment settings
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.CSRF_TOKEN = 'TEST_CSRF_TOKEN'

// Importing the server
const app = await import('../app/index.js')

const chaiHttpObject = chai.use(chaiHttp)

async function cleanDatabase (): Promise<void> {
    /// ////////////////////////////////////////////
    /// ///////////////////////////////////////////
    if (!databaseConnector.isMemoryDatabase()) {
        logger.warn('Database wipe attempted in production environment! Shutting down.')
        await app.shutDown()
        return
    }
    /// ////////////////////////////////////////////
    /// ///////////////////////////////////////////
    logger.debug('Cleaning databases')
    try {
        await mongoose.connection.db.dropDatabase()
        logger.silly('Database dropped successfully')
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Error dropping database: ${err.message}`)
        } else {
            logger.error('Error dropping database: An unknown error occurred')
        }
        logger.error('Shutting down')
        await app.shutDown()
    }
}

let chaiAppServer: ChaiHttp.Agent

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
