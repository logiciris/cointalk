const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middlewares/auth');

const router = express.Router();

// 모든 포트폴리오 라우트는 인증 필요
router.use(auth.authenticate);

// 포트폴리오 조회
router.get('/', portfolioController.getPortfolio);

// 코인 매수
router.post('/buy', portfolioController.buyCoin);

// 코인 매도  
router.post('/sell', portfolioController.sellCoin);

// 거래 내역 조회
router.get('/transactions', portfolioController.getTransactions);

// 코인 수동 추가
router.post('/add-coin', portfolioController.addCoin);

module.exports = router;