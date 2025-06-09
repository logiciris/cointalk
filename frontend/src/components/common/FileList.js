import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import fileService from '../../services/fileService';
import { getUser } from '../../utils/auth';

const FileList = ({ postId, files: initialFiles, onFileDeleted }) => {
  const [files, setFiles] = useState(initialFiles || []);
  const [loading, setLoading] = useState(!initialFiles);
  
  const { user } = useSelector(state => state.auth);
  const currentUser = user || getUser();

  useEffect(() => {
    if (!initialFiles && postId) {
      loadFiles();
    }
  }, [postId, initialFiles]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await fileService.getPostFiles(postId);
      
      if (result.success) {
        setFiles(result.data);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filename) => {
    const downloadUrl = fileService.getDownloadUrl(filename);
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('정말 이 파일을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await fileService.deleteFile(fileId);
      
      if (result.success) {
        setFiles(files.filter(file => file.id !== fileId));
        
        if (onFileDeleted) {
          onFileDeleted(fileId);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('File delete error:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          파일 목록 로딩 중...
        </Card.Body>
      </Card>
    );
  }

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6 className="mb-0">
          📎 첨부파일 
          <Badge bg="secondary" className="ms-2">{files.length}</Badge>
        </h6>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {files.map((file) => (
            <ListGroup.Item key={file.id} className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <span className="me-2 fs-4">
                  {fileService.getFileIcon(file.original_name, file.mime_type)}
                </span>
                <div>
                  <div className="fw-medium">{file.original_name}</div>
                  <div className="text-muted small">
                    {fileService.formatFileSize(file.file_size)}
                    {file.downloads > 0 && (
                      <span className="ms-2">
                        <i className="bi bi-download me-1"></i>
                        {file.downloads}회 다운로드
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleDownload(file.stored_name)}
                >
                  <i className="bi bi-download me-1"></i>
                  다운로드
                </Button>
                
                {/* 파일 삭제 버튼 (작성자만 표시) */}
                {currentUser && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default FileList;