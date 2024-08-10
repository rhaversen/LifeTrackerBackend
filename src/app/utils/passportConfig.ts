// Node.js built-in modules

// Third-party libraries
import validator from 'validator'
import { compare } from 'bcrypt'
import { Strategy as LocalStrategy } from 'passport-local'

// Own modules
import UserModel, { type IUser } from '../models/User.js'
import { type PassportStatic } from 'passport'

// Destructuring and global variables

const configurePassport = (passport: PassportStatic): void => {
    // Local Strategy
    passport.use('user-local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        (async () => {
            try {
                if (!validator.isEmail(email)) {
                    done(null, false, { message: 'Invalid email' })
                    return
                }

                const user = await UserModel.findOne({ email }).exec()
                if (user === null || user === undefined) {
                    done(null, false, { message: 'A user with the email ' + email + ' was not found. Please check spelling or sign up' })
                    return
                }

                const isMatch = await compare(password, user.password)
                if (!isMatch) {
                    done(null, false, { message: 'Invalid credentials' })
                    return
                }

                done(null, user)
            } catch (err) {
                done(err)
            }
        })().catch(err => { done(err) })
    }))

    passport.serializeUser(function (user: any, done) {
        const userId = (user as IUser).id
        done(null, userId)
    })

    passport.deserializeUser(function (id, done) {
        UserModel.findById(id).exec()
            .then(user => {
                if (user === null || user === undefined) {
                    done(new Error('User not found'), false)
                }
                done(null, user)
            })
            .catch(err => {
                done(err, false)
            })
    })
}

export default configurePassport
