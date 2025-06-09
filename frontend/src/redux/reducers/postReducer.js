import {
  FETCH_POSTS,
  FETCH_POSTS_SUCCESS,
  FETCH_POSTS_FAIL,
  FETCH_POST,
  FETCH_POST_SUCCESS,
  FETCH_POST_FAIL,
  CREATE_POST,
  CREATE_POST_SUCCESS,
  CREATE_POST_FAIL
} from '../actions/postActions';

const initialState = {
  posts: [],
  post: null,
  loading: false,
  error: null
};

const postReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FETCH_POSTS:
    case FETCH_POST:
    case CREATE_POST:
      return {
        ...state,
        loading: true
      };
    case FETCH_POSTS_SUCCESS:
      return {
        ...state,
        posts: payload,
        loading: false,
        error: null
      };
    case FETCH_POST_SUCCESS:
      return {
        ...state,
        post: payload,
        loading: false,
        error: null
      };
    case CREATE_POST_SUCCESS:
      return {
        ...state,
        posts: [payload, ...state.posts],
        post: payload,
        loading: false,
        error: null
      };
    case FETCH_POSTS_FAIL:
    case FETCH_POST_FAIL:
    case CREATE_POST_FAIL:
      return {
        ...state,
        loading: false,
        error: payload.error
      };
    default:
      return state;
  }
};

export default postReducer;
