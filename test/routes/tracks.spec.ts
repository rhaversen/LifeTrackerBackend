// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import sinon from 'sinon'

// Own modules
import { agent, chaiHttpObject } from '../testSetup.js'
import UserModel, { type IUser } from '../../src/models/User.js'
import TrackModel, { type ITrack } from '../../src/models/Track.js'

// Global variables and setup
const { expect } = chaiHttpObject
const endpoint = ' api/v1/tracks'

describe('Post a new track' + endpoint, function () {
    let testUser: IUser
    let track: { trackName: string, accessToken: string }

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser'
        })
        await testUser.save()
        track = { trackName: 'test', accessToken: testUser.accessToken }
    })

    it('should create a track', async function () {
        await agent.post('/v1/tracks').send(track)
        const allTracks = await TrackModel.find({}).exec()
        expect(allTracks.length).to.equal(1)
        expect(allTracks[0].trackName).to.equal(track.trackName)
    })

    it('should respond with status code 201', async function () {
        const res = await agent.post('/v1/tracks').send(track)
        expect(res).to.have.status(201)
    })

    it('should respond with the track', async function () {
        const res = await agent.post('/v1/tracks').send(track)
        expect(res.body.trackName).to.equal(track.trackName)
    })

    it('should add the track to the user', async function () {
        await agent.post('/v1/tracks').send(track)
        const foundUser = await UserModel.findOne({}).exec() as IUser
        const foundTrack = await TrackModel.findOne({}).exec() as ITrack
        expect(foundUser.tracks.length).to.equal(1)
        expect(foundTrack.id).to.equal(foundUser.tracks[0]._id.toString())
    })

    it('should have the current date and time', async function () {
        const fakeTime = new Date(2020, 4, 15).getTime()
        sinon.useFakeTimers(fakeTime) // Fake the JavaScript environment's time
        await agent.post('/v1/tracks').send(track)
        const foundTrack = await TrackModel.findOne({}).exec() as ITrack
        expect(new Date(foundTrack.Date).getTime()).to.equal(fakeTime)
    })

    it('should not create a track if accessToken is invalid', async function () {
        track = { ...track, accessToken: 'invalidCode' }
        await agent.post('/v1/tracks').send(track)
        const allTracks = await TrackModel.find({}).exec()
        expect(allTracks.length).to.equal(0)
    })
})

describe('Post a new track with positive timeOffset' + endpoint, function () {
    let testUser: IUser
    let track: { trackName: string, accessToken: string, timeOffset: number }

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser'
        })
        await testUser.save()
        track = { trackName: 'test', accessToken: testUser.accessToken, timeOffset: 10 }
    })

    it('should create a track', async function () {
        await agent.post('/v1/tracks').send(track)
        const allTracks = await TrackModel.find({}).exec()
        expect(allTracks.length).to.equal(1)
        expect(allTracks[0].trackName).to.equal(track.trackName)
    })

    it('should respond with status code 201', async function () {
        const res = await agent.post('/v1/tracks').send(track)
        expect(res).to.have.status(201)
    })

    it('should respond with the track', async function () {
        const res = await agent.post('/v1/tracks').send(track)
        expect(res.body.trackName).to.equal(track.trackName)
    })

    it('should add the track to the user', async function () {
        await agent.post('/v1/tracks').send(track)
        const foundUser = await UserModel.findOne({}).exec() as IUser
        const foundTrack = await TrackModel.findOne({}).exec() as ITrack
        expect(foundUser.tracks.length).to.equal(1)
        expect(foundTrack.id).to.equal(foundUser.tracks[0]._id.toString())
    })

    it('should have the offset date and time', async function () {
        const fakeTime = new Date(2020, 4, 15).getTime()
        sinon.useFakeTimers(fakeTime) // Fake the JavaScript environment's time
        await agent.post('/v1/tracks').send(track)
        const foundTrack = await TrackModel.findOne({}).exec() as ITrack
        expect(new Date(foundTrack.Date).getTime()).to.equal(fakeTime + track.timeOffset)
    })
})

describe('Post a new track with negative timeOffset' + endpoint, function () {
    let testUser: IUser
    let track: { trackName: string, accessToken: string, timeOffset: number }

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser'
        })
        await testUser.save()
        track = { trackName: 'test', accessToken: testUser.accessToken, timeOffset: -10 }
    })

    it('should create a track', async function () {
        await agent.post('/v1/tracks').send(track)
        const allTracks = await TrackModel.find({}).exec()
        expect(allTracks.length).to.equal(1)
        expect(allTracks[0].trackName).to.equal(track.trackName)
    })

    it('should respond with status code 201', async function () {
        const res = await agent.post('/v1/tracks').send(track)
        expect(res).to.have.status(201)
    })

    it('should respond with the track', async function () {
        const res = await agent.post('/v1/tracks').send(track)
        expect(res.body.trackName).to.equal(track.trackName)
    })

    it('should add the track to the user', async function () {
        await agent.post('/v1/tracks').send(track)
        const foundUser = await UserModel.findOne({}).exec() as IUser
        const foundTrack = await TrackModel.findOne({}).exec() as ITrack
        expect(foundUser.tracks.length).to.equal(1)
        expect(foundTrack.id).to.equal(foundUser.tracks[0]._id.toString())
    })

    it('should have the offset date and time', async function () {
        const fakeTime = new Date(2020, 4, 15).getTime()
        sinon.useFakeTimers(fakeTime) // Fake the JavaScript environment's time
        await agent.post('/v1/tracks').send(track)
        const foundTrack = await TrackModel.findOne({}).exec() as ITrack
        expect(new Date(foundTrack.Date).getTime()).to.equal(fakeTime + track.timeOffset)
    })
})

describe('Malformed data' + endpoint, function () {
    const values = [
        '', // empty string
        'test', // string
        true, // boolean used for setting the actual accessToken
        false, // boolean
        0, // number
        10, // number
        -10, // negative number
        undefined, // explicitly testing for undefined
        Number.NaN
    ]
    let testUser: IUser
    let track: { trackName?: any, accessToken?: any, timeOffset?: any }

    beforeEach(async function () {
        testUser = new UserModel({
            userName: 'TestUser'
        })
        await testUser.save()
    })

    // Dynamically create test cases for each combination
    values.forEach(trackName => {
        values.forEach(accessToken => {
            values.forEach(timeOffset => {
                // These cases are not considered malformed data
                if (trackName === 'test' && accessToken === true && (typeof timeOffset === 'number' || timeOffset === undefined)) {
                    return
                }

                const testNameParts = [
                    trackName === undefined ? 'trackName missing' : `trackName: ${typeof trackName}, ${trackName === '' ? '""' : trackName}`,
                    accessToken === undefined ? 'accessToken missing' : `accessToken: ${typeof accessToken}, ${accessToken === true ? 'real' : (accessToken === '' ? '""' : accessToken)}`,
                    timeOffset === undefined ? 'timeOffset missing' : `timeOffset: ${typeof timeOffset}, ${timeOffset === '' ? '""' : timeOffset}`
                ]

                const testName = testNameParts.join(', ')

                it(`should handle case with ${testName}`, async function () {
                    track = {}
                    if (trackName !== undefined) track.trackName = trackName
                    if (accessToken !== undefined) track.accessToken = accessToken === true ? testUser.accessToken : accessToken
                    if (timeOffset !== undefined) track.timeOffset = timeOffset

                    const res = await agent.post('/v1/tracks').send(track)
                    const allTracks = await TrackModel.find({}).exec()
                    expect(allTracks.length).to.equal(0)
                    expect(res).to.have.status(400)
                })
            })
        })
    })
})
