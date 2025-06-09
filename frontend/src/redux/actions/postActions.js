// 게시물 관련 액션 타입
export const FETCH_POSTS = 'FETCH_POSTS';
export const FETCH_POSTS_SUCCESS = 'FETCH_POSTS_SUCCESS';
export const FETCH_POSTS_FAIL = 'FETCH_POSTS_FAIL';
export const FETCH_POST = 'FETCH_POST';
export const FETCH_POST_SUCCESS = 'FETCH_POST_SUCCESS';
export const FETCH_POST_FAIL = 'FETCH_POST_FAIL';
export const CREATE_POST = 'CREATE_POST';
export const CREATE_POST_SUCCESS = 'CREATE_POST_SUCCESS';
export const CREATE_POST_FAIL = 'CREATE_POST_FAIL';

// 임시 게시물 데이터
const mockPosts = [
  {
    id: 1,
    author: {
      id: 101,
      username: 'bitcoinenthusiast',
      avatar: 'https://via.placeholder.com/32'
    },
    title: '비트코인 상승세, 올해 말 새로운 고점 찍을까?',
    content: '최근 비트코인 가격이 지속적인 상승세를 보이고 있습니다. 이번 상승세는 기관 투자자들의 관심 증가와 규제 환경 개선으로 인한 것으로 보입니다. 연말까지 새로운 역사적 고점을 기록할 수 있을까요?',
    date: '2025-05-15',
    tags: ['시세분석', '비트코인', '예측'],
    relatedCoins: ['BTC'],
    likes: 42,
    comments: 15,
    views: 230
  },
  {
    id: 2,
    author: {
      id: 102,
      username: 'cryptotrader',
      avatar: 'https://via.placeholder.com/32'
    },
    title: '이더리움 2.0 업그레이드가 가져올 변화',
    content: '이더리움 2.0 업그레이드가 드디어 완료되었습니다. 지분 증명 방식으로의 전환은 네트워크의 효율성과 확장성을 크게 개선할 것으로 기대됩니다. 이로 인해 DeFi 생태계와 NFT 시장에는 어떤 변화가 생길까요?',
    date: '2025-05-14',
    tags: ['이더리움', '업그레이드', 'PoS'],
    relatedCoins: ['ETH'],
    likes: 37,
    comments: 23,
    views: 185
  },
  {
    id: 3,
    author: {
      id: 103,
      username: 'defimaster',
      avatar: 'https://via.placeholder.com/32'
    },
    title: '탈중앙화 금융(DeFi)의 미래와 도전 과제',
    content: '탈중앙화 금융(DeFi)은 전통적인 금융 시스템을 크게 변화시킬 잠재력을 가지고 있습니다. 그러나 확장성 문제, 보안 취약점, 규제 불확실성과 같은 여러 도전 과제가 있습니다. DeFi가 이러한 문제를 어떻게 해결할 수 있을까요?',
    date: '2025-05-13',
    tags: ['DeFi', '금융', '블록체인'],
    relatedCoins: ['ETH', 'AAVE', 'UNI'],
    likes: 29,
    comments: 18,
    views: 142
  }
];

// 게시물 목록 가져오기
export const fetchPosts = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_POSTS });
    
    try {
      // 여기서는 목업 데이터 사용, 실제로는 API 호출
      setTimeout(() => {
        dispatch({
          type: FETCH_POSTS_SUCCESS,
          payload: mockPosts
        });
      }, 500);
    } catch (err) {
      dispatch({
        type: FETCH_POSTS_FAIL,
        payload: { error: '게시물을 불러오는 데 실패했습니다.' }
      });
    }
  };
};

// 단일 게시물 가져오기
export const fetchPost = (id) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_POST });
    
    try {
      // 여기서는 목업 데이터 사용, 실제로는 API 호출
      const post = mockPosts.find(post => post.id === parseInt(id));
      
      setTimeout(() => {
        if (post) {
          dispatch({
            type: FETCH_POST_SUCCESS,
            payload: post
          });
        } else {
          throw new Error('게시물을 찾을 수 없습니다.');
        }
      }, 500);
    } catch (err) {
      dispatch({
        type: FETCH_POST_FAIL,
        payload: { error: err.message || '게시물을 불러오는 데 실패했습니다.' }
      });
    }
  };
};

// 게시물 작성
export const createPost = (postData) => {
  return async (dispatch) => {
    dispatch({ type: CREATE_POST });
    
    try {
      // 여기서는 목업 구현, 실제로는 API 호출
      const newPost = {
        id: mockPosts.length + 1,
        ...postData,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        comments: 0,
        views: 0
      };
      
      setTimeout(() => {
        dispatch({
          type: CREATE_POST_SUCCESS,
          payload: newPost
        });
      }, 500);
    } catch (err) {
      dispatch({
        type: CREATE_POST_FAIL,
        payload: { error: '게시물 작성에 실패했습니다.' }
      });
    }
  };
};
