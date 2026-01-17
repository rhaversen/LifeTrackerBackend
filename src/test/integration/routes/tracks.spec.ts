/* eslint-disable @typescript-eslint/no-unused-expressions */
// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import { expect } from 'chai'
import sinon from 'sinon'

import TrackModel, { type ITrack } from '../../../app/models/Track.js'
import UserModel, { type IUser } from '../../../app/models/User.js'
import { chaiAppServer as agent } from '../../testSetup.js'

describe('POST api/v1/tracks', function () {
	describe('Post a new track', function () {
		let testUser: IUser
		let track: { trackName: string, accessToken: string }

		beforeEach(async function () {
			testUser = new UserModel({
				userName: 'TestUser',
				email: 'test@test.com',
				password: 'password'
			})
			await testUser.save()
			track = {
				trackName: 'TEST_TRACK',
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
				userName: 'TestUser',
				email: 'test@test.com',
				password: 'password'
			})
			await testUser.save()
			track = {
				trackName: 'TEST_TRACK',
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
				userName: 'TestUser',
				email: 'test@test.com',
				password: 'password'
			})
			await testUser.save()
			track = {
				trackName: 'TEST_TRACK',
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
				userName: 'TestUser',
				email: 'test@test.com',
				password: 'password'
			})
			await testUser.save()
			track = {
				trackName: 'TEST_TRACK',
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
				userName: 'TestUser',
				email: 'test@test.com',
				password: 'password'
			})
			await testUser.save()
			track = {
				trackName: 'TEST_TRACK',
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
			userName: 'TestUser',
			email: 'test@test.com',
			password: 'password'
		})
		await testUserA.save()
		testTrackA1 = new TrackModel({
			trackName: 'TEST_TRACK_A1',
			userId: testUserA._id
		})
		await testTrackA1.save()
	})

	describe('Delete a track', function () {
		let res: any

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
			expect(res.body).to.be.empty
		})
	})

	describe('Delete last created track with earlier date (timeOffset)', function () {
		let earlierDateTrack: ITrack

		beforeEach(async function () {
			earlierDateTrack = new TrackModel({
				trackName: 'EARLIER_DATE_TRACK',
				date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // A week ago
				userId: testUserA._id
			})
			await earlierDateTrack.save()
			await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
		})

		it('should delete the newest created track', async function () {
			const allTracks = await TrackModel.find({}).exec()
			expect(allTracks[0].trackName).to.equal('TEST_TRACK_A1')
		})
	})

	describe('Invalid accessToken', function () {
		let res: any

		beforeEach(async function () {
			res = await agent.delete('/v1/tracks/last').send({ accessToken: 'invalidAccessToken' })
		})

		it('should not delete track', async function () {
			const allTracks = await TrackModel.find({}).exec()
			expect(allTracks.length).to.equal(1)
		})

		it('should respond with status code 400', async function () {
			expect(res).to.have.status(404)
		})
	})

	describe('No accessToken', function () {
		let res: any

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
		let res: any

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
				trackName: 'NEW_TRACK',
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
			expect(allTracks[0].trackName).to.equal('TEST_TRACK_A1')
		})

		it('should respond with status code 204', async function () {
			const res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
			expect(res).to.have.status(204)
		})

		it('should have an empty body', async function () {
			const res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })

			expect(res.body).to.be.empty
		})
	})

	describe('No tracks', function () {
		let res: any

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
			expect(res.body).to.be.empty
		})
	})

	describe('Multiple users', function () {
		let testUserB: IUser
		let testTrackB1: ITrack

		beforeEach(async function () {
			testUserB = new UserModel({
				userName: 'TestUserB',
				email: 'testB@test.com',
				password: 'password'
			})
			await testUserB.save()
			testTrackB1 = new TrackModel({
				trackName: 'TEST_TRACK_B1',
				userId: testUserB._id
			})
			await testTrackB1.save()
		})

		describe('No tracks', function () {
			let res: any

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
				expect(res.body).to.be.empty
			})
		})

		describe('Single track', function () {
			let res: any

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
				expect(res.body).to.be.empty
			})
		})

		describe('Multiple tracks', function () {
			let testTrackA2: ITrack
			let testTrackB2: ITrack
			let res: any

			beforeEach(async function () {
				testTrackA2 = new TrackModel({
					trackName: 'TEST_TRACK_A2',
					userId: testUserA._id
				})
				await testTrackA2.save()
				testTrackB2 = new TrackModel({
					trackName: 'TEST_TRACK_B2',
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
				expect(testUserATracks[0].trackName).to.equal('TEST_TRACK_A1')
			})

			it('should not delete any tracks of the other user', async function () {
				const testUserBTracks = await TrackModel.find({ userId: testUserB._id }).exec()
				expect(testUserBTracks.length).to.equal(2)
			})

			it('should respond with status code 204', async function () {
				expect(res).to.have.status(204)
			})

			it('should have an empty body', async function () {
				expect(res.body).to.be.empty
			})
		})
	})
})

