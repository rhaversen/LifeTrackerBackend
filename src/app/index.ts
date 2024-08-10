// Node.js built-in modules

// Third-party libraries
import * as Sentry from '@sentry/node'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import RateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'

// Own Modules
import databaseConnector from './utils/databaseConnector.js'
import logger from './utils/logger.js'
import config from './utils/setupConfig.js'
import { sentryInit } from './utils/sentry.js'
import globalErrorHandler from './middleware/globalErrorHandler.js'

// Routes
import userRoutes from './routes/users.js'
import trackRoutes from './routes/tracks.js'
import serviceRoutes from './routes/service.js'

// Logging environment
logger.info(`Node environment: ${process.env.NODE_ENV}`)

// Configs
const {
    veryLowSensitivityApiLimiterConfig,
    mediumSensitivityApiLimiterConfig,
    highSensitivityApiLimiterConfig,
    expressPort,
    corsConfig,
    cookieOptions
} = config

// Global variables and setup
const app = express()
app.use(cors(corsConfig))

// Init sentry
if (process.env.NODE_ENV === 'production') {
    sentryInit(app)
}

// Connect to MongoDB in production and staging environment
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    await databaseConnector.connectToMongoDB()
}

if (process.env.SESSION_SECRET === undefined) {
    logger.error('Session secret is not set!')
    process.exit(1)
}

// Middleware
app.use(helmet()) // Security headers
app.use(express.json()) // for parsing application/json
app.use(cookieParser()) // For parsing cookies
app.use(mongoSanitize()) // Data sanitization against NoSQL query injection
app.use(session({ // Session management
    resave: true, // Save the updated session back to the store
    rolling: true, // Reset the cookie max-age on every request
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    store: MongoStore.create({
        client: mongoose.connection.getClient() as any,
        autoRemove: 'interval',
        autoRemoveInterval: 1
    }),
    cookie: cookieOptions
}))

// Rate limiters
const veryLowSensitivityApiLimiter = RateLimit(veryLowSensitivityApiLimiterConfig)
const mediumSensitivityApiLimiter = RateLimit(mediumSensitivityApiLimiterConfig)
const highSensitivityApiLimiter = RateLimit(highSensitivityApiLimiterConfig)

// Use all routes with medium sensitivity rate limiter
app.use('/v1/users', mediumSensitivityApiLimiter, userRoutes)
app.use('/v1/tracks', mediumSensitivityApiLimiter, trackRoutes)
app.use('/service', mediumSensitivityApiLimiter, serviceRoutes)

// Apply stricter rate limiters to routes
app.use('/v1/users/', highSensitivityApiLimiter)

// Apply medium sensitivity for all database operation routes
app.use('/v1/users', mediumSensitivityApiLimiter)
app.use('/v1/tracks', mediumSensitivityApiLimiter)

// Apply low sensitivity for service routes
app.use('/service', veryLowSensitivityApiLimiter)

// The sentry error handler must be registered before any other error middleware and after all controllers
if (process.env.NODE_ENV === 'production') {
    app.use(Sentry.Handlers.errorHandler())
}

// Global error handler middleware
app.use(globalErrorHandler)

// Listen
export const server = app.listen(expressPort, () => {
    logger.info(`Express is listening at http://localhost:${expressPort}`)
})

// Handle unhandled rejections outside middleware
process.on('unhandledRejection', (reason, promise): void => {
    // Attempt to get a string representation of the promise
    const promiseString = JSON.stringify(promise) !== '' ? JSON.stringify(promise) : 'a promise'

    // Get a detailed string representation of the reason
    const reasonDetail = reason instanceof Error ? reason.stack ?? reason.message : JSON.stringify(reason)

    // Log the detailed error message
    logger.error(`Unhandled Rejection at: ${promiseString}, reason: ${reasonDetail}`)

    shutDown(1).catch(error => {
        // If 'error' is an Error object, log its stack trace; otherwise, convert to string
        const errorDetail = error instanceof Error ? error.stack ?? error.message : String(error)
        logger.error(`An error occurred during shutdown: ${errorDetail}`)
        process.exit(1)
    })
})

// Handle uncaught exceptions outside middleware
process.on('uncaughtException', (err): void => {
    logger.error('Uncaught exception:', err)
    shutDown(1).catch(error => {
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

// Assigning shutdown function to SIGTERM signal
process.on('SIGTERM', (): void => {
    logger.info('Received SIGTERM')
    shutDown().catch(error => {
        logger.error('An error occurred during shutdown:', error)
        process.exit(1)
    })
})

// Shutdown function
export async function shutDown (exitCode?: number | undefined): Promise<void> {
    try {
        logger.info('Closing server...')
        server.close()
        logger.info('Server closed')
        logger.info('Starting database disconnection...')
        await mongoose.disconnect()
        logger.info('Database disconnected')
        logger.info('Shutdown completed')
        process.exit(exitCode ?? 0)
    } catch (error) {
        logger.error('An error occurred during shutdown:', error)
        process.exit(1) // Exit with code 1 indicating termination with error
    }
}

export default app
