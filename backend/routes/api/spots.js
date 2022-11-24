const express = require('express')
const router = express.Router();
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Spot, Review, SpotImage, booking, ReviewImage, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


//get all spots
router.get(
    '/',
    async (req, res) => {
        // const spots = await Spot.scope(["itsReview", "itsImage"]).findAll({
        const spots = await Spot.findAll({
            group: 'Spot.id',
            include: [
            {
                    model: Review,
                    // group: 'spotId',
                    attributes: {
                        include: [
                        [
                        sequelize.fn("AVG", sequelize.col("Reviews.stars")),
                        "avgRating"
                        ]
                        ],
                    },
            },
                {
                    model: SpotImage,
                    // attributes: ['url']
                }

            ],


        })
    //     const spots1 = await Spot.findAll();
    //     for(let ele of spots1) {
    //         ele = ele.toJSON();

    //     const review = await Review.findAll({
    //             where: { ele.id: 'spotId' }
    //         });
    //         console.log(review)
    //     }
    //     return res.json({

    //     })
    // })

// console.log(spots)
        let spotsList = []
        spots.forEach(spot => {
            // console.log(spot)
            // console.log(spot.toJSON())
            spotsList.push(spot.toJSON())
        })
// console.log(spotsList)
        spotsList.forEach(spot => {
            spot.Reviews.forEach(review => {
                // console.log(review.stars)
                if(review.stars) {
                    console.log(review)
                    spot.avgRatings = review.avgRating
                }
            })
            if (!spot.Reviews) {
                spot.review = 'no reviews found'
            }
// console.log(spot.Reviews)
            spot.SpotImages.forEach(image => {
                if(image.preview == true) {
                    spot.previewImage = image.url
                }
                if (image.preview == false) {
                    spot.preview = 'no preview can be shown'
                }
            })
            delete spot.Reviews
            delete spot.SpotImages
        })

        // const spotImage = await SpotImage.findAll({
        //     attributes: ['url']

        return res.json({
            spotsList,
        });
    }
)

module.exports = router
