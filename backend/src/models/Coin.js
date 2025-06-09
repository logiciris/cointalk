const mongoose = require('mongoose');

const CoinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  logoUrl: {
    type: String
  },
  website: {
    type: String
  },
  marketData: {
    price: {
      type: Number,
      default: 0
    },
    marketCap: {
      type: Number,
      default: 0
    },
    volume24h: {
      type: Number,
      default: 0
    },
    change24h: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// 의도적인 취약점: 입력값 검증 부재 (보안 취약점 학습 목적)
// 실제 프로덕션 환경에서는 데이터 입력 시 더 엄격한 검증 필요

module.exports = mongoose.model('Coin', CoinSchema);
