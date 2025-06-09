const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middlewares/auth');

// 임시 라우트 (나중에 구현 예정)
router.get('/', optionalAuth, (req, res) => {
  res.json({ 
    success: true,
    message: '코인 API - 구현 예정',
    coins: [
      { symbol: 'BTC', name: 'Bitcoin', price: 58432.21 },
      { symbol: 'ETH', name: 'Ethereum', price: 3521.08 },
      { symbol: 'ADA', name: 'Cardano', price: 2.85 }
    ]
  });
});

router.get('/:symbol', optionalAuth, (req, res) => {
  const { symbol } = req.params;
  res.json({ 
    success: true,
    message: `${symbol} 코인 정보 - 구현 예정`,
    coin: {
      symbol: symbol.toUpperCase(),
      name: `${symbol} Coin`,
      price: Math.random() * 100000
    }
  });
});

module.exports = router;
