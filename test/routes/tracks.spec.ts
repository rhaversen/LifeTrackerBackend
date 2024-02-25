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

describe('Post a new track', function () {
    let testUser: IUser
    let track: { trackName: string, accessToken: string }

    beforeEach(async function () {
        testUser = new UserModel({
            username: 'TestUser'
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
})
