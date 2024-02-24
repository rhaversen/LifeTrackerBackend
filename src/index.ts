// Node.js built-in modules

// Third-party libraries
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import RateLimit from 'express-rate-limit'
import helmet from 'helmet'

// Own Modules
import loadVaultSecrets from './utils/vault.js'
import { initializeDatabaseConnection } from './database/databaseHandler.js'
import logger from './utils/logger.js'
import config from './utils/setupConfig.js'

// Routes
import userRoutes from './routes/users.js'
import trackRoutes from './routes/tracks.js'
import utilRoutes from './routes/util.js'
import mongoose from 'mongoose'

// Load environment
await loadVaultSecrets()

// Connect to MongoDB (Automatically connect to in-memory replica set if not production environment)
await initializeDatabaseConnection()

// Configs
const {
    relaxedApiLimiterConfig,
    sensitiveApiLimiterConfig,
    expressPort
} = config

// Global variables and setup
const app = express()

// Middleware
app.use(helmet())
app.use(express.json())
app.use(mongoSanitize())

// Rate limiters
const relaxedApiLimiter = RateLimit(relaxedApiLimiterConfig)
const sensitiveApiLimiter = RateLimit(sensitiveApiLimiterConfig)

// Use all routes and with relaxed limiter
app.use('/v1/users', relaxedApiLimiter, userRoutes)
app.use('/v1/tracks', relaxedApiLimiter, trackRoutes)
app.use('/v1/util', relaxedApiLimiter, utilRoutes)

// Apply stricter rate limiters to routes
app.use('/v1/users/update-password', sensitiveApiLimiter)
app.use('/v1/users/login', sensitiveApiLimiter)
app.use('/v1/users/signup', sensitiveApiLimiter)
app.use('/v1/users/', sensitiveApiLimiter)
app.use('/v1/util/healthcheck', sensitiveApiLimiter)

// Listen
app.listen(expressPort, () => {
    console.log(`Express is listening at http://localhost:${expressPort}`)
})

// Handle unhandled rejections outside middleware
process.on('unhandledRejection', (reason, promise): void => {
    // Attempt to get a string representation of the promise
    const promiseString = JSON.stringify(promise) !== '' ? JSON.stringify(promise) : 'a promise'

    // Get a detailed string representation of the reason
    const reasonDetail = reason instanceof Error ? reason.stack ?? reason.message : JSON.stringify(reason)

    // Log the detailed error message
    logger.error(`Unhandled Rejection at: ${promiseString}, reason: ${reasonDetail}`)

    shutDown().catch(error => {
        // If 'error' is an Error object, log its stack trace; otherwise, convert to string
        const errorDetail = error instanceof Error ? error.stack ?? error.message : String(error)
        logger.error(`An error occurred during shutdown: ${errorDetail}`)
        process.exit(1)
    })
})

// Handle uncaught exceptions outside middleware
process.on('uncaughtException', (err): void => {
    logger.error('Uncaught exception:', err)
    shutDown().catch(error => {
        logger.error('An error occurred during shutdown:', error)
        process.exit(1)
    })
})

// Assigning shutdown function to SIGINT signal
process.on('SIGINT', (): void => {
    logger.info('Received SIGINT')
    shutDown().catch(error => {
        logger.error('An error occurred during shutdown:', error)
        process.exit(1)
    })
})

// Shutdown function
async function shutDown (): Promise<void> {
    try {
        logger.info('Starting database disconnection...')
        await mongoose.disconnect()
        logger.info('Shutdown completed')
        process.exit(0) // Exit with code 0 indicating successful termination
    } catch (error) {
        logger.error('An error occurred during shutdown:', error)
        process.exit(1) // Exit with code 1 indicating termination with error
    }
}

export type AppType = typeof app
export type ShutDownType = typeof shutDown
export { app, shutDown }
