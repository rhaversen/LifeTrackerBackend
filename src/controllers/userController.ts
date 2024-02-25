// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'

// Own modules
import UserModel, { type IUser } from '../models/User.js'
import logger from '../utils/logger.js'

export async function createUser (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Creating user')

    const {
        userName
    } = req.body as {
        userName: string
    }

    const newUser = new UserModel({
        userName
    })
    const savedUser = await newUser.save() as IUser

    res.status(201).json(savedUser.accessToken)
}
