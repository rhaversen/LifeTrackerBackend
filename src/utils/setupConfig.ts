// Node.js built-in modules
import config from 'config'

// Third-party libraries
import { type Options as RateLimitOptions } from 'express-rate-limit'
import logger from './logger.js'
import { type ConnectOptions } from 'mongoose'

// Convert config object to a plain object and then stringify it
const configString = JSON.stringify(config.util.toObject(config), null, 4)

// Log the configs used
logger.info(`Using configs:\n${configString}`)

export function getRelaxedApiLimiterConfig (): RateLimitOptions {
    return config.get('apiLimiter.nonSensitive')
}

export function getSensitiveApiLimiterConfig (): RateLimitOptions {
    return config.get('apiLimiter.sensitive')
}

export function getExpressPort (): number {
    return config.get('expressPort')
}

export function getMongooseOptions (): ConnectOptions {
    return config.get('mongoose.options')
}

export function getMaxRetryAttempts (): number {
    return config.get('mongoose.retrySettings.maxAttempts')
}

export function getRetryInterval (): number { // in milliseconds
    return config.get('mongoose.retrySettings.interval')
}
