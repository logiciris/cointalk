const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    // 의도적인 취약점: content에 XSS 취약점 가능성 (보안 취약점 학습 목적)
    // 실제 프로덕션 환경에서는 content 필드도 sanitize 해야 함
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  relatedCoins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coin'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

// 게시물 검색을 위한 인덱스 생성
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// updatedAt 필드 자동 갱신
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', PostSchema);
