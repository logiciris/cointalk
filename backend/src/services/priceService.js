// 실시간 코인 가격 서비스
class PriceService {
  constructor() {
    this.priceCache = {};
    this.exchangeRate = 1320; // USD to KRW 기본값
    this.lastUpdated = 0;
    this.CACHE_DURATION = 60000; // 1분 캐시
  }

  // USD/KRW 환율 가져오기
  async getExchangeRate() {
    try {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      
      if (response.ok) {
        const data = await response.json();
        this.exchangeRate = data.rates.KRW || 1320;
      }
    } catch (error) {
      console.log('환율 API 오류, 기본값 사용:', this.exchangeRate);
    }
    
    return this.exchangeRate;
  }

  // 실시간 가격 가져오기 (CoinGecko API 사용)
  async getRealTimePrices() {
    const now = Date.now();
    
    // 캐시된 가격이 유효하면 반환
    if (now - this.lastUpdated < this.CACHE_DURATION && Object.keys(this.priceCache).length > 0) {
      return {
        prices: this.priceCache,
        exchangeRate: this.exchangeRate
      };
    }

    try {
      // 환율 업데이트
      await this.getExchangeRate();
      
      // CoinGecko API 호출
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,ripple,dogecoin&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error('API 호출 실패');
      }
      
      const data = await response.json();
      
      // 가격 매핑
      this.priceCache = {
        'BTC': data.bitcoin?.usd || 110000,
        'ETH': data.ethereum?.usd || 3800,
        'ADA': data.cardano?.usd || 0.40,
        'SOL': data.solana?.usd || 140,
        'XRP': data.ripple?.usd || 0.55,
        'DOGE': data.dogecoin?.usd || 0.07
      };
      
      this.lastUpdated = now;
      console.log('실시간 가격 업데이트:', this.priceCache);
      console.log('환율 (USD/KRW):', this.exchangeRate);
      
      return {
        prices: this.priceCache,
        exchangeRate: this.exchangeRate
      };
      
    } catch (error) {
      console.error('가격 API 오류:', error);
      
      // API 실패 시 기본값 반환
      return {
        prices: {
          'BTC': 110000,
          'ETH': 3800,
          'ADA': 0.40,
          'SOL': 140,
          'XRP': 0.55,
          'DOGE': 0.07
        },
        exchangeRate: this.exchangeRate
      };
    }
  }

  // 모의 가격 변동 (개발용)
  async getMockPrices() {
    const basePrice = {
      'BTC': 110000,
      'ETH': 3800,
      'ADA': 0.40,
      'SOL': 140,
      'XRP': 0.55
    };

    // ±5% 랜덤 변동
    const mockPrices = {};
    for (const [symbol, price] of Object.entries(basePrice)) {
      const variation = (Math.random() - 0.5) * 0.1; // ±5%
      mockPrices[symbol] = Math.round(price * (1 + variation) * 100) / 100;
    }

    console.log('모의 가격 변동:', mockPrices);
    return {
      prices: mockPrices,
      exchangeRate: this.exchangeRate
    };
  }

  // 히스토리컬 가격 저장 (일일 변화율 계산용)
  async saveDailyPrices() {
    // 매일 자정에 실행되는 함수
    // 일일 변화율 계산을 위해 이전 가격 저장
  }
}

module.exports = new PriceService();
