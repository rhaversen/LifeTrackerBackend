import { type RequestHandler, type NextFunction, type Request, type Response } from 'express'
import logger from './logger.js'

type AsyncMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>

const asyncErrorHandler = (fn: AsyncMiddleware): RequestHandler =>
    async (req, res, next) => {
        await fn(req, res, next).catch(error => {
            logger.error('Error caught by asyncErrorHandler:', error)
            next(error)
        })
    }

export default asyncErrorHandler
