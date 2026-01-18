import { compare, hash } from 'bcrypt'
import mongoose, { type Document, type FlattenMaps, model, Schema, type Types } from 'mongoose'
import { nanoid } from 'nanoid'
import validator from 'validator'

import logger from '../utils/logger.js'
import config from '../utils/setupConfig.js'

import TrackModel from './Track.js'

const { bcryptSaltRounds } = config

export interface IUser extends Document {
	_id: Types.ObjectId
	userName: string
	email: string
	password: string
	accessToken: string
	passwordResetCode?: string

	createdAt: Date
	updatedAt: Date

	generateAccessToken: () => Promise<string>
	generateNewPasswordResetCode: () => Promise<string>
	deleteUserAndAllAssociatedData: () => Promise<void>
	comparePassword: (password: string) => Promise<boolean>

	_wasNew?: boolean
}

export interface IUserFrontend {
	_id: string
	userName: string
	email: string
	accessToken: string
	createdAt: Date
	updatedAt: Date
}

export function transformUser (userDoc: IUser | FlattenMaps<IUser>): IUserFrontend {
	return {
		_id: userDoc._id.toString(),
		userName: userDoc.userName,
		email: userDoc.email,
		accessToken: userDoc.accessToken,
		createdAt: userDoc.createdAt,
		updatedAt: userDoc.updatedAt
	}
}

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
		required: false,
		unique: true,
		sparse: true
	}
}, {
	timestamps: true
})

userSchema.path('email').validate(function (v: string) {
	return validator.isEmail(v)
}, 'Email is not valid')

userSchema.path('email').validate(async function (v: string) {
	const foundUserWithEmail = await UserModel.findOne({ email: v, _id: { $ne: this._id } })
	return foundUserWithEmail === null || foundUserWithEmail === undefined
}, 'Email is already in use')

userSchema.pre('save', async function (next) {
	this._wasNew = this.isNew
	if (this.isModified('password')) {
		logger.debug(`User ID ${this.id}: Hashing password`)
		this.password = await hash(this.password, bcryptSaltRounds)
	}
	if (this.accessToken === undefined) {
		this.accessToken = await generateUniqueAccessToken()
	}
	next()
})

userSchema.methods.generateAccessToken = async function (this: IUser) {
	logger.debug(`Generating access token for user ID ${this.id}`)
	this.accessToken = await generateUniqueAccessToken()
	await this.save()
	return this.accessToken
}

userSchema.methods.generateNewPasswordResetCode = async function (this: IUser): Promise<string> {
	logger.debug(`Generating password reset code for user ID ${this.id}`)
	this.passwordResetCode = await generateUniquePasswordResetCode()
	await this.save()
	return this.passwordResetCode
}

userSchema.methods.deleteUserAndAllAssociatedData = async function (this: IUser): Promise<void> {
	logger.info(`Deleting user and all associated data: ID ${this.id}`)

	const session = await mongoose.startSession()
	session.startTransaction()

	try {
		await UserModel.findByIdAndDelete(this._id).session(session)
		await TrackModel.deleteMany({ userId: this._id }).session(session)
		await session.commitTransaction()
	} catch (error) {
		await session.abortTransaction()
		throw error
	} finally {
		await session.endSession()
	}
}

userSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
	logger.debug(`Comparing password for user ID ${this.id}`)
	return await compare(password, this.password)
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
