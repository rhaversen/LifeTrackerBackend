// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import { expect } from 'chai'

// Own modules
import { chaiAppServer as agent } from '../testSetup.js'
import UserModel, { type IUser } from '../../src/models/User.js'
import TrackModel, { type ITrack } from '../../src/models/Track.js'

// Global variables and setup
const values = [
    // Strings
    '', // empty string
    'test', // string
    'true', // string
    'false', // string
    'undefined', // string
    'null', // string
    '0', // string
    ' " ', // a single double-quote character
    ' \' ', // a single quote character
    '\n', // newline character
    '\t', // tab character
    '\0', // null character
    '\r', // carriage return character
    '\b', // backspace character
    '<script>alert(\'XSS\')</script>', // simple XSS injection test
    '你好', // Hello in Chinese
    '🚀', // Rocket emoji
    '\u200B', // Zero width space
    'a'.repeat(1000), // a very long string of 1000 'a' characters
    'a'.repeat(100), // a very long string of 100 'a' characters
    'https://example.com', // HTTP URL
    'http://example.com', // HTTPS URL
    'ftp://example.com', // FTP URL
    '/(?:)/', // a regular expression string with an empty pattern
    '/(.*)/', // a regular expression string with a pattern that matches anything

    // Numbers (and related special numeric values)
    0, // number
    10, // number
    -10, // negative number
    NaN, // NaN
    Number.NaN, // NaN
    Number.MAX_SAFE_INTEGER, // Largest integer that can be accurately represented
    Number.MIN_SAFE_INTEGER, // Smallest integer that can be accurately represented
    -Number.MAX_SAFE_INTEGER, // Largest integer that can be accurately represented
    -Number.MIN_SAFE_INTEGER, // Smallest integer that can be accurately represented
    Number.MAX_VALUE, // Largest number that can be accurately represented
    Number.MIN_VALUE, // Smallest number that can be accurately represented
    -Number.MAX_VALUE, // Largest number that can be accurately represented
    -Number.MIN_VALUE, // Smallest number that can be accurately represented
    Number.MAX_VALUE - 1E+292, // just below Number.MAX_VALUE
    Number.MAX_VALUE + 1E+292, // just above Number.MAX_VALUE

    // Booleans
    true, // boolean
    false, // boolean

    // Nullish values
    null, // null
    undefined, // explicitly testing for undefined

    // Arrays (including nested arrays)
    [], // array
    [1, 2, 3], // array
    [[[[1]]]], // deeply nested array

    // Objects (including special object types and nested objects)
    {}, // object
    {
        a: 1,
        b: 2
    }, // object
    { a: { b: { c: { d: 1 } } } }, // deeply nested object
    function () {
    } // a function object returning void
]

describe('POST api/v1/tracks', function () {
    describe('Valid Access Token', function () {
        let track: { trackName?: any, accessToken: string, timeOffset?: any }
        let testUser: IUser

        beforeEach(async function () {
            testUser = new UserModel({
                userName: 'TestUser',
                signUpDate: new Date()
            })
            await testUser.save()
        })

        describe('Valid Access Token', function () {
            for (const trackName of values) {
                for (const timeOffset of values) {
                    const testString = JSON.stringify({
                        trackName,
                        timeOffset
                    })

                    it(`should handle invalid inputs gracefully (test case ${testString})`, async () => {
                        track = {
                            trackName,
                            accessToken: testUser.accessToken,
                            timeOffset
                        }

                        const res = await agent.post('/v1/tracks').send(track)

                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        expect(res.status).to.not.be.undefined
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        expect(res.body).to.not.be.undefined
                        expect(res).to.not.have.status(500)
                    })
                }
            }
        })

        describe('Invalid Access Token', function () {
            let track: { trackName?: any, accessToken?: any, timeOffset?: any }
            for (const accessToken of values) {
                for (const trackName of values) {
                    for (const timeOffset of values) {
                        const testString = JSON.stringify({
                            trackName,
                            timeOffset
                        })

                        it(`should handle invalid inputs gracefully (test case ${testString})`, async () => {
                            track = {
                                trackName,
                                accessToken,
                                timeOffset
                            }

                            const res = await agent.post('/v1/tracks').send(track)
                            const allTracks = await TrackModel.find({}).exec()

                            expect(allTracks.length).to.equal(0)
                            expect(res.status).to.be.above(400).and.to.be.below(500)

                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            expect(res.status).to.not.be.undefined
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            expect(res.body).to.not.be.undefined
                        })
                    }
                }
            }
        })
    })
})

describe('POST api/v1/users', function () {
    let user: { userName?: any }

    for (const userName of values) {
        const testString = JSON.stringify({ userName })

        it(`should handle invalid inputs gracefully (test case ${testString})`, async () => {
            user = {
                userName
            }

            const res = await agent.post('/v1/users').send(user)

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.status).to.not.be.undefined
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.body).to.not.be.undefined
            expect(res).to.not.have.status(500)
        })
    }
})

describe('DELETE api/v1/users', function () {
    let testUser: IUser

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser'
        })
        await testUser.save()
    })

    describe('Valid Access Token', function () {
        let user: { userName?: any, accessToken: string, confirmDeletion?: any }

        for (const userName of values) {
            for (const confirmDeletion of values) {
                const testString = JSON.stringify({
                    userName,
                    confirmDeletion
                })

                it(`should handle invalid inputs gracefully (test case ${testString})`, async () => {
                    user = {
                        userName,
                        accessToken: testUser.accessToken,
                        confirmDeletion
                    }

                    const res = await agent.delete('/v1/users').send(user)

                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    expect(res.status).to.not.be.undefined
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    expect(res.body).to.not.be.undefined
                    expect(res).to.not.have.status(500)
                })
            }
        }
    })

    describe('Invalid Access Token', function () {
        let user: { userName?: any, accessToken?: any, confirmDeletion?: any }

        for (const userName of values) {
            for (const accessToken of values) {
                for (const confirmDeletion of values) {
                    const testString = JSON.stringify({
                        userName,
                        confirmDeletion,
                        accessToken
                    })

                    it(`should handle invalid inputs gracefully (test case ${testString})`, async () => {
                        user = {
                            userName,
                            accessToken,
                            confirmDeletion
                        }

                        const res = await agent.delete('/v1/users').send(user)
                        const allUsers = await UserModel.find({}).exec()

                        expect(allUsers.length).to.equal(1)
                        expect(res.status).to.be.above(400).and.to.be.below(500)

                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        expect(res.status).to.not.be.undefined
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        expect(res.body).to.not.be.undefined
                    })
                }
            }
        }
    })
})

describe('DELETE api/v1/tracks/last', function () {
    let testUser: IUser
    let testTrack: ITrack
    let user: { accessToken?: any }

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser'
        })
        await testUser.save()
        testTrack = new TrackModel({
            trackName: 'testTrackA1',
            date: new Date(),
            userId: testUser._id
        })
        await testTrack.save()
    })

    for (const accessToken of values) {
        const testString = JSON.stringify({ accessToken })

        it(`should handle invalid inputs gracefully (test case ${testString})`, async () => {
            user = {
                accessToken
            }

            const res = await agent.delete('/v1/tracks/last').send(user)
            const allTracks = await TrackModel.find({}).exec()

            expect(allTracks.length).to.equal(1)
            expect(res.status).to.be.above(400).and.to.be.below(500)

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.status).to.not.be.undefined
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.body).to.not.be.undefined
        })
    }
})
