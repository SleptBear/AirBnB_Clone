const express = require('express')
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Spot, Review, SpotImage, booking, ReviewImage, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { getCurrentUserById } = require('../../db/models/user');
// const review = require('../../db/models/review');

router.post(
    '/:reviewId/images',
    async (req, res) => {
        let url = req.body.url
        let reviewId = req.params.reviewId

        let possibleReview = await Review.findByPk(Number(reviewId))
        if(possibleReview === null) {
            res.status(404)
            res.json({
                'message': "review couldn't be found",
                'statusCode': 404
            })
        }
        // const newImage = await ReviewImage.createImage({
        //     reviewId,
        //     url
        // })
        const newImage = await ReviewImage.create({
            reviewId,
            url
        })
        res.json({
            newImage
        })
    }
)





module.exports = router
