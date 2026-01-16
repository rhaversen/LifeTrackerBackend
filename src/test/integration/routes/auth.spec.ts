// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import { expect } from 'chai'
import sinon from 'sinon'
import mongoose from 'mongoose'

// Own modules
import { chaiAppServer as agent } from '../../testSetup.js'
import UserModel, { type IUser } from '../../../app/models/User.js'
import config from '../../../app/utils/setupConfig.js'

// Config
const {
    sessionExpiry
} = config

describe('POST /v1/auth/login-local', function () {
    let testUser: IUser

    const userFields = {
        userName: 'TestUser',
        email: 'TestUser@gmail.com',
        password: 'testPassword'
    }

    beforeEach(async function () {
        testUser = new UserModel(userFields)
        await testUser.save()
    })

    it('should have status 200 with valid credentials', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        expect(res).to.have.status(200)
    })

    it('should return a session cookie', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        const cookie = res.headers['set-cookie'].find((cookie: string) => cookie.includes('connect.sid'))
        expect(cookie).to.be.a('string')
    })

    it('should create a session in the database', async function () {
        // Create a session in the database
        await agent.post('/v1/auth/login-local').send(userFields)

        const sessionCollection = mongoose.connection.collection('sessions')
        const session = await sessionCollection.findOne({})

        expect(session).to.be.an('object')
    })

    it('should set the session id to the same as the cookie', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        const cookie = res.headers['set-cookie'].find((cookie: string) => cookie.includes('connect.sid'))
        const encodedCookieValue = cookie.split(';')[0].split('=')[1]
        const signedAndEncodedSessionId = encodedCookieValue.split('.')[0] as string
        const cookieSessionId = decodeURIComponent(signedAndEncodedSessionId).substring(2)

        const sessionCollection = mongoose.connection.collection('sessions')
        const session = await sessionCollection.findOne({})

        expect(session?._id).to.equal(cookieSessionId)
    })

    it('should set the session user to the user id', async function () {
        // Log the user in to get a token
        await agent.post('/v1/auth/login-local').send(userFields)

        const sessionCollection = mongoose.connection.collection('sessions')
        const session = await sessionCollection.findOne({})

        const sessionData = JSON.parse(session?.session as string)
        const sessionUserId = sessionData.passport.user

        expect(sessionUserId).to.equal(testUser.id)
    })

    it('should set originalMaxAge to null in the session', async function () {
        // Log the user in to get a token
        await agent.post('/v1/auth/login-local').send(userFields)

        const sessionCollection = mongoose.connection.collection('sessions')
        const session = await sessionCollection.findOne({})

        const sessionData = JSON.parse(session?.session as string)
        const sessionCookie = sessionData.cookie

        expect(sessionCookie.originalMaxAge).to.equal(null)
    })

    it('should set the session cookie to HttpOnly', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        const cookie = res.headers['set-cookie'].find((cookie: string) => cookie.includes('connect.sid'))
        expect(cookie).to.include('HttpOnly')
    })

    it('should set the Path on the session cookie', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        const cookie = res.headers['set-cookie'].find((cookie: string) => cookie.includes('connect.sid'))
        expect(cookie).to.include('Path=/')
    })

    it('should not set the maxAge on the session cookie', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        const cookie = res.headers['set-cookie'].find((cookie: string) => cookie.includes('connect.sid'))
        expect(cookie).to.not.include('Max-Age')
    })

    it('should return 401 with invalid password', async function () {
        const res = await agent.post('/v1/auth/login-local').send({
            email: userFields.email,
            password: 'invalidPassword'
        })

        expect(res).to.have.status(401)
    })

    it('should return 401 with invalid email', async function () {
        const res = await agent.post('/v1/auth/login-local').send({
            email: 'invalidEmail',
            password: userFields.password
        })

        expect(res).to.have.status(401)
    })

    it('should return 400 with missing email', async function () {
        const res = await agent.post('/v1/auth/login-local').send({
            password: userFields.password
        })

        expect(res).to.have.status(400)
    })

    it('should return 400 with missing password', async function () {
        const res = await agent.post('/v1/auth/login-local').send({
            email: userFields.email
        })

        expect(res).to.have.status(400)
    })

    it('should return 400 with missing email and password', async function () {
        const res = await agent.post('/v1/auth/login-local').send({})

        expect(res).to.have.status(400)
    })
})

