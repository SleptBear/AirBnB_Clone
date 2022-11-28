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
        let user = req.user

        let userBookings = await Booking.findAll({
            where: {
                userId: user.id
            }
        });

        res.json(userBookings)
    }
)

router.delete(
    '/:bookingId',
    restoreUser,
    requireAuth,
    async (req, res) => {
        let user = req.user
        let bookingId = Number(req.params.bookingId)
        console.log(typeof bookingId)
        let booking = await Booking.findOne({
            where: {
                userId: user.id,
                id: bookingId
            }
        })
        res.json(booking)
    }
)

router.put(
    '/:bookingId',
    restoreUser,
    requireAuth,
    async (req, res) => {
        let user = req.user;
        let bookingId = Number(req.params.bookingId);
        let startDate = new Date(req.body.startDate);
        let endDate = new Date(req.body.endDate);

        console.log(endDate < startDate)
        if(endDate <= startDate) {
            res.status(400);
            return res.json({
                "message": "Validation error",
                "statusCode": 400,
                "errors": [
                  "endDate cannot come before startDate"
                ]
              })
        }

        let booking = await Booking.findOne({
            where: {
                id: bookingId,
                userId: user.id,

            }
        })

        if(!booking) {
            res.status(404);
            return res.json({
                "message": "Booking couldn't be found",
                "statusCode": 404
              })
        }

        booking.set({
            startDate: startDate,
            endDate: endDate
        });

        await booking.save()

        res.json(booking)
    }
)

module.exports = router
