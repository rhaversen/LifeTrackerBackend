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

    const newUser = await UserModel.create({
        userName
    })

    res.status(201).json(newUser.accessToken)
}

export async function deleteUser (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Deleting user')

    const {
        email,
        password,
        confirmDeletion
    } = req.body as Record<string, unknown>

    if (typeof confirmDeletion !== 'boolean' || !confirmDeletion) {
        res.status(400).json({ error: 'confirmDeletion must be true.' })
        return
    }

    if (typeof password !== 'string') {
        res.status(400).json({ error: 'password must be a string.' })
        return
    }

    const user = await UserModel.findOne({ email })

    if (user === null) {
        res.status(404).json({ error: 'email is not valid.' })
        return
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        res.status(400).json({ error: 'Password is not correct.' })
        return
    }

    await user.deleteUserAndAllAssociatedData()

    res.status(204).send()
}