describe('POST /v1/auth/login-local with stayLoggedIn', function () {
    const userFields = {
        userName: 'TestUser',
        email: 'TestUser@gmail.com',
        password: 'testPassword',
        stayLoggedIn: 'true'
    }

    beforeEach(async function () {
        const testUser = new UserModel(userFields)
        await testUser.save()
    })

    it('should set a Expires on the session cookie when stayLoggedIn is true', async function () {
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        expect(res).to.have.status(200)

        const cookie = res.headers['set-cookie'].find((cookie: string) => cookie.includes('connect.sid'))
        expect(cookie).to.include('Expires')
    })

    it('should set the Expires to the sessionExpiry value + now time', async function () {
        // Fake time with sinon
        sinon.useFakeTimers(new Date('2024-01-01'))

        const res = await agent.post('/v1/auth/login-local').send(userFields)

        expect(res).to.have.status(200)

        const cookie = res.headers['set-cookie'].find((cookie: string) => cookie.includes('connect.sid'))
        const expiryDate = new Date(Date.now() + sessionExpiry)
        expect(cookie).to.include(`Expires=${expiryDate.toUTCString()}`)
    })

    it('should not set a longer Expires on the session cookie when stayLoggedIn is not true', async function () {
        const res = await agent.post('/v1/auth/login-local').send({
            ...userFields,
            stayLoggedIn: 'false'
        })

        expect(res).to.have.status(200)
        expect(res.headers['set-cookie']).to.be.an('array').that.satisfies((cookies: string[]) => {
            return cookies.every((cookie: string) => !cookie.includes('Expires'))
        })
    })

    it('should set the expiry in the session data', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send(userFields)

        expect(res).to.have.status(200)

        const sessionCollection = mongoose.connection.collection('sessions')
        const session = await sessionCollection.findOne({})

        const sessionData = JSON.parse(session?.session as string)
        const sessionCookie = sessionData.cookie

        expect(sessionCookie.originalMaxAge).to.be.closeTo(sessionExpiry, 1000)
    })

    it('should handle boolean stayLoggedIn values', async function () {
        // Log the user in to get a token
        const res = await agent.post('/v1/auth/login-local').send({
            ...userFields,
            stayLoggedIn: true
        })

        expect(res).to.have.status(200)

        const sessionCollection = mongoose.connection.collection('sessions')
        const session = await sessionCollection.findOne({})

        const sessionData = JSON.parse(session?.session as string)
        const sessionCookie = sessionData.cookie

        expect(sessionCookie.originalMaxAge).to.be.closeTo(sessionExpiry, 1000)
    })
})

describe('POST /v1/auth/logout', function () {
    let testUser: IUser

    const userFields = {
        userName: 'TestUser',
        email: 'TestUser@gmail.com',
        password: 'testPassword'
    }

    beforeEach(async function () {
        testUser = new UserModel(userFields)
        await testUser.save()
    })

    it('should have status 200', async function () {
        // Log the user in to get a token
        await agent.post('/v1/auth/login-local').send(userFields)

        // Log the user out to remove the session
        const res = await agent.post('/v1/auth/logout')

        expect(res).to.have.status(200)
    })

    /**
    it('should remove the session from the database', async function () {
        const sessionCollection = mongoose.connection.collection('sessions')

        // Log the user in to get a token
        await agent.post('/v1/auth/login-local').send(userFields)

        // Log the user out to remove the session
        await agent.post('/v1/auth/logout')

        const session = await sessionCollection.findOne({})

        expect(session).to.equal(null)
    })
     */

    it('should remove the session cookie', async function () {
        // Log the user in to get a token
        await agent.post('/v1/auth/login-local').send(userFields)

        // Log the user out to remove the session
        const res = await agent.post('/v1/auth/logout')

        // Check if the cookie header is defined and look for the 'connect.sid' cookie
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const cookies = res.headers['set-cookie'] || []
        const sidCookie = cookies.find((cookie: string) => cookie.includes('connect.sid'))

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(sidCookie).to.be.undefined
    })
})

