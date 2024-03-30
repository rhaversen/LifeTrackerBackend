// Node.js built-in modules

// Third-party libraries
import sinon from 'sinon'
import chaiHttp from 'chai-http'
import * as chai from 'chai'

// Own modules
import logger from '../app/utils/logger.js'
import UserModel from '../app/models/User.js'
import TrackModel from '../app/models/Track.js'
import { isMemoryDatabase } from '../app/database/databaseHandler.js'

// Test environment settings
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.CSRF_TOKEN = 'TEST_CSRF_TOKEN'

// Importing the server
const app = await import('../app/index.js')

const chaiHttpObject = chai.use(chaiHttp)

async function cleanDatabase (): Promise<void> {
    /// ////////////////////////////////////////////
    /// ///////////////////////////////////////////
    if (!isMemoryDatabase()) {
        logger.warn('Not cleaning database, not a memory database')
        return
    }
    /// ////////////////////////////////////////////
    /// ///////////////////////////////////////////
    logger.debug('Cleaning databases')
    try {
        await UserModel.deleteMany({})
        await TrackModel.deleteMany({})
        logger.silly('Indexes dropped successfully')
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Error dropping indexes: ${err.message}`)
        } else {
            logger.error('Error dropping indexes: An unknown error occurred')
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
