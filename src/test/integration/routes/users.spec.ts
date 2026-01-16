/* eslint-disable @typescript-eslint/no-unused-expressions */
// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import { expect } from 'chai'

import TrackModel from '../../../app/models/Track.js'
import UserModel, { type IUser } from '../../../app/models/User.js'
import { chaiAppServer as agent } from '../../testSetup.js'

describe('POST api/v1/users', function () {
	describe('Post a new user', function () {
		const userFields = {
			userName: 'TestUser',
			email: 'test@test.com',
			password: 'testPassword',
			confirmPassword: 'testPassword'
		}

		it('should create a user', async function () {
			await agent.post('/v1/users').send(userFields)

			const user = await UserModel.findOne({}).exec()

			expect(user).to.exist
			expect(user).to.have.property('userName', userFields.userName)
			expect(user).to.have.property('email', userFields.email)
			expect(user).to.have.property('password')
		})

		it('should return the newly created object', async function () {
			const response = await agent.post('/v1/users').send(userFields)

			expect(response).to.have.status(201)
			expect(response.body).to.have.property('userName', userFields.userName)
			expect(response.body).to.have.property('email', userFields.email)
		})

		it('should respond with status code 201', async function () {
			const res = await agent.post('/v1/users').send(userFields)
			expect(res).to.have.status(201)
		})

		it('should not return the password', async function () {
			const response = await agent.post('/v1/users').send(userFields)

			expect(response.body).to.not.have.property('password')
		})

		it('should return an error if the passwords do not match', async function () {
			const response = await agent.post('/v1/users').send({
				...userFields,
				confirmPassword: 'password2'
			})

			expect(response).to.have.status(400)
		})

		it('should return an error if the userName is missing', async function () {
			const response = await agent.post('/v1/users').send({
				...userFields,
				userName: undefined
			})

			expect(response).to.have.status(400)
		})

		it('should return an error if the email is missing', async function () {
			const response = await agent.post('/v1/users').send({
				...userFields,
				email: undefined
			})

			expect(response).to.have.status(400)
		})

		it('should return an error if the password is missing', async function () {
			const response = await agent.post('/v1/users').send({
				...userFields,
				password: undefined
			})

			expect(response).to.have.status(400)
		})

		it('should return an error if the confirm password is missing', async function () {
			const response = await agent.post('/v1/users').send({
				...userFields,
				confirmPassword: undefined
			})

			expect(response).to.have.status(400)
		})

		it('should not allow setting the _id', async function () {
			const newId = 'newId'
			const updatedFields = {
				_id: newId,
				...userFields
			}

			await agent.post('/v1/users').send(updatedFields)
			const user = await UserModel.findOne({})

			expect(user?._id.toString()).to.not.equal(newId)
		})
	})
})

