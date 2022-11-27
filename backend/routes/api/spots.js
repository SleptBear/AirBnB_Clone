const express = require('express')
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Spot, Review, SpotImage, booking, ReviewImage, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { getCurrentUserById } = require('../../db/models/user');


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
        let Spots = []
        spots.forEach(spot => {
            // console.log(spot)
            // console.log(spot.toJSON())
            Spots.push(spot.toJSON())
        })
        Spots.forEach(spot => {
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
            Spots,
        });
    }
)



// create and post a spot
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

    const spot = await Spot.createSpot({
        exclude:
        ownerId, address, city, state, country, lat, lng, name, description, price})
        console.log(spot.toJSON())
    return res.json({
        spot
    })
    }
)

router.post(
    '/:spotId/images',
    restoreUser,
    requireAuth,
    async (req, res) => {
        // let imageResponse = []
        let spotId = req.params.spotId
        let url = req.body.url
        let preview = req.body.preview
        console.log(spotId)
        // console.log(url)
        // console.log(preview)
        if (!await Spot.findByPk(spotId)) {
            res.status(404)
            res.send({

                    "message": "Spot couldn't be found",
                    "statusCode": 404

            })
        }
        let spotImage = await SpotImage.addImage({
            url, preview, spotId })
        // console.log('STARTS AS', spotImage)
        // console.log('WANT TO CONVERT TO', spotImage.toJSON())
        // let resultImage = JSON.stringify(spotImage)
        // console.log("FINAL RESULT SHOULD LOOK LIKE", resultImage)
        // let parsed = JSON.stringify(resultImage)
        // imageResponse.spotId = parsed.spotId
        // imageResponse.spotId = parsed.url
        // imageResponse.spotId = parsed.preview
        // console.log(JSON.stringify(spotImage.dataValues))
        // imageResponse.id = JSON.stringify(spotImage.dataValues.id)
        // imageResponse.url = JSON.stringify(spotImage.dataValues.url)
        // imageResponse.preview = JSON.stringify(spotImage.dataValues.preview)
            // spotImage.toJSON()
            JSON.stringify(spotImage);
            delete spotImage.updatedAt;
            delete spotImage.createdAt;
            delete spotImage.spotId;
        res.json({
            spotImage
        });
     }

)

router.get('/current', restoreUser, requireAuth,
async (req, res) => {
    // console.log(req.user.dataValues.id)
    const spots = await Spot.findAll({

        where: {
           ownerId: req.user.dataValues.id
        },
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
    let Spots = []
        spots.forEach(spot => {
            // console.log(spot)
            // console.log(spot.toJSON())
            Spots.push(spot.toJSON())
        })
        Spots.forEach(spot => {
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
        })


        return res.json({
            Spots,
        });
    }
)

router.get(
    '/:spotId',
    async (req, res) => {

        // console.log(req.params.spotId)
        const owner = await User.findAll({
            where: {
                id: req.user.dataValues.id
            },
            attributes: ['id', 'firstName', 'lastName']
        })
        const spots = await Spot.findOne({
            where: {
                id: req.params.spotId
            },
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
         } )
         console.log("our spot", spots)
         if (spots === null) {
            res.status(404)
            res.send({
                "message": "Spot couldn't be found",
                "statusCode": 404
            })
         }
            let Spots = []
        // spots.forEach(spot => {
        //     // console.log(spot)
        //     // console.log(spot.toJSON())
            Spots.push(spots.toJSON())
        // })
        Spots.forEach(spot => {
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
            spot.numReviews = spot.Reviews.length
            delete spot.Reviews
            spot.Owner = owner
        })
        return res.json({
            Spots
        })
    }
)

router.put(
    '/:spotId',
    restoreUser,
    requireAuth,
    async (req, res) => {
    let spot = await Spot.findOne({
            where: {
                id: req.params.spotId
            },
    })
    if (spot === null) {
        res.status(404)
            res.send({
                "message": "Spot couldn't be found",
                "statusCode": 404
            })
    }
console.log(spot.dataValues.id)
let ownerId = spot.dataValues.id
let spotId = req.params.spotId
let address = req.body.address;
let city = req.body.city;
let state = req.body.state;
let country = req.body.country;
let lat = req.body.lat;
let lng = req.body.lng;
let name = req.body.name;
let description = req.body.description;
let price = req.body.price;

const updatedSpot = await Spot.updateSpot({
ownerId,
spotId,
address,
city,
state,
country,
lat,
lng,
name,
description,
price

})
    res.json({
        updatedSpot
    })
    }
)


module.exports = router
