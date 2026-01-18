import { expect } from 'chai'
import { describe, it } from 'mocha'

import TrackModel, { type ITrack } from '../../app/models/Track.js'
import UserModel, { type IUser } from '../../app/models/User.js'

import '../testSetup.js'

describe('Track Model', function () {
	let user: IUser

	beforeEach(async function () {
		user = new UserModel({
			userName: 'TestUser',
			email: 'test@test.com',
			password: 'password'
		})
		await user.save()
	})

	describe('Creating a track must fill out default fields', function () {
		describe('Date', function () {
			let track: ITrack

			beforeEach(async function () {
				track = new TrackModel({
					trackName: 'Test Track',
					userId: user._id
				})
			})

			it('should fill out date', async function () {
				await track.save()
				expect(track.date).to.be.a('date')
			})

			it('should set correct date', async function () {
				await track.save()
				expect(track.date.getTime()).to.be.closeTo(new Date().getTime(), 1000)
			})

			it('should set date before saving', async function () {
				expect(track.date).to.be.a('date')
			})
		})

		describe('createdAt', function () {
			let track: ITrack

			beforeEach(async function () {
				track = new TrackModel({
					trackName: 'Test Track',
					userId: user._id
				})
			})

			it('should fill out createdAt', async function () {
				await track.save()
				expect(track.createdAt).to.be.a('date')
			})

			it('should set correct date', async function () {
				await track.save()
				expect(track.createdAt.getTime()).to.be.closeTo(new Date().getTime(), 1000)
			})
		})
	})

	describe('required fields', function () {
		it('should require name', async function () {
			const track = new TrackModel({
				userId: user._id
			})
			await track.save().catch((err) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				expect(err).to.not.be.null
			})
		})

		it('should require userId', async function () {
			const track = new TrackModel({
				trackName: 'Test Track'
			})
			await track.save().catch((err) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				expect(err).to.not.be.null
			})
		})
	})

	describe('name validation', function () {
		it('should accept any name string', async function () {
			const track = new TrackModel({
				trackName: 'My Custom Track',
				userId: user._id
			})
			await track.save()
			expect(track.trackName).to.equal('My Custom Track')
		})

		it('should trim name', async function () {
			const track = new TrackModel({
				trackName: '  Trimmed Track  ',
				userId: user._id
			})
			await track.save()
			expect(track.trackName).to.equal('Trimmed Track')
		})

		it('should reject name over 100 characters', async function () {
			const track = new TrackModel({
				trackName: 'a'.repeat(101),
				userId: user._id
			})
			await track.save().catch((err) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				expect(err).to.not.be.null
			})
		})
	})
})
