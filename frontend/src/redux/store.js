import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './reducers/authReducer';
import postReducer from './reducers/postReducer';
import coinReducer from './reducers/coinReducer';
import i18nReducer from './reducers/i18nReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  posts: postReducer,
  coins: coinReducer,
  i18n: i18nReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
