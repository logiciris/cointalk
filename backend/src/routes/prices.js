const express = require('express');
const PriceService = require('../services/priceService');

const router = express.Router();

// 실시간 코인 가격 조회
router.get('/realtime', async (req, res) => {
  try {
    const priceData = await PriceService.getRealTimePrices();
    
    res.json({
      success: true,
      data: {
        prices: priceData.prices,
        exchangeRate: priceData.exchangeRate,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Real-time price error:', error);
    res.status(500).json({
      success: false,
      message: '실시간 가격 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 코인 가격 조회
router.get('/realtime/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = await PriceService.getRealTimePrices();
    
    const price = priceData.prices[symbol.toUpperCase()];
    
    if (!price) {
      return res.status(404).json({
        success: false,
        message: '지원하지 않는 코인입니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        price: price,
        exchangeRate: priceData.exchangeRate,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Coin price error:', error);
    res.status(500).json({
      success: false,
      message: '코인 가격 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
