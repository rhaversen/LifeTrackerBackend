// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries

// Own modules
import { agent, chaiHttpObject } from '../testSetup.js'
import UserModel, { type IUser } from '../../src/models/User.js'
import TrackModel from '../../src/models/Track.js'

// Global variables and setup
const { expect } = chaiHttpObject
const endpoint = ' api/v1/tracks'
const values = [
    'actualValue', // Used for inputting the expected values
    '', // empty string
    'test', // string
    'true', // string
    'false', // string
    '0', // string
    null, // null
    true, // boolean
    false, // boolean
    0, // number
    10, // number
    -10, // negative number
    undefined, // explicitly testing for undefined
    Number.NaN
]

describe('Malformed data' + endpoint, function () {
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

        const trackNameMessage = trackName === undefined ? 'trackName missing' : `trackName: ${trackName}`
        const accessTokenMessage = accessToken === undefined ? 'accessToken missing' : `accessToken: ${accessToken}`
        const timeOffsetMessage = timeOffset === undefined ? 'timeOffset missing' : `timeOffset: ${timeOffset}`

        const testName = [trackNameMessage, accessTokenMessage, timeOffsetMessage].join(', ')

        it(`should handle case with ${testName}`, async function () {
            track = {}
            if (trackName !== undefined) track.trackName = trackName
            if (accessToken !== undefined) track.accessToken = accessToken === 'actualValue' ? testUser.accessToken : accessToken
            if (timeOffset !== undefined) track.timeOffset = timeOffset

            const res = await agent.post('/v1/tracks').send(track)
            const allTracks = await TrackModel.find({}).exec()

            // Only print out the error message if the test case is not expected to pass
            if (allTracks.length > 0) {
                expect(allTracks.length).to.equal(0)
            }
            if (res.status !== 400) {
                expect(res).to.have.status(400)
            }
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
