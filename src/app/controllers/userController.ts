// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'
import mongoose from 'mongoose'

// Own modules
import UserModel from '../models/User.js'
import logger from '../utils/logger.js'

export async function createUser (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Creating user')

    const {
        userName,
        email,
        password,
        confirmPassword
    } = req.body as Record<string, unknown>

    if (password !== confirmPassword) {
        res.status(400).json({ error: 'password and confirmPassword does not match.' })
        return
    }

    try {
        // Creating a new admin with the password, userName and email
        const newUser = await UserModel.create({ password, userName, email })
        res.status(201).json({
            userName: newUser.userName,
            email: newUser.email
        })
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
            res.status(400).json({ error: error.message })
        } else {
            next(error)
        }
    }
}

export async function createAccessToken (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Creating access token')

    const {
        email,
        password
    } = req.body as Record<string, unknown>

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

    const accessToken = await user.generateAccessToken()

    res.status(201).json({ accessToken })
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
