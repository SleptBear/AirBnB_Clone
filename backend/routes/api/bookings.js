const express = require('express')
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Spot, Review, SpotImage, Booking, ReviewImage, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { getCurrentUserById } = require('../../db/models/user');


router.get(
    '/current',
    restoreUser,
    requireAuth,
    async (req, res) => {
        let user = req.user;
console.log(typeof user.id)
        let bookings = await Booking.findAll({
            where: {
                userId: 3
            }
        })

        res.json(
            bookings
        )
    }

)





module.exports = router
