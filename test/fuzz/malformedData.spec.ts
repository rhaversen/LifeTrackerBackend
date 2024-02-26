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
    " ' ", // a single quote character
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

    // Numbers (and related special numeric values)
    0, // number
    10, // number
    -10, // negative number
    NaN, // NaN
    Number.NaN, // NaN
    Number.POSITIVE_INFINITY, // Infinity
    Number.NEGATIVE_INFINITY, // -Infinity
    Number.MAX_SAFE_INTEGER, // Largest integer that can be accurately represented
    Number.MIN_SAFE_INTEGER, // Smallest integer that can be accurately represented
    -Number.MAX_SAFE_INTEGER, // Largest integer that can be accurately represented
    -Number.MIN_SAFE_INTEGER, // Smallest integer that can be accurately represented
    Number.MAX_VALUE, // Largest number that can be accurately represented
    Number.MIN_VALUE, // Smallest number that can be accurately represented
    -Number.MAX_VALUE, // Largest number that can be accurately represented
    -Number.MIN_VALUE, // Smallest number that can be accurately represented
    1.7976931348623157E+10308, // just below Number.MAX_VALUE
    -1.7976931348623157E+10308, // just above Number.MIN_VALUE

    // Booleans
    true, // boolean
    false, // boolean

    // Nullish values
    null, // null
    undefined, // explicitly testing for undefined

    // BigInts
    1n, // BigInt
    -1n, // BigInt

    // Arrays (including nested arrays)
    [], // array
    [1, 2, 3], // array
    [[[[1]]]], // deeply nested array

    // Objects (including special object types and nested objects)
    {}, // object
    { a: 1, b: 2 }, // object
    { a: { b: { c: { d: 1 } } } }, // deeply nested object
    new Date(), // Date object
    new RegExp(''), // a regular expression object with an empty pattern
    new Map(), // a Map object
    new Set(), // a Set object

    // Others (unique types that don't fit neatly into other categories)
    Symbol('test'), // a Symbol object
]

describe('api/v1/tracks', function () {
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
        // These cases are not considered malformed data
        if (typeof trackName === 'string' && trackName !== '' && accessToken === 'actualValue' && (typeof timeOffset === 'number' || timeOffset === undefined)) {
            return
        }

        const trackNameMessage = trackName === undefined ? 'trackName missing' : `trackName: ${validator.escape(String(trackName))}`
        const accessTokenMessage = accessToken === undefined ? 'accessToken missing' : `accessToken: ${String(accessToken)}`
        const timeOffsetMessage = timeOffset === undefined ? 'timeOffset missing' : `timeOffset: ${String(timeOffset)}`

        const testName = [trackNameMessage, accessTokenMessage, timeOffsetMessage].join(', ')

        it(`should handle case with ${testName}`, async function () {
            track = {}
            if (trackName !== undefined) track.trackName = trackName
            if (accessToken !== undefined) track.accessToken = accessToken === 'actualValue' ? testUser.accessToken : accessToken
            if (timeOffset !== undefined) track.timeOffset = timeOffset

            const res = await agent.post('/v1/tracks').send(track)
            const allTracks = await TrackModel.find({}).exec()

            expect(allTracks.length).to.equal(0)
            expect(res).to.have.status(400)
        })
    }

    values.forEach(trackName => {
        values.forEach(accessToken => {
            values.forEach(timeOffset => {
                handleTestCase(trackName, accessToken, timeOffset)
            })
        })
    })
})
