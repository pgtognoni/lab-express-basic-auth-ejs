const router = require("express").Router();
const User = require('../models/User.model')
const bcrypt = require('bcryptjs')

router.get('/user', async (req, res, next) => {
    try {
        res.render('user/user')
    } catch (err) {
        console.log(err)
    }
})

router.post('/user', async (req, res, next) => {

    const body = {...req.body}
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(body.password, salt)
    delete body.password
    body.password = passwordHash
    try {
        const user = await User.create(body)
        res.redirect('/')
    } catch(err) {
        console.log(err)
    }
})

module.exports = router