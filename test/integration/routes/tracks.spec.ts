// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import sinon from 'sinon'
import { expect } from 'chai'
import { type Response } from 'superagent'

// Own modules
import { chaiAppServer as agent } from '../../testSetup.js'
import UserModel, { type IUser } from '../../../src/models/User.js'
import TrackModel, { type ITrack } from '../../../src/models/Track.js'

describe('POST api/v1/tracks', function () {
    describe('Post a new track', function () {
        let testUser: IUser
        let track: { trackName: string, accessToken: string }

        beforeEach(async function () {
            testUser = new UserModel({
                userName: 'TestUser'
            })
            await testUser.save()
            track = {
                trackName: 'test',
                accessToken: testUser.accessToken
            }
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

        it('should add the user to the track', async function () {
            await agent.post('/v1/tracks').send(track)
            const foundUser = await UserModel.findOne({}).exec() as IUser
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(foundTrack.userId.toString()).to.equal(foundUser._id.toString())
        })

        it('should have the current date and time', async function () {
            const fakeTime = new Date(2020, 4, 15).getTime()
            sinon.useFakeTimers(fakeTime) // Fake the JavaScript environment's time
            await agent.post('/v1/tracks').send(track)
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(new Date(foundTrack.date).getTime()).to.equal(fakeTime)
        })

        it('should not create a track if accessToken is invalid', async function () {
            track = {
                ...track,
                accessToken: 'invalidCode'
            }
            await agent.post('/v1/tracks').send(track)
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
        })
    })

    describe('Positive timeOffset', function () {
        let testUser: IUser
        let track: { trackName: string, accessToken: string, timeOffset: number }

        beforeEach(async function () {
            testUser = new UserModel({
                userName: 'TestUser'
            })
            await testUser.save()
            track = {
                trackName: 'test',
                accessToken: testUser.accessToken,
                timeOffset: 10
            }
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

        it('should add the user to the track', async function () {
            await agent.post('/v1/tracks').send(track)
            const foundUser = await UserModel.findOne({}).exec() as IUser
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(foundTrack.userId.toString()).to.equal(foundUser._id.toString())
        })

        it('should have the offset date and time', async function () {
            const fakeTime = new Date(2020, 4, 15).getTime()
            sinon.useFakeTimers(fakeTime) // Fake the JavaScript environment's time
            await agent.post('/v1/tracks').send(track)
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(new Date(foundTrack.date).getTime()).to.equal(fakeTime + track.timeOffset)
        })
    })

    describe('Negative timeOffset', function () {
        let testUser: IUser
        let track: { trackName: string, accessToken: string, timeOffset: number }

        beforeEach(async function () {
            testUser = new UserModel({
                userName: 'TestUser'
            })
            await testUser.save()
            track = {
                trackName: 'test',
                accessToken: testUser.accessToken,
                timeOffset: -10
            }
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

        it('should add the user to the track', async function () {
            await agent.post('/v1/tracks').send(track)
            const foundUser = await UserModel.findOne({}).exec() as IUser
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(foundTrack.userId.toString()).to.equal(foundUser._id.toString())
        })

        it('should have the offset date and time', async function () {
            const fakeTime = new Date(2020, 4, 15).getTime()
            sinon.useFakeTimers(fakeTime) // Fake the JavaScript environment's time
            await agent.post('/v1/tracks').send(track)
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(new Date(foundTrack.date).getTime()).to.equal(fakeTime + track.timeOffset)
        })
    })

    describe('Reject large positive timeOffset', function () {
        let testUser: IUser
        let track: { trackName: string, accessToken: string, timeOffset: number }

        beforeEach(async function () {
            testUser = new UserModel({
                userName: 'TestUser'
            })
            await testUser.save()
            track = {
                trackName: 'test',
                accessToken: testUser.accessToken,
                timeOffset: Number.MAX_VALUE
            }
        })

        it('should not create a track with large offset', async function () {
            await agent.post('/v1/tracks').send(track)
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
        })

        it('should respond with status code 400', async function () {
            const res = await agent.post('/v1/tracks').send(track)
            expect(res).to.have.status(400)
        })
    })

    describe('Reject large negative timeOffset', function () {
        let testUser: IUser
        let track: { trackName: string, accessToken: string, timeOffset: number }

        beforeEach(async function () {
            testUser = new UserModel({
                userName: 'TestUser'
            })
            await testUser.save()
            track = {
                trackName: 'test',
                accessToken: testUser.accessToken,
                timeOffset: -Number.MAX_VALUE
            }
        })

        it('should not create a track with large offset', async function () {
            await agent.post('/v1/tracks').send(track)
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
        })

        it('should respond with status code 400', async function () {
            const res = await agent.post('/v1/tracks').send(track)
            expect(res).to.have.status(400)
        })
    })
})

describe('DELETE api/v1/tracks/last', function () {
    let testUserA: IUser
    let testTrackA1: ITrack

    beforeEach(async function () {
        testUserA = new UserModel({
            userName: 'testUserA'
        })
        await testUserA.save()
        testTrackA1 = new TrackModel({
            trackName: 'testTrackA1',
            userId: testUserA._id
        })
        await testTrackA1.save()
    })

    describe('Delete a track', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should delete a track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
        })

        it('should respond with status code 204', async function () {
            expect(res).to.have.status(204)
        })

        it('should have an empty body', async function () {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.body).to.be.empty
        })
    })

    describe('Delete last created track with earlier date (timeOffset)', function () {
        let earlierDateTrack: ITrack

        beforeEach(async function () {
            earlierDateTrack = new TrackModel({
                trackName: 'earlierDateTrack',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // A week ago
                userId: testUserA._id
            })
            await earlierDateTrack.save()
            await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should delete the newest created track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks[0].trackName).to.equal('testTrackA1')
        })
    })

    describe('Invalid accessToken', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({ accessToken: 'invalidAccessToken' })
        })

        it('should not delete track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should respond with status code 400', async function () {
            expect(res).to.have.status(400)
        })
    })

    describe('No accessToken', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({})
        })

        it('should not delete track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should respond with status code 400', async function () {
            expect(res).to.have.status(400)
        })
    })

    describe('Empty accessToken', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({ accessToken: '' })
        })

        it('should not delete track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should respond with status code 400', async function () {
            expect(res).to.have.status(400)
        })
    })

    describe('Multiple tracks', function () {
        beforeEach(async function () {
            const newTrack = new TrackModel({
                trackName: 'newTrack',
                userId: testUserA._id
            })
            await newTrack.save()
            await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should delete a single track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should delete last track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks[0].trackName).to.equal('testTrackA1')
        })

        it('should respond with status code 204', async function () {
            const res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            expect(res).to.have.status(204)
        })

        it('should have an empty body', async function () {
            const res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.body).to.be.empty
        })
    })

    describe('No tracks', function () {
        let res: Response

        beforeEach(async function () {
            await TrackModel.deleteMany({}).exec()
            res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should not delete a track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
        })

        it('should respond with status code 204', async function () {
            expect(res).to.have.status(204)
        })

        it('should have an empty body', async function () {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(res.body).to.be.empty
        })
    })

    describe('Multiple users', function () {
        let testUserB: IUser
        let testTrackB1: ITrack

        beforeEach(async function () {
            testUserB = new UserModel({
                userName: 'testUserB'
            })
            await testUserB.save()
            testTrackB1 = new TrackModel({
                trackName: 'testTrackB1',
                userId: testUserB._id
            })
            await testTrackB1.save()
        })

        describe('No tracks', function () {
            let res: Response

            beforeEach(async function () {
                await TrackModel.deleteMany({}).exec()
                res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            })

            it('should not delete a track', async function () {
                const allTracks = await TrackModel.find({}).exec()
                expect(allTracks.length).to.equal(0)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should have an empty body', async function () {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(res.body).to.be.empty
            })
        })

        describe('Single track', function () {
            let res: Response

            beforeEach(async function () {
                res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            })

            it('should delete a track', async function () {
                const testUserATracks = await TrackModel.find({ userId: testUserA._id }).exec()
                expect(testUserATracks.length).to.equal(0)
            })

            it('should not delete any tracks of the other user', async function () {
                const testUserBTracks = await TrackModel.find({ userId: testUserB._id }).exec()
                expect(testUserBTracks.length).to.equal(1)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should have an empty body', async function () {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(res.body).to.be.empty
            })
        })

        describe('Multiple tracks', function () {
            let testTrackA2: ITrack
            let testTrackB2: ITrack
            let res: Response

            beforeEach(async function () {
                testTrackA2 = new TrackModel({
                    trackName: 'testTrackA2',
                    userId: testUserA._id
                })
                await testTrackA2.save()
                testTrackB2 = new TrackModel({
                    trackName: 'testTrackB2',
                    userId: testUserB._id
                })
                await testTrackB2.save()
                res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            })

            it('should delete a single track', async function () {
                const testUserATracks = await TrackModel.find({ userId: testUserA._id }).exec()
                expect(testUserATracks.length).to.equal(1)
            })

            it('should delete the last track', async function () {
                const testUserATracks = await TrackModel.find({ userId: testUserA._id }).exec()
                expect(testUserATracks[0].trackName).to.equal('testTrackA1')
            })

            it('should not delete any tracks of the other user', async function () {
                const testUserBTracks = await TrackModel.find({ userId: testUserB._id }).exec()
                expect(testUserBTracks.length).to.equal(2)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should have an empty body', async function () {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(res.body).to.be.empty
            })
        })
    })
})
