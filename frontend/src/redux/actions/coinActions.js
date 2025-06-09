// 코인 관련 액션 타입
export const FETCH_COINS = 'FETCH_COINS';
export const FETCH_COINS_SUCCESS = 'FETCH_COINS_SUCCESS';
export const FETCH_COINS_FAIL = 'FETCH_COINS_FAIL';
export const FETCH_COIN = 'FETCH_COIN';
export const FETCH_COIN_SUCCESS = 'FETCH_COIN_SUCCESS';
export const FETCH_COIN_FAIL = 'FETCH_COIN_FAIL';

// 임시 코인 데이터
const mockCoins = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 58432.21, change: 2.4, marketCap: 1120000000000, volume: 45300000000, logo: 'https://via.placeholder.com/32' },
  { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3521.08, change: -1.2, marketCap: 420000000000, volume: 21600000000, logo: 'https://via.placeholder.com/32' },
  { id: 3, name: 'Cardano', symbol: 'ADA', price: 2.85, change: 5.7, marketCap: 92000000000, volume: 6700000000, logo: 'https://via.placeholder.com/32' },
  { id: 4, name: 'Solana', symbol: 'SOL', price: 158.64, change: 8.3, marketCap: 48000000000, volume: 5200000000, logo: 'https://via.placeholder.com/32' },
  { id: 5, name: 'Ripple', symbol: 'XRP', price: 1.12, change: -0.8, marketCap: 52000000000, volume: 3900000000, logo: 'https://via.placeholder.com/32' }
];

// 코인 목록 가져오기
export const fetchCoins = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_COINS });
    
    try {
      // 여기서는 목업 데이터 사용, 실제로는 API 호출
      setTimeout(() => {
        dispatch({
          type: FETCH_COINS_SUCCESS,
          payload: mockCoins
        });
      }, 500);
    } catch (err) {
      dispatch({
        type: FETCH_COINS_FAIL,
        payload: { error: '코인 목록을 불러오는 데 실패했습니다.' }
      });
    }
  };
};

// 단일 코인 정보 가져오기
export const fetchCoin = (symbol) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_COIN });
    
    try {
      // 여기서는 목업 데이터 사용, 실제로는 API 호출
      const coin = mockCoins.find(coin => coin.symbol === symbol.toUpperCase());
      
      setTimeout(() => {
        if (coin) {
          dispatch({
            type: FETCH_COIN_SUCCESS,
            payload: coin
          });
        } else {
          throw new Error('코인을 찾을 수 없습니다.');
        }
      }, 500);
    } catch (err) {
      dispatch({
        type: FETCH_COIN_FAIL,
        payload: { error: err.message || '코인 정보를 불러오는 데 실패했습니다.' }
      });
    }
  };
};
