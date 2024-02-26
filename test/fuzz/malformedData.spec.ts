// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import validator from 'validator'

// Own modules
import { agent, chaiHttpObject } from '../testSetup.js'
import UserModel, { type IUser } from '../../src/models/User.js'
import TrackModel from '../../src/models/Track.js'

// Global variables and setup
const { expect } = chaiHttpObject
const values = [
    'actualValue', // Used for inputting the real and expected values

    // Strings
    '', // empty string
    'test', // string
    'true', // string
    'false', // string
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
    { a: 1, b: 2 }, // object
    { a: { b: { c: { d: 1 } } } }, // deeply nested object
    function () { } // a function object
]

describe('POST api/v1/tracks', function () {
    let testUser: IUser
    let track: { trackName?: any, accessToken?: any, timeOffset?: any }

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser',
            signUpDate: new Date()
        })
        await testUser.save()
    })

    function handleTestCase (trackName: any, accessToken: any, timeOffset: any): void {
        const trackNameMessage = trackName === undefined ? 'trackName missing' : `trackName: ${validator.escape(String(trackName))}`
        const accessTokenMessage = accessToken === undefined ? 'accessToken missing' : `accessToken: ${validator.escape(String(accessToken))}`
        const timeOffsetMessage = timeOffset === undefined ? 'timeOffset missing' : `timeOffset: ${validator.escape(String(timeOffset))}`

        const testName = [trackNameMessage, accessTokenMessage, timeOffsetMessage].join(', ')

        const isTrackNameValid = typeof trackName === 'string' && trackName !== ''
        const isAccessTokenValid = accessToken === 'actualValue'
        const isTimeOffsetUndefined = timeOffset === undefined
        const isTimeOffsetValid = typeof timeOffset === 'number' &&
                                  !isNaN((new Date(Date.now() + Number(timeOffset ?? 0))).getTime())

        track = {}
        if (trackName !== undefined) track.trackName = trackName
        if (accessToken !== undefined) track.accessToken = accessToken === 'actualValue' ? testUser.accessToken : accessToken
        if (timeOffset !== undefined) track.timeOffset = timeOffset

        if (isTrackNameValid && isAccessTokenValid && (isTimeOffsetUndefined || isTimeOffsetValid)) {
            // These cases are not considered malformed data
            it(`should respond with status 201 with case ${testName}`, async function () {
                const res = await agent.post('/v1/tracks').send(track)
                const allTracks = await TrackModel.find({}).exec()
                expect(allTracks.length).to.equal(1)
                expect(res).to.have.status(201)
            })
        } else {
            it(`should not create a track with case ${testName}`, async function () {
                const res = await agent.post('/v1/tracks').send(track)
                const allTracks = await TrackModel.find({}).exec()
                expect(allTracks.length).to.equal(0)
                expect(res).to.have.status(400)
            })
        }
    }

    values.forEach(trackName => {
        values.forEach(accessToken => {
            values.forEach(timeOffset => {
                handleTestCase(trackName, accessToken, timeOffset)
            })
        })
    })
})

describe('POST api/v1/users', function () {
    let user: { userName?: any }

    function handleTestCase (userName: any): void {
        const testName = userName === undefined ? 'userName missing' : `userName: ${validator.escape(String(userName))}`

        const isUserNameValid = typeof userName === 'string' && userName !== ''

        user = {}
        if (userName !== undefined) user.userName = userName

        if (isUserNameValid) {
            // These cases are not considered malformed data
            it(`should respond with status 201 with case ${testName}`, async function () {
                const res = await agent.post('/v1/users').send(user)
                const allUsers = await UserModel.find({}).exec()

                expect(allUsers.length).to.equal(1)
                expect(res).to.have.status(201)
            })
        } else {
            it(`should not create a user with case ${testName}`, async function () {
                const res = await agent.post('/v1/users').send(user)
                const allUsers = await UserModel.find({}).exec()

                expect(allUsers.length).to.equal(0)
                expect(res).to.have.status(400)
            })
        }
    }

    values.forEach(userName => {
        handleTestCase(userName)
    })
})

describe('DELETE api/v1/users', function () {
    let testUser: IUser
    let user: { userName?: any, accessToken?: any, confirmDeletion?: any }

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser',
            signUpDate: new Date()
        })
        await testUser.save()
    })

    function handleTestCase (userName: any, accessToken: any, confirmDeletion: any): void {
        const userNameMessage = userName === undefined ? 'userName missing' : `trackName: ${validator.escape(String(userName))}`
        const accessTokenMessage = accessToken === undefined ? 'accessToken missing' : `accessToken: ${validator.escape(String(accessToken))}`
        const confirmDeletionMessage = confirmDeletion === undefined ? 'confirmDeletion missing' : `timeOffset: ${validator.escape(String(confirmDeletion))}`

        const testName = [userNameMessage, accessTokenMessage, confirmDeletionMessage].join(', ')

        const isUserNameValid = typeof userName === 'string' && userName !== ''
        const isAccessTokenValid = accessToken === 'actualValue'
        const isConfirmDeletionValid = confirmDeletion === true

        user = {}
        if (userName !== undefined) user.userName = userName
        if (accessToken !== undefined) user.accessToken = accessToken === 'actualValue' ? testUser.accessToken : accessToken
        if (confirmDeletion !== undefined) user.confirmDeletion = confirmDeletion

        if (isUserNameValid && isAccessTokenValid && isConfirmDeletionValid) {
            it(`should respond with status 204 with case ${testName}`, async function () {
                const res = await agent.post('/v1/users').send(user)
                const allUsers = await TrackModel.find({}).exec()
                expect(allUsers.length).to.equal(0)
                expect(res).to.have.status(204)
            })
        } else if (isUserNameValid && !isAccessTokenValid && isConfirmDeletionValid) {
            it(`should respond with status 404 with case ${testName}`, async function () {
                const res = await agent.post('/v1/users').send(user)
                const allUsers = await TrackModel.find({}).exec()
                expect(allUsers.length).to.equal(1)
                expect(res).to.have.status(404)
            })
        } else {
            it(`should not delete user with case ${testName}`, async function () {
                const res = await agent.post('/v1/users').send(user)
                const allUsers = await TrackModel.find({}).exec()
                expect(allUsers.length).to.equal(1)
                expect(res).to.have.status(400)
            })
        }
    }

    values.forEach(userName => {
        values.forEach(accessToken => {
            values.forEach(confirmDeletion => {
                handleTestCase(userName, accessToken, confirmDeletion)
            })
        })
    })
})
