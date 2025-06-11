const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/all', searchController.searchAll);
router.get('/users', searchController.searchUsers);
router.get('/coins', searchController.searchCoins);

module.exports = router;