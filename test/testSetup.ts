// Node.js built-in modules

// Third-party libraries
import sinon from 'sinon'

// Own modules
import logger from '../src/utils/logger.js'
import UserModel from '../src/models/User.js'
import TrackModel from '../src/models/Track.js'
import { isMemoryDatabase } from '../src/database/databaseHandler.js'

// Test environment settings
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.CSRF_TOKEN = 'TEST_CSRF_TOKEN'

// Importing the server
const server = await import('../src/index.js')

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
        process.exit(1)
    }
}

afterEach(async function () {
    sinon.restore()
    await cleanDatabase()
})

after(function () {
    void server.shutDown()
})

export default server
