// Node.js built-in modules

// Third-party libraries
import passport from 'passport'
import { type NextFunction, type Request, type Response } from 'express'

// Own modules
import config from '../utils/setupConfig.js'
import logger from '../utils/logger.js'
import { type IUser } from '../models/User.js'

// Config
const {
    sessionExpiry
} = config

export async function loginUserLocal (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Logging in user')
    // Check if email and password are provided
    if (req.body.email === undefined || req.body.password === undefined) {
        res.status(400).json({ auth: false, error: 'Email or password is missing.' })
        return
    }

    passport.authenticate('user-local', (err: Error, user: Express.User, info: { message: string }) => {
        if (err !== null && err !== undefined) {
            return res.status(500).json({ auth: false, error: err.message })
        }

        if (user === null || user === undefined || user === false) {
            return res.status(401).json({ auth: false, error: info.message })
        }

        req.logIn(user, loginErr => {
            if (loginErr !== null && loginErr !== undefined) {
                return res.status(500).json({ auth: false, error: loginErr.message })
            }

            // Set maxAge for persistent sessions if requested
            if (req.body.stayLoggedIn === true || req.body.stayLoggedIn === 'true') {
                req.session.cookie.maxAge = sessionExpiry
            }

            logger.silly(`User ${(user as IUser).email} logged in`)
            return res.status(200).json({ auth: true, user })
        })
    })(req, res, next)
}

export async function logoutUser (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Logging out user')
    req.logout(function (err) {
        if (err !== null && err !== undefined) {
            next(err)
            return
        }

        req.session.destroy(function (sessionErr) {
            if (sessionErr !== null && sessionErr !== undefined) {
                next(sessionErr)
                return
            }
            res.status(200).json({ message: 'Logged out successfully' })
        })
    })
}

export function ensureAuthenticated (req: Request, res: Response, next: NextFunction): void {
    if (req.isAuthenticated()) {
        next()
        return
    }
    // If not authenticated, you can redirect or send an error response
    res.status(401).json({ message: 'Unauthorized' })
}