describe('GET api/v1/users/:id/accessToken', function () {
	let testUser: IUser

	const userFields = {
		email: 'test@test.com',
		password: 'testPassword'
	}

	beforeEach(async function () {
		testUser = new UserModel({
			userName: 'TestUser',
			email: 'test@test.com',
			password: 'testPassword'
		})
		await testUser.save()
	})

	it('should return an access token', async function () {
		const response = await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send(userFields)

		expect(response.body).to.have.property('accessToken')
	})

	it('should respond with status code 201', async function () {
		const res = await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send(userFields)
		expect(res).to.have.status(201)
	})

	it('should return an error if the email is missing', async function () {
		const response = await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send({
			...userFields,
			email: undefined
		})

		expect(response).to.have.status(400)
	})

	it('should return an error if the password is missing', async function () {
		const response = await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send({
			...userFields,
			password: undefined
		})

		expect(response).to.have.status(400)
	})

	it('should return an error if the email is not valid', async function () {
		const response = await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send({
			...userFields,
			email: 'invalidEmail'
		})

		expect(response).to.have.status(400)
	})

	it('should return an error if the password is not correct', async function () {
		const response = await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send({
			...userFields,
			password: 'incorrectPassword'
		})

		expect(response).to.have.status(400)
	})

	it('should return an error if the user does not exist', async function () {
		const response = await agent.get('/v1/users/invalidId/accessToken').send(userFields)

		expect(response).to.have.status(400)
	})

	it('should update the accessToken to the returned accessToken', async function () {
		const response = await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send(userFields)

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.accessToken).to.equal(response.body.accessToken)
	})

	it('should not update the accessToken if the email is not valid', async function () {
		await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send({
			...userFields,
			email: 'invalidEmail'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.accessToken).to.equal(testUser.accessToken)
	})

	it('should not update the accessToken if the password is not correct', async function () {
		await agent.get(`/v1/users/${testUser._id.toString()}/accessToken`).send({
			...userFields,
			password: 'incorrectPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.accessToken).to.equal(testUser.accessToken)
	})
})

describe('DELETE api/v1/users', function () {
	let testUser: IUser

	beforeEach(async function () {
		testUser = new UserModel({
			userName: 'TestUser',
			email: 'test@test.com',
			password: 'testPassword'
		})
		await testUser.save()
	})

	describe('Delete a user', function () {
		const userFields = {
			email: 'test@test.com',
			password: 'testPassword',
			confirmDeletion: true
		}

		it('should delete the user', async function () {
			await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
			const allUsers = await UserModel.find({}).exec()
			expect(allUsers.length).to.equal(0)
		})

		it('should respond with status code 204', async function () {
			const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)

			expect(res).to.have.status(204)
		})

		it('should respond with an empty body', async function () {
			const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)

			expect(res.body).to.be.empty
		})

		describe('Delete user data', function () {
			let otherUser: IUser

			beforeEach(async function () {
				otherUser = new UserModel({
					userName: 'OtherUser',
					email: 'OtherUser@test.com',
					password: 'password'
				})
				await otherUser.save()

				for (let i = 0; i < 3; i++) {
					await TrackModel.create({
						userId: testUser._id,
						trackName: 'TEST_TRACK'
					})
					await TrackModel.create({
						userId: otherUser._id,
						trackName: 'OTHER_TRACK'
					})
				}
			})

			it('should delete all tracks associated with the user', async function () {
				await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)

				const allTracks = await TrackModel.find({}).exec()
				expect(allTracks.length).to.equal(3)
				const userTracks = await TrackModel.find({ userId: testUser._id }).exec()
				expect(userTracks.length).to.equal(0)
			})

			it('should not delete any tracks not associated with the user', async function () {
				await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)

				const allTracks = await TrackModel.find({}).exec()
				expect(allTracks.length).to.equal(3)

				const userTracks = await TrackModel.find({ userId: otherUser._id }).exec()
				expect(userTracks.length).to.equal(3)
			})
		})
	})

	describe('Delete a user with an invalid email', function () {
		const userFields = {
			email: 'invalidEmail',
			password: 'testPassword',
			confirmDeletion: true
		}

		it('should respond with status code 400', async function () {
			const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
			expect(res).to.have.status(400)
		})

		it('should not delete a user', async function () {
			await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
			const allUsers = await UserModel.find({}).exec()
			expect(allUsers.length).to.equal(1)
		})
	})

	describe('Delete a user with an invalid password', function () {
		const userFields = {
			email: 'test@test.com',
			password: 'invalidPassword',
			confirmDeletion: true
		}

		it('should respond with status code 403', async function () {
			const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
			expect(res).to.have.status(403)
		})

		it('should not delete a user', async function () {
			await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
			const allUsers = await UserModel.find({}).exec()
			expect(allUsers.length).to.equal(1)
		})
	})

	describe('Delete a user with an invalid confirmDeletion', function () {
		const userFields = {
			email: 'test@test.com',
			password: 'testPassword',
			confirmDeletion: false
		}

		it('should respond with status code 400', async function () {
			const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)

			expect(res).to.have.status(400)
		})

		it('should not delete a user', async function () {
			await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
			const allUsers = await UserModel.find({}).exec()
			expect(allUsers.length).to.equal(1)
		})
	})

	describe('Delete a user with missing fields', function () {
		describe('Delete a user with no email', function () {
			const userFields = {
				password: 'testPassword',
				confirmDeletion: true
			}

			it('should respond with status code 400', async function () {
				const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)

				expect(res).to.have.status(400)
			})

			it('should not delete a user', async function () {
				await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
				const allUsers = await UserModel.find({}).exec()
				expect(allUsers.length).to.equal(1)
			})
		})

		describe('Delete a user with no confirmDeletion', function () {
			const userFields = {
				email: 'test@test.com',
				password: 'testPassword'
			}

			it('should respond with status code 400', async function () {
				const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
				expect(res).to.have.status(400)
			})

			it('should not delete a user', async function () {
				await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
				const allUsers = await UserModel.find({}).exec()
				expect(allUsers.length).to.equal(1)
			})
		})

		describe('Delete a user with no password', function () {
			const userFields = {
				email: 'test@test.com',
				confirmDeletion: true
			}

			it('should respond with status code 400', async function () {
				const res = await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
				expect(res).to.have.status(400)
			})

			it('should not delete a user', async function () {
				await agent.delete(`/v1/users/${testUser.id.toString()}`).send(userFields)
				const allUsers = await UserModel.find({}).exec()
				expect(allUsers.length).to.equal(1)
			})
		})
	})
})

