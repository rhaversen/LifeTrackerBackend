// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import UserModel, { type IUser } from '../../app/models/User.js'
import TrackModel, { type ITrack } from '../../app/models/Track.js'

// Setup test environment
import '../testSetup.js'

describe('Track Model', () => {
    let user: IUser

    beforeEach(async () => {
        user = new UserModel({
            userName: 'JohnDoe'
        })
        await user.save()
    })

    describe('Creating a track must fill out default fields', () => {
        describe('Date', () => {
            let track: ITrack

            beforeEach(async () => {
                track = new TrackModel({
                    trackName: 'TEST_TRACK',
                    userId: user._id
                })
            })

            it('should fill out date', async () => {
                await track.save()
                expect(track.date).to.be.a('date')
            })

            it('should set correct date', async () => {
                await track.save()
                expect(track.date.getTime()).to.be.closeTo(new Date().getTime(), 1000)
            })

            it('should set date before saving', async () => {
                expect(track.date).to.be.a('date')
            })
        })

        describe('createdAt', () => {
            let track: ITrack

            beforeEach(async () => {
                track = new TrackModel({
                    trackName: 'TEST_TRACK',
                    userId: user._id
                })
            })

            it('should fill out createdAt', async () => {
                await track.save()
                expect(track.createdAt).to.be.a('date')
            })

            it('should set correct date', async () => {
                await track.save()
                expect(track.createdAt.getTime()).to.be.closeTo(new Date().getTime(), 1000)
            })

            it('should set createdAt before saving', async () => {
                expect(track.createdAt).to.be.a('date')
            })
        })
    })

    describe('required fields', () => {
        it('should require trackName', async () => {
            const track = new TrackModel({
                userId: user._id
            })
            await track.save().catch((err) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(err).to.not.be.null
            })
        })

        it('should require userId', async () => {
            const track = new TrackModel({
                trackName: 'TEST_TRACK'
            })
            await track.save().catch((err) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(err).to.not.be.null
            })
        })
    })
})
