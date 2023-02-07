const router = require("express").Router();
const User = require('../models/User.model')
const bcrypt = require('bcryptjs')
const { isLoggedOut, isLoggedIn } = require('../middleware/route-guard');

router.get('/user', isLoggedOut, async (req, res, next) => {
    try {
        res.render('user/signup')
    } catch (err) {
        console.log(err)
    }
})

router.post('/user', isLoggedOut, async (req, res, next) => {

    const body = {...req.body}
    if (!body.username ||!body.password) {
        throw new Error('Username and password are required')
    }
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(body.password, salt)
    delete body.password
    body.password = passwordHash
    try {
        const user = await User.create(body)
        res.redirect('/')
    } catch(error) {
        if (error.code === 11000) {
            console.log('error 11000: Duplicate username')
            res.render('user/signup', { error: 'User already exists' })
        }
        console.log(error)
        res.render('user/signup', { body, error })
    }
})

router.get('/login', isLoggedOut, async (req, res, next) => {
    try {
        res.render('user/login')
    } catch (err) {
        console.log(err)
    }
})

router.post('/login', isLoggedOut, async (req, res, next) => {
    
    const body = req.body
    try {
        const userFound = await User.findOne({username: body.username})
      
        if (userFound == null) {
            throw new Error('User not found')
        } else {
            const userData = {
                username: userFound.username,
            }

            req.session.user = userData

            if (bcrypt.compareSync(body.password, userFound.password)) {
                res.redirect('profile')
            } else {
                throw new Error('Passwords don\'t match')
            }
        }
    } catch(err) {
        console.log(err)
        res.render('user/login', { body, err })
    }
})

router.get('/profile', isLoggedIn,  async(req, res, next) => {
    const user = req.session.user
    try {
        res.render('user/profile', {user})
    } catch (err) {
        console.log(err)
    }
})

module.exports = router