describe('GET /v1/auth/is-authenticated', function () {
    let testUser: IUser

    const userFields = {
        userName: 'TestUser',
        email: 'test@test.com',
        password: 'testPassword'
    }

    beforeEach(async function () {
        testUser = new UserModel(userFields)
        await testUser.save()
    })

    it('should return 200 with a valid session', async function () {
        // Log the user in to get a session cookie
        const loginRes = await agent.post('/v1/auth/login-local').send(userFields)

        // Extract the session cookie directly
        const sessionCookie: string = loginRes.headers['set-cookie'][0]

        // Use the session cookie in the authenticated request
        const res = await agent.get('/v1/auth/is-authenticated').set('Cookie', sessionCookie)

        // Validate the authenticated response
        expect(res).to.have.status(200)
    })

    it('should return 401 without a valid session', async function () {
        // Send the request without a session cookie
        const res = await agent.get('/v1/auth/is-authenticated')

        // Validate the response
        expect(res).to.have.status(401)
    })

    it('should return 401 with an invalid session', async function () {
        // Send the request with an invalid session cookie
        const res = await agent.get('/v1/auth/is-authenticated').set('Cookie', 'connect.sid=invalidSession')

        // Validate the response
        expect(res).to.have.status(401)
    })

    it('should return 401 with a session that has been tampered with', async function () {
        // Log the user in to get a session cookie
        const loginRes = await agent.post('/v1/auth/login-local').send(userFields)

        // Extract the session cookie directly
        const sessionCookie: string = loginRes.headers['set-cookie'][0]

        // Tamper with the session cookie
        const tamperedSessionCookie = sessionCookie.replace('connect.sid', 'tamperedSession')

        // Use the tampered session cookie in the authenticated request
        const res = await agent.get('/v1/auth/is-authenticated').set('Cookie', tamperedSessionCookie)

        // Validate the authenticated response
        expect(res).to.have.status(401)
    })
})

describe('GET /v1/auth/is-authenticated with stayLoggedIn', function () {
    let testUser: IUser

    const userFields = {
        userName: 'TestUser',
        email: 'test@test.com',
        password: 'testPassword',
        stayLoggedIn: true
    }

    beforeEach(async function () {
        testUser = new UserModel(userFields)
        await testUser.save()
    })

    it('should return 200 with a valid session', async function () {
        // Log the user in to get a session cookie
        const loginRes = await agent.post('/v1/auth/login-local').send(userFields)

        // Extract the session cookie directly
        const sessionCookie: string = loginRes.headers['set-cookie'][0]

        // Use the session cookie in the authenticated request
        const res = await agent.get('/v1/auth/is-authenticated').set('Cookie', sessionCookie)

        // Validate the authenticated response
        expect(res).to.have.status(200)
    })

    it('should return 401 without a valid session', async function () {
        // Send the request without a session cookie
        const res = await agent.get('/v1/auth/is-authenticated')

        // Validate the response
        expect(res).to.have.status(401)
    })

    it('should return 401 with an invalid session', async function () {
        // Send the request with an invalid session cookie
        const res = await agent.get('/v1/auth/is-authenticated').set('Cookie', 'connect.sid=invalidSession')

        // Validate the response
        expect(res).to.have.status(401)
    })

    it('should return 401 with a session that has been tampered with', async function () {
        // Log the user in to get a session cookie
        const loginRes = await agent.post('/v1/auth/login-local').send(userFields)

        // Extract the session cookie directly
        const sessionCookie: string = loginRes.headers['set-cookie'][0]

        // Tamper with the session cookie
        const tamperedSessionCookie = sessionCookie.replace('connect.sid', 'tamperedSession')

        // Use the tampered session cookie in the authenticated request
        const res = await agent.get('/v1/auth/is-authenticated').set('Cookie', tamperedSessionCookie)

        // Validate the authenticated response
        expect(res).to.have.status(401)
    })

    it('should return 401 with an expired session', async function () {
        // Fake time with sinon
        const clock = sinon.useFakeTimers(new Date('2024-01-01'))

        // Log the user in to get a session cookie
        const loginRes = await agent.post('/v1/auth/login-local').send(userFields)

        // Move the clock past the session expiry
        clock.tick(sessionExpiry + 1000)

        // Extract the session cookie directly
        const sessionCookie: string = loginRes.headers['set-cookie'][0]

        // Use the session cookie in the authenticated request
        const res = await agent.get('/v1/auth/is-authenticated').set('Cookie', sessionCookie)

        // Validate the authenticated response
        expect(res).to.have.status(401)
    })
})
