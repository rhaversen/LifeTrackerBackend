// Node.js built-in modules

// Third-party libraries
import mongoose, { type Document, model, Schema, type Types } from 'mongoose'
import { nanoid } from 'nanoid'
import { hash, compare } from 'bcrypt'
import validator from 'validator'

// Own modules
import logger from '../utils/logger.js'
import TrackModel from './Track.js'
import config from '../utils/setupConfig.js'

// Destructuring and global variables
const {
    bcryptSaltRounds
} = config

// User interface definition
export interface IUser extends Document {
    // Properties
    _id: Types.ObjectId
    userName: string // Username of the user
    email: string // Email of the user
    password: string // Hashed password of the user
    accessToken: string // Unique access token for user authentication

    // Optional properties
    passwordResetCode?: string // Unique password reset code for user password reset

    // Timestamps
    createdAt: Date
    updatedAt: Date

    // Methods
    generateAccessToken: () => Promise<string>
    generateNewPasswordResetCode: () => Promise<string>
    deleteUserAndAllAssociatedData: () => Promise<void>
    comparePassword: (password: string) => Promise<boolean>
}

// User schema definition
const userSchema = new Schema<IUser>({
    userName: {
        type: Schema.Types.String,
        required: true,
        trim: true,
        minLength: [2, 'Username has to be at least 2 characters'],
        maxLength: [50, 'Username can be at most 50 characters']
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: [5, 'Email has to be at least 5 characters'],
        maxLength: [100, 'Email can be at most 100 characters']
    },
    password: {
        type: Schema.Types.String,
        required: true,
        trim: true,
        minLength: [4, 'Password has to be at least 4 characters'],
        maxLength: [100, 'Password can be at most 100 characters']
    },
    accessToken: {
        type: Schema.Types.String,
        required: false,
        unique: true
    },
    passwordResetCode: {
        type: Schema.Types.String,
        required: false
    }
}, {
    timestamps: true
})

// Validations
userSchema.path('email').validate(function (v: string) {
    return validator.isEmail(v)
}, 'Email is not valid')

userSchema.path('email').validate(async function (v: string) {
    const foundUserWithEmail = await UserModel.findOne({ email: v, _id: { $ne: this._id } })
    return foundUserWithEmail === null || foundUserWithEmail === undefined
}, 'Email is already in use')

// Adding indexes
userSchema.index({ accessToken: 1 })

// Pre-save middleware for User schema
userSchema.pre('save', async function (next) {
    logger.silly('Saving user')
    if (this.isModified('password')) {
        // Hash the password
        this.password = await hash(this.password, bcryptSaltRounds) // Using a random salt for each user
    }
    if (this.accessToken === undefined) {
        // Set default value to accessToken
        this.accessToken = await generateUniqueAccessToken()
    }
    next()
})

// User methods
userSchema.methods.generateAccessToken = async function (this: IUser) {
    logger.silly('Generating access token')
    this.accessToken = await generateUniqueAccessToken()
    await this.save()
    return this.accessToken
}

userSchema.methods.generateNewPasswordResetCode = async function (this: IUser): Promise<string> {
    logger.silly('Generating new password reset code')
    this.passwordResetCode = await generateUniquePasswordResetCode()
    await this.save()
    return this.passwordResetCode
}

userSchema.methods.deleteUserAndAllAssociatedData = async function (this: IUser): Promise<void> {
    logger.silly('Deleting user and all associated data')

    // Start a mongoose session to use transactions
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // Delete the user
        await UserModel.findByIdAndDelete(this._id).session(session)

        // Delete all tracks created by the user
        await TrackModel.deleteMany({ userId: this._id }).session(session)

        await session.commitTransaction()
    } catch (error) {
        await session.abortTransaction()

        // Propagate the error
        throw error
    } finally {
        await session.endSession()
    }
}

userSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
    logger.silly('Comparing password')
    const isPasswordCorrect = await compare(password, this.password)
    return isPasswordCorrect
}

// Helper functions
async function generateUniqueAccessToken (): Promise<string> {
    let newAccessToken
    let foundUserWithAccessToken
    do {
        newAccessToken = nanoid()
        foundUserWithAccessToken = await UserModel.findOne({ accessToken: newAccessToken })
    } while (foundUserWithAccessToken !== null)
    return newAccessToken
}

async function generateUniquePasswordResetCode (): Promise<string> {
    let newPasswordResetCode
    let foundUserWithPasswordResetCode
    do {
        newPasswordResetCode = nanoid()
        foundUserWithPasswordResetCode = await UserModel.findOne({ passwordResetCode: newPasswordResetCode })
    } while (foundUserWithPasswordResetCode !== null)
    return newPasswordResetCode
}

// Compile the schema into a model
const UserModel = model<IUser>('User', userSchema) // Compiling the user schema into a mongoose model

export default UserModel // Export the compiled UserModel for use in other modules
