import {
  FETCH_COINS,
  FETCH_COINS_SUCCESS,
  FETCH_COINS_FAIL,
  FETCH_COIN,
  FETCH_COIN_SUCCESS,
  FETCH_COIN_FAIL
} from '../actions/coinActions';

const initialState = {
  coins: [],
  coin: null,
  loading: false,
  error: null
};

const coinReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FETCH_COINS:
    case FETCH_COIN:
      return {
        ...state,
        loading: true
      };
    case FETCH_COINS_SUCCESS:
      return {
        ...state,
        coins: payload,
        loading: false,
        error: null
      };
    case FETCH_COIN_SUCCESS:
      return {
        ...state,
        coin: payload,
        loading: false,
        error: null
      };
    case FETCH_COINS_FAIL:
    case FETCH_COIN_FAIL:
      return {
        ...state,
        loading: false,
        error: payload.error
      };
    default:
      return state;
  }
};

export default coinReducer;
