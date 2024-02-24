// Node.js built-in modules

// Third-party libraries
import mongoose from 'mongoose'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

// Own modules
import logger from '../utils/logger.js'
import { getMongooseOptions } from '../utils/setupConfig.js'

const mongooseOpts = getMongooseOptions()

logger.info('Attempting connection to in-memory MongoDB')

try {
    const replSet = new MongoMemoryReplSet({
        replSet: { storageEngine: 'wiredTiger' }
    })

    await replSet.start()
    await replSet.waitUntilRunning()
    const mongoUri = replSet.getUri()
    await mongoose.connect(mongoUri, mongooseOpts)
    logger.info('Connected to in-memory MongoDB')
} catch (error: any) {
    logger.error(`Error connecting to in-memory MongoDB: ${error.message !== undefined ? error.message : error}`)
    process.exit(1)
}
