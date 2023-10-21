const express = require('express')
const controller = require('../controllers/roomController.js')

const router = express.Router()

router.post('/api/rooms/create', controller.room_create)
router.post('/api/rooms/user/join', controller.room_user_join)
router.post('/api/rooms/data/save', controller.room_data_save)
router.get('/api/rooms/data/get/:roomId', controller.room_data_get)
router.get('/api/rooms/:id', controller.room_id_get)

module.exports = router
