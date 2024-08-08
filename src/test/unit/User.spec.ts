// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import UserModel from '../../app/models/User.js'

// Setup test environment
import '../testSetup.js'

describe('User Model', function () {
    const testUserFields = {
        userName: 'JohnDoe',
        email: 'test@test.com',
        password: 'password'
    }

    it('should create a valid user', async function () {
        const user = new UserModel(testUserFields)
        await user.save()

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(user).to.exist
        expect(user.userName).to.equal(testUserFields.userName)
        expect(user.email).to.equal(testUserFields.email)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(await user.comparePassword(testUserFields.password)).to.be.true
    })

    it('should trim the userName', async function () {
        const user = new UserModel({
            ...testUserFields,
            userName: '  JohnDoe  '
        })
        await user.save()

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(user).to.exist
        expect(user.userName).to.equal('JohnDoe')
    })

    it('should trim the email', async function () {
        const user = new UserModel({
            ...testUserFields,
            email: '  test@test.com  '
        })
        await user.save()

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(user).to.exist
        expect(user.email).to.equal('test@test.com')
    })

    it('should trim the password', async function () {
        const user = new UserModel({
            ...testUserFields,
            password: '  password  '
        })
        await user.save()

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(user).to.exist
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(await user.comparePassword('password')).to.be.true
    })

    it('should not save a user with a too short userName', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                userName: 'a'
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should not save a user with a too long userName', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                userName: 'a'.repeat(51)
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should not save a user with a too short password', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                password: 'a'
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should not save a user with a too long password', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                password: 'a'.repeat(101)
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should not save a user with an invalid email', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                email: 'invalidEmail'
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should not save a user with a too short email', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                email: 'a'
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should not save a user with a too long email', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                email: 'a'.repeat(101) + '@a.com'
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should not save a user with an already used email', async function () {
        let errorOccurred = false
        try {
            await new UserModel(testUserFields).save()
            await new UserModel(testUserFields).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should set the email to lowercase', async function () {
        const user = new UserModel({
            ...testUserFields,
            email: 'Test@test.com'
        })
        await user.save()

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(user).to.exist
        expect(user.email).to.equal('test@test.com')
    })

    it('should require the email', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                email: undefined
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should require the userName', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                userName: undefined
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should require the password', async function () {
        let errorOccurred = false
        try {
            await new UserModel({
                ...testUserFields,
                password: undefined
            }).save()
        } catch (err) {
            errorOccurred = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(errorOccurred).to.be.true
    })

    it('should hash the password', async function () {
        const user = new UserModel(testUserFields)
        await user.save()

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(user).to.exist
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(await user.comparePassword(testUserFields.password)).to.be.true
    })

    it('should fill out accessToken', async function () {
        const user = new UserModel(testUserFields)

        await user.save()

        expect(user.accessToken).to.be.a('string')
        expect(user.accessToken).to.have.lengthOf(21)
    })

    it('should allow generating a new access token', async function () {
        const user = new UserModel(testUserFields)
        await user.save()
        const oldAccessToken = user.accessToken

        await user.generateAccessToken()

        const updatedUser = await UserModel.findById(user._id)
        const newAccessToken = updatedUser?.accessToken

        expect(oldAccessToken).to.not.equal(newAccessToken)
    })

    it('should return the access token when calling generateAccessToken', async function () {
        const user = new UserModel(testUserFields)
        await user.save()

        const newReturnedAccessToken = await user.generateAccessToken()
        const newAccessToken = user.accessToken

        expect(newReturnedAccessToken).to.equal(newAccessToken)
    })

    it('should compare the password correctly', async function () {
        const user = new UserModel(testUserFields)
        await user.save()

        const isPasswordCorrect = await user.comparePassword(testUserFields.password)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(isPasswordCorrect).to.be.true
    })

    describe('Unique access token', function () {
        it('should generate a random, unique access token', async function () {
            // Requires longer timeout
            this.timeout(5000)

            const accessTokens = []

            // One hundred different are sufficient to prove that the access token is random
            for (let i = 0; i < 100; i++) {
                const user = new UserModel(testUserFields)
                await user.save()
                accessTokens.push(user.accessToken)
                await user.deleteUserAndAllAssociatedData()
            }

            const uniqueAccessTokens = new Set(accessTokens)
            expect(uniqueAccessTokens.size).to.equal(accessTokens.length)
        })

        it('should not allow two equal access tokens', async function () {
            const user1 = new UserModel(testUserFields)
            await user1.save()

            // Use new email
            const user2 = new UserModel({ ...testUserFields, email: 'test2@gmail.com' })
            await user2.save().catch((err) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(err).to.not.be.null
            })
        })
    })
})
