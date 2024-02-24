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

let currentRetryAttempt = 0

while (currentRetryAttempt < maxRetryAttempts) {
    logger.info('Attempting connection to MongoDB')

    try {
        const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`
        // Use Mongoose to connect for production database
        await mongoose.connect(mongoUri, mongooseOpts)
        // Send a ping to confirm a successful connection
        if (mongoose.connection.readyState !== 1) throw new Error()
        logger.info('Connected to MongoDB')
    } catch (error: any) {
        logger.error(`Error connecting to MongoDB: ${error.message !== undefined ? error.message : error}`)
        process.exit(1)
    }
    currentRetryAttempt++
    await new Promise((resolve) => setTimeout(resolve, retryInterval))
}

if (mongoose.connection.readyState !== 1) {
    logger.error(`Failed to connect to MongoDB after ${maxRetryAttempts} attempts. Shutting down.`)
    process.exit(1)
}
