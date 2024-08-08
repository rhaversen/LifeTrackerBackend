// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import { expect } from 'chai'

// Own modules
import { chaiAppServer as agent } from '../../testSetup.js'
import UserModel, { type IUser } from '../../../app/models/User.js'
import TrackModel from '../../../app/models/Track.js'

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

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
