// Node.js built-in modules

// Third-party libraries
import { Router, type NextFunction, type Request, type Response } from 'express'
import mongoose from 'mongoose'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'
import logger from '../utils/logger.js'

// Controller functions

// Destructuring and global variables
const router = Router()

// Functions
async function checkHealth (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Checking health')

    const uptimeSeconds = process.uptime()
    const uptimeHours = uptimeSeconds / 60 / 60
    const uptimeDays = uptimeHours / 24
    const uptimeWeeks = uptimeDays / 7
    const uptimeMonths = uptimeDays / 30

    const customHealthInfo = {
        databaseConnected: mongoose.connection.readyState === 1,
        timestamp: new Date().toISOString(), // Current time for the health check
        uptime: {
            seconds: uptimeSeconds,
            hours: uptimeHours,
            days: uptimeDays,
            weeks: uptimeWeeks,
            months: uptimeMonths
        }
    }

    res.status(200).json(customHealthInfo)
}

// Routes
router.get('/healthcheck',
    asyncErrorHandler(checkHealth)
)

export default router