describe('POST api/v1/users/request-password-reset-email', function () {
	let testUser: IUser

	beforeEach(async function () {
		testUser = new UserModel({
			userName: 'TestUser',
			email: 'test@test.com',
			password: 'testPassword'
		})
		await testUser.save()
	})

	it('should return status code 200', async function () {
		const res = await agent.post('/v1/users/request-password-reset-email').send({ email: testUser.email })
		expect(res).to.have.status(200)
	})

	it('should return status code 200 if the email does not exist', async function () {
		const response = await agent.post('/v1/users/request-password-reset-email').send({ email: 'invalidEmail' })
		expect(response).to.have.status(200)
	})

	it('should return an error if the email is missing', async function () {
		const response = await agent.post('/v1/users/request-password-reset-email').send({ email: undefined })
		expect(response).to.have.status(400)
	})

	it('should set the passwordResetCode on the user', async function () {
		await agent.post('/v1/users/request-password-reset-email').send({ email: testUser.email })

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.passwordResetCode).to.exist
	})

	it('should not set the passwordResetCode if the email does not exist', async function () {
		await agent.post('/v1/users/request-password-reset-email').send({ email: 'invalidEmail' })

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.passwordResetCode).to.not.exist
	})
})

describe('PATCH api/v1/users/reset-password', function () {
	let testUser: IUser

	beforeEach(async function () {
		testUser = new UserModel({
			userName: 'TestUser',
			email: 'test@test.com',
			password: 'testPassword'
		})
		await testUser.save()
		await testUser.generateNewPasswordResetCode()
	})

	it('should return status code 200', async function () {
		const res = await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword',
			confirmPassword: 'newPassword'
		})
		expect(res).to.have.status(204)
	})

	it('should return an error if the passwordResetCode is missing', async function () {
		const response = await agent.patch('/v1/users/reset-password').send({
			password: 'newPassword',
			confirmPassword: 'newPassword'
		})
		expect(response).to.have.status(404)
	})

	it('should return an error if the password is missing', async function () {
		const response = await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			confirmPassword: 'newPassword'
		})
		expect(response).to.have.status(400)
	})

	it('should return an error if the confirmPassword is missing', async function () {
		const response = await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword'
		})
		expect(response).to.have.status(400)
	})

	it('should return an error if the password and confirmPassword do not match', async function () {
		const response = await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword',
			confirmPassword: 'newPassword2'
		})
		expect(response).to.have.status(400)
	})

	it('should return an error if the passwordResetCode is invalid', async function () {
		const response = await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: 'invalidCode',
			password: 'newPassword',
			confirmPassword: 'newPassword'
		})
		expect(response).to.have.status(404)
	})

	it('should update the password', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword',
			confirmPassword: 'newPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		const isPasswordCorrect = await updatedUser?.comparePassword('newPassword')
		expect(isPasswordCorrect).to.be.true
	})

	it('should delete the passwordResetCode', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword',
			confirmPassword: 'newPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.passwordResetCode).to.not.exist
	})

	it('should not update the password if the passwordResetCode is invalid', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: 'invalidCode',
			password: 'newPassword',
			confirmPassword: 'newPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		const isPasswordCorrect = await updatedUser?.comparePassword('newPassword')
		expect(isPasswordCorrect).to.be.false
	})

	it('should not delete the passwordResetCode if the password and confirmPassword do not match', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword',
			confirmPassword: 'newPassword2'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.passwordResetCode).to.exist
	})

	it('should not update the password if the password and confirmPassword do not match', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword',
			confirmPassword: 'newPassword2'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		const isPasswordCorrect = await updatedUser?.comparePassword('newPassword')
		expect(isPasswordCorrect).to.be.false
	})

	it('should not delete the passwordResetCode if the password is missing', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			confirmPassword: 'newPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.passwordResetCode).to.exist
	})

	it('should not update the password if the password is missing', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			confirmPassword: 'newPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		const isPasswordCorrect = await updatedUser?.comparePassword('newPassword')
		expect(isPasswordCorrect).to.be.false
	})

	it('should not delete the passwordResetCode if the confirmPassword is missing', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.passwordResetCode).to.exist
	})

	it('should not update the password if the confirmPassword is missing', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'newPassword'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		const isPasswordCorrect = await updatedUser?.comparePassword('newPassword')
		expect(isPasswordCorrect).to.be.false
	})

	it('should not delete the passwordResetCode if the password is invalid', async function () {
		await agent.patch('/v1/users/reset-password').send({
			passwordResetCode: testUser.passwordResetCode,
			password: 'a',
			confirmPassword: 'a'
		})

		const updatedUser = await UserModel.findById(testUser._id).exec()
		expect(updatedUser?.passwordResetCode).to.exist
	})
})
