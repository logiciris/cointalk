import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import postService from '../services/postService';
import commentService from '../services/commentService';
import likeService from '../services/likeService';
import { getUser, isAuthenticated as checkAuth } from '../utils/auth';

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const currentUser = user || getUser(); // Redux에서 가져오거나 localStorage에서 가져오기
  const userAuthenticated = isAuthenticated || checkAuth(); // Redux 또는 localStorage 확인
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // 첨부파일 조회
  const fetchAttachedFiles = async (postId) => {
    try {
      setFilesLoading(true);
      const response = await fetch(`http://localhost:5000/api/files/post/${postId}`);
      const result = await response.json();
      
      if (result.success) {
        setAttachedFiles(result.files || []);
      }
    } catch (error) {
      console.error('첨부파일 조회 오류:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  // 파일 다운로드 (취약점: 경로 순회 공격 가능)
  const handleFileDownload = (filename) => {
    // 직접 다운로드 URL로 이동 (취약한 구현)
    const downloadUrl = `http://localhost:5000/api/files/download/${filename}`;
    window.open(downloadUrl, '_blank');
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postService.getPost(postId);
      
      if (result.success) {
        const postData = result.data;
        // like_count를 likes로 매핑
        postData.likes = postData.like_count || 0;
        
        setPost(postData);
        
        // 댓글은 별도 API로 조회
        await fetchComments(postId);
        
        // 첨부파일 조회
        fetchAttachedFiles(postId);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('게시물 조회 오류:', error);
      setError('게시물을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 목록 조회 함수 추가
  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/post/${postId}`);
      const result = await response.json();
      
      if (result.success) {
        // API 응답 구조에 맞게 수정: data.comments
        setComments(result.data?.comments || []);
        console.log('댓글 로드 완료:', result.data?.comments?.length || 0, '개');
      } else {
        console.error('댓글 조회 실패:', result.message);
        setComments([]);
      }
    } catch (error) {
      console.error('댓글 조회 오류:', error);
      setComments([]);
    }
  };

  // 좋아요 토글 처리
  const handleLikeToggle = async () => {
    if (!userAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (likeLoading) return;

    try {
      setLikeLoading(true);
      const result = await likeService.togglePostLike(post.id);
      if (result.success) {
        // likeService가 response.data를 data로 래핑하므로 result.data가 실제 API 응답
        const apiResponse = result.data;
        console.log('API 응답 구조:', apiResponse);
        
        setPost(prevPost => ({
          ...prevPost,
          likes: parseInt(apiResponse.likeCount) || 0,
          isLiked: apiResponse.isLiked,
          like_count: parseInt(apiResponse.likeCount) || 0  // 백엔드 필드와 동기화
        }));
        console.log('좋아요 상태 업데이트:', {
          likes: apiResponse.likeCount,
          isLiked: apiResponse.isLiked
        });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setLikeLoading(false);
    }
  };

  // 댓글 좋아요 토글
  const handleCommentLikeToggle = async (commentId) => {
    if (!userAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const result = await likeService.toggleCommentLike(commentId);
      if (result.success) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, like_count: result.data.likeCount, isLiked: result.data.isLiked }
              : comment
          )
        );
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Comment like toggle error:', error);
      alert('댓글 좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // 댓글 수정 시작
  const handleCommentEdit = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  // 댓글 수정 취소
  const handleCommentEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  // 댓글 수정 저장
  const handleCommentEditSave = async (commentId) => {
    if (!editingContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const result = await commentService.updateComment(commentId, editingContent.trim());
      
      if (result.success) {
        // 댓글 목록에서 해당 댓글 업데이트
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, content: editingContent.trim(), updated_at: new Date().toISOString() }
              : comment
          )
        );
        
        setEditingCommentId(null);
        setEditingContent('');
        alert('댓글이 수정되었습니다.');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Comment update error:', error);
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await commentService.deleteComment(commentId);
      
      if (result.success) {
        // 댓글 목록에서 해당 댓글 제거
        setComments(prevComments =>
          prevComments.filter(comment => comment.id !== commentId)
        );
        
        // 게시물의 댓글 수 업데이트
        setPost(prevPost => ({
          ...prevPost,
          comment_count: Math.max((prevPost.comment_count || 0) - 1, 0)
        }));
        
        alert('댓글이 삭제되었습니다.');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Comment delete error:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 게시물 수정 화면으로 이동
  const handleEdit = () => {
    // 현재는 EditPostPage가 없으므로 게시물 작성 페이지로 이동
    navigate(`/posts/create?edit=true&id=${post.id}`);
  };
  
  // 게시물 삭제
  const handleDelete = async () => {
    if (window.confirm('정말 이 게시물을 삭제하시겠습니까?')) {
      try {
        const result = await postService.deletePost(post.id);
        if (result.success) {
          alert('게시물이 삭제되었습니다.');
          navigate('/posts');
        } else {
          alert('삭제 실패: ' + (result.message || '알 수 없는 오류가 발생했습니다.'));
        }
      } catch (error) {
        console.error('게시물 삭제 오류:', error);
        alert('게시물 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    if (!userAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setCommentLoading(true);
      const result = await commentService.createComment(post.id, comment.trim());
      
      if (result.success) {
        // 새 댓글을 목록에 추가
        setComments(prevComments => [...prevComments, result.data]);
        setComment('');
        
        // 게시물의 댓글 수 업데이트
        setPost(prevPost => ({
          ...prevPost,
          comment_count: (prevPost.comment_count || 0) + 1
        }));
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Comment creation error:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">로딩 중...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-primary" onClick={() => window.history.back()}>
          돌아가기
        </Button>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">게시물을 찾을 수 없습니다.</Alert>
        <Button variant="outline-primary" onClick={() => window.history.back()}>
          돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <div 
              className="avatar me-3"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f7931a, #f2a54a)',
                color: 'white',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {post.username?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <Link to={`/profile/${post.username}`} className="text-decoration-none">
                <strong>{post.username}</strong>
              </Link>
              <div className="text-muted small">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <h2 className="mb-3" dangerouslySetInnerHTML={{ __html: post.title }}></h2>
          
          <div className="mb-3" dangerouslySetInnerHTML={{ __html: post.content }}></div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="mb-3">
              {post.tags.map(tag => (
                <span key={tag.id || tag} className="badge bg-light text-dark me-2">
                  #{tag.name || tag}
                </span>
              ))}
            </div>
          )}

          {post.coins && post.coins.length > 0 && (
            <div className="mb-3">
              {post.coins.map(coin => (
                <span key={coin.id || coin} className="badge bg-warning text-dark me-2">
                  ${coin.symbol || coin}
                </span>
              ))}
            </div>
          )}
          
          {/* 첨부파일 섹션 */}
          {attachedFiles.length > 0 && (
            <div className="mb-4">
              <h6 className="text-muted mb-3">
                <i className="bi bi-paperclip me-2"></i>
                첨부파일 ({attachedFiles.length}개)
              </h6>
              <div className="border rounded p-3 bg-light">
                {attachedFiles.map((file, index) => (
                  <div key={file.id || index} className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark me-2 text-primary"></i>
                      <div>
                        <div className="fw-medium">{file.original_name}</div>
                        <small className="text-muted">
                          {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''} 
                          {file.mime_type && ` • ${file.mime_type}`}
                          {file.downloads > 0 && ` • 다운로드: ${file.downloads}회`}
                        </small>
                      </div>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleFileDownload(file.stored_name)}
                    >
                      <i className="bi bi-download me-1"></i>
                      다운로드
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {filesLoading && (
            <div className="mb-4 text-center">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              첨부파일 로딩 중...
            </div>
          )}
          
          <div className="d-flex justify-content-between mb-4">
            <div className="d-flex align-items-center text-muted">
              <Button 
                variant={post.isLiked ? "danger" : "outline-primary"} 
                size="sm" 
                className="me-3"
                onClick={handleLikeToggle}
                disabled={!userAuthenticated || likeLoading}
              >
                <i className={`bi bi-heart${post.isLiked ? '-fill' : ''} me-1`}></i> 
                좋아요 {post.likes || 0}
              </Button>
              <span className="me-3">
                <i className="bi bi-chat me-1"></i> 댓글 {comments?.length || 0}
              </span>
              <span>
                <i className="bi bi-eye me-1"></i> 조회수 {post.views || 0}
              </span>
            </div>
            
            {/* 소유자인 경우 수정/삭제 버튼 표시 */}
            {userAuthenticated && currentUser && post.user_id === currentUser.id && (
              <div>
                <Button variant="outline-secondary" size="sm" className="me-2" onClick={handleEdit}>
                  <i className="bi bi-pencil me-1"></i> 수정
                </Button>
                <Button variant="outline-danger" size="sm" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i> 삭제
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
      
      <h4 className="mb-3">댓글 {comments?.length || 0}개</h4>
      
      {userAuthenticated && (
        <Card className="mb-4">
          <Card.Body>
            <form onSubmit={handleCommentSubmit}>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="댓글을 작성하세요..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                ></textarea>
              </div>
              <Button type="submit" variant="primary" disabled={commentLoading || !comment.trim()}>
                {commentLoading ? '작성 중...' : '댓글 작성'}
              </Button>
            </form>
          </Card.Body>
        </Card>
      )}
      
      {comments && comments.map(comment => (
        <Card key={comment.id} className="mb-3">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center">
                <div 
                  className="avatar me-3"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #6c757d, #adb5bd)',
                    color: 'white',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {comment.username?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link to={`/profile/${comment.username}`} className="text-decoration-none">
                    <strong>{comment.username}</strong>
                  </Link>
                  <div className="text-muted small">
                    {new Date(comment.created_at).toLocaleDateString()}
                    {comment.updated_at !== comment.created_at && (
                      <span className="ms-1">(수정됨)</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 댓글 수정/삭제 버튼 (작성자만 표시) */}
              {userAuthenticated && currentUser && comment.user_id === currentUser.id && (
                <div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-1 text-muted"
                    onClick={() => handleCommentEdit(comment.id, comment.content)}
                    disabled={editingCommentId === comment.id}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-1 text-muted ms-1"
                    onClick={() => handleCommentDelete(comment.id)}
                    disabled={editingCommentId === comment.id}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              )}
            </div>
            
            {/* 댓글 내용 또는 수정 폼 */}
            {editingCommentId === comment.id ? (
              <div className="mb-3">
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  placeholder="댓글을 수정하세요..."
                />
                <div>
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleCommentEditSave(comment.id)}
                    disabled={!editingContent.trim()}
                  >
                    저장
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleCommentEditCancel}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mb-3">{comment.content}</p>
            )}
            
            <div className="text-muted small">
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-muted"
                onClick={() => handleCommentLikeToggle(comment.id)}
                disabled={!userAuthenticated}
                style={{ textDecoration: 'none' }}
              >
                <i className={`bi bi-heart${comment.isLiked ? '-fill text-danger' : ''} me-1`}></i> 
                좋아요 {comment.like_count || 0}
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}

      {(!comments || comments.length === 0) && (
        <Alert variant="info">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</Alert>
      )}
    </Container>
  );
};

export default PostPage;