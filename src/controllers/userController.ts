// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'

// Own modules
import UserModel from '../models/User.js'
import logger from '../utils/logger.js'

export async function createUser (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Creating user')

    const {
        userName
    } = req.body as {
        userName?: unknown
    }

    if (typeof userName !== 'string' || userName === '') {
        res.status(400).json({ error: 'userName must be a non-empty string.' })
        return
    }

    const newUser = new UserModel({
        userName
    })
    const savedUser = await newUser.save()

    res.status(201).json(savedUser.accessToken)
}

export async function deleteUser (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Deleting user')

    const {
        userName,
        accessToken,
        confirmDeletion
    } = req.body as {
        userName?: unknown
        accessToken?: unknown
        confirmDeletion?: unknown
    }

    if (typeof userName !== 'string' || userName === '') {
        res.status(400).json({ error: 'userName must be a non-empty string.' })
        return
    }

    if (typeof accessToken !== 'string' || accessToken === '') {
        res.status(400).json({ error: 'accessToken must be a non-empty string.' })
        return
    }

    if (typeof confirmDeletion !== 'boolean' || !confirmDeletion) {
        res.status(400).json({ error: 'confirmDeletion must be true.' })
        return
    }

    const user = await UserModel.findOne({ accessToken })

    if (user === null) {
        res.status(404).json({ error: 'accessToken is not valid.' })
        return
    }

    if (user.userName !== userName) {
        res.status(403).json({ error: 'userName does not match the user associated with the accessToken.' })
        return
    }

    await user.deleteUserAndAllAssociatedData() // Starts a transaction

    res.status(204).send()
}