describe('GET api/v1/tracks', function () {
	let userA: IUser
	let userB: IUser
	let sessionCookie: string

	const userAFields = {
		userName: 'TestUser1',
		email: 'test1@test.com',
		password: 'password'
	}

	const userBFields = {
		userName: 'TestUser2',
		email: 'test2@test.com',
		password: 'password'
	}

	beforeEach(async function () {
		userA = await UserModel.create(userAFields)
		userB = await UserModel.create(userBFields)

		await TrackModel.insertMany([
			{ trackName: 'TEST_TRACK_A1', userId: userA._id, date: new Date(Date.UTC(2020, 4, 14)) },
			{ trackName: 'TEST_TRACK_A1', userId: userA._id, date: new Date(Date.UTC(2020, 4, 15)) },
			{ trackName: 'TEST_TRACK_A2', userId: userA._id, date: new Date(Date.UTC(2020, 4, 16)) },
			{ trackName: 'TEST_TRACK_A3', userId: userA._id, date: new Date(Date.UTC(2020, 4, 17)) },
			{ trackName: 'TEST_TRACK_B1', userId: userB._id },
			{ trackName: 'TEST_TRACK_B2', userId: userB._id }
		])

		// Login userA
		const logInRes = await agent.post('/v1/auth/login-local').send(userAFields)

		// Save session cookie
		sessionCookie = logInRes.headers['set-cookie']
	})

	describe('Fetch all tracks', function () {
		let res: any

		beforeEach(async function () {
			res = await agent.get('/v1/tracks').set('Cookie', sessionCookie)
		})

		it('should respond with status code 200', async function () {
			expect(res).to.have.status(200)
		})

		it('should respond with an array of tracks', async function () {
			expect(res.body).to.be.an('array')
		})

		it('should respond with the correct number of tracks', async function () {
			expect(res.body).to.have.length(4)
		})

		it('should respond with all tracks of the user', async function () {
			expect(res.body[0].trackName).to.equal('TEST_TRACK_A1')
			expect(res.body[1].trackName).to.equal('TEST_TRACK_A1')
			expect(res.body[2].trackName).to.equal('TEST_TRACK_A2')
			expect(res.body[3].trackName).to.equal('TEST_TRACK_A3')
		})

		it('should not respond with any track of other users', async function () {
			for (const track of res.body) {
				expect(track.trackName).to.not.include('B')
			}
		})
	})

	describe('Fetch tracks with query', function () {
		describe('Track name query', function () {
			let res: any

			beforeEach(async function () {
				res = await agent.get('/v1/tracks?trackName=TEST_TRACK_A1').set('Cookie', sessionCookie)
			})

			it('should respond with status code 200', async function () {
				expect(res).to.have.status(200)
			})

			it('should respond with an array of tracks', async function () {
				expect(res.body).to.be.an('array')
			})

			it('should respond with the correct number of tracks', async function () {
				expect(res.body).to.have.length(2)
			})

			it('should respond with all tracks of the user', async function () {
				expect(res.body[0].trackName).to.equal('TEST_TRACK_A1')
				expect(res.body[1].trackName).to.equal('TEST_TRACK_A1')
			})

			it('should not respond with any track of other users', async function () {
				for (const track of res.body) {
					expect(track.trackName).to.not.include('B')
				}
			})

			it('should not respond with any track that does not match the query', async function () {
				for (const track of res.body) {
					expect(track.trackName).to.not.include('2')
				}
			})
		})

		describe('Date query', function () {
			describe('From date query', function () {
				let res: any

				beforeEach(async function () {
					res = await agent.get('/v1/tracks?fromDate=2020-05-16').set('Cookie', sessionCookie)
				})

				it('should respond with status code 200', async function () {
					expect(res).to.have.status(200)
				})

				it('should respond with an array of tracks', async function () {
					expect(res.body).to.be.an('array')
				})

				it('should respond with the correct number of tracks', async function () {
					expect(res.body).to.have.length(2)
				})

				it('should respond with all tracks of the user', async function () {
					expect(res.body[0].trackName).to.equal('TEST_TRACK_A2')
					expect(res.body[1].trackName).to.equal('TEST_TRACK_A3')
				})

				it('should not respond with any track of other users', async function () {
					for (const track of res.body) {
						expect(track.trackName).to.not.include('B')
					}
				})

				it('should not respond with any track that does not match the query', async function () {
					for (const track of res.body) {
						expect(track.trackName).to.not.include('1')
					}
				})

				it('should not respond with any track that is older than the query', async function () {
					for (const track of res.body) {
						expect(new Date(track.date as Date).getTime()).to.be.at.least(new Date('2020-05-16').getTime())
					}
				})
			})

			describe('To date query', function () {
				let res: any

				beforeEach(async function () {
					res = await agent.get('/v1/tracks?toDate=2020-05-16').set('Cookie', sessionCookie)
				})

				it('should respond with status code 200', async function () {
					expect(res).to.have.status(200)
				})

				it('should respond with an array of tracks', async function () {
					expect(res.body).to.be.an('array')
				})

				it('should respond with the correct number of tracks', async function () {
					expect(res.body).to.have.length(3)
				})

				it('should respond with all tracks of the user that match the query', async function () {
					expect(res.body[0].trackName).to.equal('TEST_TRACK_A1')
					expect(res.body[1].trackName).to.equal('TEST_TRACK_A1')
					expect(res.body[2].trackName).to.equal('TEST_TRACK_A2')
				})

				it('should not respond with any track of other users', async function () {
					for (const track of res.body) {
						expect(track.trackName).to.not.include('B')
					}
				})

				it('should not respond with any track that does not match the query', async function () {
					for (const track of res.body) {
						expect(track.trackName).to.not.include('3')
					}
				})

				it('should not respond with any track that is newer than the query', async function () {
					for (const track of res.body) {
						expect(new Date(track.date as Date).getTime()).to.be.at.most(new Date('2020-05-16').getTime())
					}
				})
			})
		})
	})

	describe('Combined query', function () {
		let res: any

		beforeEach(async function () {
			res = await agent.get('/v1/tracks?trackName=TEST_TRACK_A1&fromDate=2020-05-15').set('Cookie', sessionCookie)
		})

		it('should respond with status code 200', async function () {
			expect(res).to.have.status(200)
		})

		it('should respond with an array of tracks', async function () {
			expect(res.body).to.be.an('array')
		})

		it('should respond with the correct number of tracks', async function () {
			expect(res.body).to.have.length(1)
		})

		it('should respond with all tracks of the user that match the query', async function () {
			expect(res.body[0].trackName).to.equal('TEST_TRACK_A1')
		})

		it('should not respond with any track of other users', async function () {
			for (const track of res.body) {
				expect(track.trackName).to.not.include('B')
			}
		})

		it('should not respond with any track that does not match the query', async function () {
			for (const track of res.body) {
				expect(track.trackName).to.not.include('2')
			}
		})

		it('should not respond with any track that is older than the query', async function () {
			for (const track of res.body) {
				expect(new Date(track.date as Date).getTime()).to.be.at.least(new Date('2020-05-15').getTime())
			}
		})

		describe('No match', function () {
			let res: any

			beforeEach(async function () {
				res = await agent.get('/v1/tracks?trackName=TEST_TRACK_A1&fromDate=2020-05-16').set('Cookie', sessionCookie)
			})

			it('should respond with status code 204', async function () {
				expect(res).to.have.status(204)
			})

			it('should not respond with an array of tracks', async function () {
				expect(res.body).to.be.empty
			})

			it('should not respond with any tracks', async function () {
				expect(JSON.stringify(res.body)).to.not.include('trackName')
			})
		})
	})

	describe('Query with no match', function () {
		describe('trackName query', function () {
			let res: any

			beforeEach(async function () {
				res = await agent.get('/v1/tracks?trackName=nonExistingTrack').set('Cookie', sessionCookie)
			})

			it('should respond with status code 204', async function () {
				expect(res).to.have.status(204)
			})

			it('should not respond with an array of tracks', async function () {
				expect(res.body).to.be.empty
			})

			it('should not respond with any tracks', async function () {
				expect(JSON.stringify(res.body)).to.not.include('trackName')
			})
		})

		describe('fromDate query', function () {
			let res: any

			beforeEach(async function () {
				res = await agent.get('/v1/tracks?fromDate=2020-05-18').set('Cookie', sessionCookie)
			})

			it('should respond with status code 204', async function () {
				expect(res).to.have.status(204)
			})

			it('should not respond with an array of tracks', async function () {
				expect(res.body).to.be.empty
			})

			it('should not respond with any tracks', async function () {
				expect(JSON.stringify(res.body)).to.not.include('trackName')
			})
		})

		describe('toDate query', function () {
			let res: any

			beforeEach(async function () {
				res = await agent.get('/v1/tracks?toDate=2020-05-13').set('Cookie', sessionCookie)
			})

			it('should respond with status code 204', async function () {
				expect(res).to.have.status(204)
			})

			it('should not respond with an array of tracks', async function () {
				expect(res.body).to.be.empty
			})

			it('should not respond with any tracks', async function () {
				expect(JSON.stringify(res.body)).to.not.include('trackName')
			})
		})
	})
})
