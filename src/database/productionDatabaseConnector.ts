// Node.js built-in modules

// Third-party libraries
import mongoose from 'mongoose'

// Own modules
import logger from '../utils/logger.js'
import config from '../utils/setupConfig.js' // Assuming setupConfig combines the config loading

const {
    mongooseOpts,
    maxRetryAttempts,
    retryInterval
} = config
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`

async function connectToMongoDB (): Promise<void> {
    for (let currentRetryAttempt = 0; currentRetryAttempt < maxRetryAttempts; currentRetryAttempt++) {
        logger.info('Attempting connection to MongoDB')

        try {
            await mongoose.connect(mongoUri, mongooseOpts)
            logger.info('Connected to MongoDB')
            return // Successfully connected
        } catch (error: any) {
            logger.error(`Error connecting to MongoDB: ${error.message !== undefined ? error.message : error}`)
            await new Promise(resolve => setTimeout(resolve, retryInterval))
        }
    }

    // Exhausted retries
    logger.error(`Failed to connect to MongoDB after ${maxRetryAttempts} attempts. Shutting down.`)
    process.exit(1)
}

await connectToMongoDB()
