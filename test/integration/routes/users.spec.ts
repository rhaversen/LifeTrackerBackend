// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries

// Own modules
import { agent, chaiHttpObject } from '../../httpTestSetup.js'
import UserModel, { type IUser } from '../../../src/models/User.js'

// Global variables and setup
const { expect } = chaiHttpObject

describe('POST api/v1/users', function () {
    describe('Post a new user', function () {
        const user = { userName: 'TestUser' }

        it('should create a user', async function () {
            await agent.post('/v1/users').send(user)
            const allUsers = await UserModel.find({}).exec()
            expect(allUsers.length).to.equal(1)
            expect(allUsers[0].userName).to.equal(user.userName)
        })

        it('should respond with status code 201', async function () {
            const res = await agent.post('/v1/users').send(user)
            expect(res).to.have.status(201)
        })

        it('should respond with the correct accessToken', async function () {
            const res = await agent.post('/v1/users').send(user)
            const allUsers = await UserModel.find({}).exec()
            expect(res.body).to.equal(allUsers[0].accessToken)
        })

        it('should have a correct signUpDate', async function () {
            const startTime = new Date().getTime()
            await agent.post('/v1/users').send(user)
            const endTime = new Date().getTime()

            const allUsers = await UserModel.find({}).exec()
            const signUpDate = new Date(allUsers[0].signUpDate).getTime()

            expect(signUpDate).to.be.at.least(startTime)
            expect(signUpDate).to.be.at.most(endTime)
        })
    })

    describe('Post a new user with an empty userName', function () {
        it('should respond with status code 400', async function () {
            const res = await agent.post('/v1/users').send({ userName: '' })
            expect(res).to.have.status(400)
        })

        it('should respond with an error message', async function () {
            const res = await agent.post('/v1/users').send({ userName: '' })
            expect(res.body.error).to.equal('userName must be a non-empty string.')
        })

        it('should not create a user', async function () {
            await agent.post('/v1/users').send({ userName: '' })
            const allUsers = await UserModel.find({}).exec()
            expect(allUsers.length).to.equal(0)
        })
    })

    describe('Post a new user with an invalid userName', function () {
        it('should respond with status code 400', async function () {
            const res = await agent.post('/v1/users').send({ userName: 123 })
            expect(res).to.have.status(400)
        })

        it('should respond with an error message', async function () {
            const res = await agent.post('/v1/users').send({ userName: 123 })
            expect(res.body.error).to.equal('userName must be a non-empty string.')
        })

        it('should not create a user', async function () {
            await agent.post('/v1/users').send({ userName: 123 })
            const allUsers = await UserModel.find({}).exec()
            expect(allUsers.length).to.equal(0)
        })
    })

    describe('Post a new user with no body', function () {
        it('should respond with status code 400', async function () {
            const res = await agent.post('/v1/users').send({ userName: undefined })
            expect(res).to.have.status(400)
        })

        it('should respond with an error message', async function () {
            const res = await agent.post('/v1/users').send({ userName: undefined })
            expect(res.body.error).to.equal('userName must be a non-empty string.')
        })

        it('should not create a user', async function () {
            await agent.post('/v1/users').send({ userName: undefined })
            const allUsers = await UserModel.find({}).exec()
            expect(allUsers.length).to.equal(0)
        })
    })
})

describe('DELETE api/v1/users', function () {
    let testUser: IUser

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser',
            signUpDate: new Date()
        })
        await testUser.save()
    })

    describe('Delete a user', function () {
        const user = { userName: 'TestUser', confirmDeletion: true }

        it('should delete the user', async function () {
            await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
            const allUsers = await UserModel.find({}).exec()
            expect(allUsers.length).to.equal(0)
        })

        it('should respond with status code 204', async function () {
            const res = await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
            expect(res).to.have.status(204)
        })

        it('should respond with an empty body', async function () {
            const res = await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.body).to.be.empty
        })
    })

    describe('Delete a user with an invalid accessToken', function () {
        const user = { userName: 'TestUser', confirmDeletion: true, accessToken: 'invalidCode' }

        it('should respond with status code 404', async function () {
            const res = await agent.delete('/v1/users').send(user)
            expect(res).to.have.status(404)
        })

        it('should not delete a user', async function () {
            await agent.delete('/v1/users').send(user)
            const allUsers = await UserModel.find({}).exec()
            expect(allUsers.length).to.equal(1)
        })
    })

    describe('Delete a user with missing fields', function () {
        describe('Delete a user with no username', function () {
            const user = { confirmDeletion: true }

            it('should respond with status code 400', async function () {
                const res = await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
                expect(res).to.have.status(400)
            })

            it('should not delete a user', async function () {
                await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
                const allUsers = await UserModel.find({}).exec()
                expect(allUsers.length).to.equal(1)
            })

            it('should respond with an error message', async function () {
                const res = await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
                expect(res.body.error).to.equal('userName must be a non-empty string.')
            })
        })

        describe('Delete a user with no confirmDeletion', function () {
            const user = { userName: 'TestUser' }

            it('should respond with status code 400', async function () {
                const res = await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
                expect(res).to.have.status(400)
            })

            it('should not delete a user', async function () {
                await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
                const allUsers = await UserModel.find({}).exec()
                expect(allUsers.length).to.equal(1)
            })

            it('should respond with an error message', async function () {
                const res = await agent.delete('/v1/users').send({ ...user, accessToken: testUser.accessToken })
                expect(res.body.error).to.equal('confirmDeletion must be true.')
            })
        })

        describe('Delete a user with no accessToken', function () {
            const user = { userName: 'TestUser', confirmDeletion: true }

            it('should respond with status code 400', async function () {
                const res = await agent.delete('/v1/users').send(user)
                expect(res).to.have.status(400)
            })

            it('should not delete a user', async function () {
                await agent.delete('/v1/users').send(user)
                const allUsers = await UserModel.find({}).exec()
                expect(allUsers.length).to.equal(1)
            })

            it('should respond with an error message', async function () {
                const res = await agent.delete('/v1/users').send(user)
                expect(res.body.error).to.equal('accessToken must be a non-empty string.')
            })
        })
    })
})
