const express = require('express')
const LoginAuthService = require('./login-auth-service')
const LoginRouter = express.Router()
const jsonBodyParser = express.json()

LoginRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { email, password } = req.body
        const loginUser = { email, password }

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        
        LoginAuthService.getUserWithEmail(
            req.app.get('db'),
            loginUser.email
        )
            .then(dbUser => {
                if (!dbUser)
                    return res.status(400).json({
                        error: 'Incorrect email or password',
                    })
                
                return LoginAuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if(!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect email or password',
                            })

                        const sub = dbUser.email
                        const payload = { user_id: dbUser.id }
                        res.send({
                            authToken: LoginAuthService.createJwt(sub, payload),
                        })
                    })
            })
            .catch(next)
    })

    // todo: remove this once you have a working jwt token
    // api/auth/createtoken
LoginRouter
    .post('/createtoken', jsonBodyParser, (req, res, next) => {
        const sub = "tallyho_user@gmail.com"
        const payload = { user_id: 1 }
        res.send({
            authToken: LoginAuthService.createJwt(sub, payload),
        })
    })

    module.exports = LoginRouter;