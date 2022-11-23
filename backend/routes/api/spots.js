const express = require('express')
const router = express.Router();
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Spot } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');




//get all spots
router.get(
    '/',
    async (req, res) => {
        const spots = await Spot.findAll();
        return res.json({
            spots
        });
    }
);

module.exports = router
