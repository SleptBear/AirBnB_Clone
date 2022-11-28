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
            return res.json({
                'message': "review couldn't be found",
                'statusCode': 404
            })
        }
        // const newImage = await ReviewImage.createImage({
        //     reviewId,
        //     url
        // })
        let newImage = await ReviewImage.create({
            reviewId,
            url,
        })
        // console.log(newImage)
        let reviewImage = await ReviewImage.findOne({
            attributes: ['id', 'url'],
            where: {
                reviewId: reviewId
            }
        })
        // console.log(test)



        return res.json(
            reviewImage
        )
    }
)

router.get(
    '/current',
    restoreUser,
    requireAuth,
    async (req, res) => {
        let user = req.user.dataValues
        // console.log(user)
        // console.log(user.id)
    let userReviews = await Review.findAll({
        where: {
            userId: user.id
        },
        include: [

            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                    model: Spot,
                    attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price' ],
                        // include: {
                        //     model: SpotImage,
                        //     where: {
                        //        preview: true
                        //     },
                        //     attributes: ['id', 'url']
                        // }
            },
            {
                model: ReviewImage,
                attributes: ['id', 'url']
            }

            ],

    })

    // let spotImage = await SpotImage.findOne({
    //     where: {
    //         spotId: userReviews.Spot.id
    //     }
    // })

    let Reviews = []
            userReviews.forEach(spot => {

                Reviews.push(spot.toJSON())
            })
            for(i=0; i < Reviews.length; i++) {
                let spotImage = await SpotImage.findOne({
                    where: {
                        spotId: userReviews[i].Spot.id
                    }
                })
                Reviews[i].Spot.previewImage = spotImage.url
            }
// in future refactor findOne to findAll in case of multiple images
        res.json({
            Reviews
        })
    }
)

router.put(
    '/:reviewId',
    restoreUser,
    requireAuth,
    async (req, res) => {
        let reviewId = req.params.reviewId

        let review = await Review.findByPk(Number(reviewId));

        if(req.body === null) {
            res.status(400);
            return res.json({
                "message": "Validation error",
                "statusCode": 400,
                "errors": [
                  "Review text is required",
                  "Stars must be an integer from 1 to 5",
                ]
              })
        }



        if(review === null) {
            res.status(400);
            res.json({
                "message": "Review couldn't be found",
                "statusCode": 404
              })
        }
        let newReview = req.body.review;
        let stars = req.body.stars;

        review.review = newReview;
        review.stars = stars;

        await review.save();


        res.json(
            review
        )
    }
)



module.exports = router
