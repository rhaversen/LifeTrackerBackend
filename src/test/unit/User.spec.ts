// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { nanoid } from 'nanoid'

// Own modules
import UserModel from '../../app/models/User.js'

// Setup test environment
import '../testSetup.js'

describe('User Model', () => {
    describe('Creating a user must fill out default fields', () => {
        it('should fill out signUpDate', async () => {
            const user = new UserModel({
                userName: 'JohnDoe'
            })
            await user.save()

            expect(user.signUpDate).to.be.a('date')
        })

        it('should fill out accessToken', async () => {
            const user = new UserModel({
                userName: 'JohnDoe'
            })

            await user.save()

            expect(user.accessToken).to.be.a('string')
            expect(user.accessToken).to.have.lengthOf(21)
        })
    })

    describe('Unique access token', () => {
        it('should generate a random, unique access token', async () => {
            // Requires longer timeout
            (this as any).timeout(5000)

            const accessTokens = []

            // One hundred different are sufficient to prove that the access token is random
            for (let i = 0; i < 100; i++) {
                const user = new UserModel({
                    userName: 'JohnDoe',
                    signUpDate: new Date()
                })

                await user.save()
                accessTokens.push(user.accessToken)
            }

            const uniqueAccessTokens = new Set(accessTokens)
            expect(uniqueAccessTokens.size).to.equal(accessTokens.length)
        })

        it('should not allow two equal access tokens', async () => {
            const user1 = new UserModel({
                userName: 'JohnDoe',
                signUpDate: new Date(),
                accessToken: nanoid()
            })
            await user1.save()

            const user2 = new UserModel({
                userName: 'JaneDoe',
                signUpDate: new Date(),
                accessToken: user1.accessToken
            })
            await user2.save().catch((err) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(err).to.not.be.null
            })
        })
    })
})
