const express = require('express')
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Spot, Review, SpotImage, booking, ReviewImage, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { getCurrentUserById } = require('../../db/models/user');


//get all spots
router.get(
    '/',
    async (req, res) => {
        // const spots = await Spot.scope(["itsReview", "itsImage"]).findAll({
        const spots = await Spot.findAll({
            // group: 'Spot.id',
            include: [
            {
                    model: Review,
                    // group: 'Reviews.id',
                    // attributes: {
                        attributes: ['stars'],
                        // include: [

                    //     [
                    //     sequelize.fn("AVG", sequelize.col("Reviews.stars")),
                    //     "avgRating"
                    //     ]
                        // ],
                    // },
            },
                {
                    model: SpotImage,
                    // attributes: ['url']
                }

            ],
        })
        // const reviews = await Review.findAll({
        //     attributes: [
        //         'id', 'spotId',
        //     ]
        // })
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
        spotsList.forEach(spot => {
            console.log(spot.Reviews.length)
                    let avg = 0
                    for (i = 0; i < spot.Reviews.length; i++) {
                        console.log(spot.Reviews[i].stars)
                        avg += spot.Reviews[i].stars
                    }

                    spot.avgRating = avg/spot.Reviews.length
            if (!spot.Reviews) {
                spot.review = 'no reviews found'
            }
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
//         })

        // const spotImage = await SpotImage.findAll({
        //     attributes: ['url']
// console.log(spotsList)
//         spotsList.forEach(ele => {
//             // console.log(spot)
//             let image = SpotImage.findOne({
//                 // where: {
//                 //     spotId: ele.id
//                 // }

//             });
//             console.log(image)
//             // console.log(preview)

        })


        return res.json({
            spotsList,
        });
    }
)


const validateCreation = [
    check('address')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a address with at least 4 characters.'),
    check('city')
      .isLength({ min: 3 })
      .withMessage('Please provide a valid city.'),
    check('state')
      .exists({ checkFalsy: true })
      .isLength({ min: 2 })
      .withMessage('Please do not abbreviate state'),
    check('country')
      .exists({ checkFalsy: true })
      .isLength({ min: 2 })
      .withMessage('Please provide a country with at least 2 characters.'),
    check('name')
      .exists({ checkFalsy: true })
      .isLength({ min: 2 })
      .withMessage('Name must be 2 characters or more.'),
    handleValidationErrors
  ];

router.post(
    '/',
    requireAuth,
    restoreUser,
    validateCreation,
    // User.toSafeObject(),

    async (req, res) => {
        let { user } = req;
        // const csrfToken = req.csrfToken();
        // console.log(user.toSafeObject())
        user = user.toSafeObject()
        ownerId = user.id
        // console.log(ownerId)

        const { address, city, state, country, lat, lng, name, description, price } = req.body;

    const spot = await Spot.createSpot({ ownerId, address, city, state, country, lat, lng, name, description, price})

    return res.json({
        spot
    })
    }
)



module.exports = router
