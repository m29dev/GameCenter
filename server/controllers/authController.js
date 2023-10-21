require('dotenv').config()

const user_connect = async (req, res) => {
    try {
        const { nickname } = req.params
        console.log('user_connect: ', nickname)
        res.status(200).json({ nickname })
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    user_connect,
}
