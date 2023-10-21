const express = require('express')
const controller = require('../controllers/authController.js')

const router = express.Router()

router.get('/api/auth/connect/:nickname', controller.user_connect)

module.exports = router
