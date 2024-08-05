const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review.js');
const CampGround = require('../models/campGround');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');

router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.create));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.delete));

module.exports = router;