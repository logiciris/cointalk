import React, { useState, useRef } from 'react';
import { Card, Button, Alert, ProgressBar, ListGroup } from 'react-bootstrap';
import fileService from '../../services/fileService';

const FileUploader = ({ postId, onFilesUploaded, maxFiles = 5 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    // 파일 개수 제한
    if (files.length + fileArray.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 크기 체크 (50MB)
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`파일 크기는 50MB를 초과할 수 없습니다.`);
      return;
    }

    setError(null);
    setFiles([...files, ...fileArray]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    handleFileSelect(selectedFiles);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 파일 업로드 시뮬레이션을 위한 진행률 업데이트
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await fileService.uploadFiles(files, postId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setFiles([]);
        setUploadProgress(0);
        
        if (onFilesUploaded) {
          onFilesUploaded(result.data.files);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6 className="mb-0">📎 파일 첨부</h6>
      </Card.Header>
      <Card.Body>
        {/* 드래그 앤 드롭 영역 */}
        <div
          className={`border-2 border-dashed rounded p-4 text-center mb-3 ${
            dragOver ? 'border-primary bg-light' : 'border-secondary'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-muted">
            <i className="bi bi-cloud-upload fs-1"></i>
            <p className="mt-2 mb-1">파일을 드래그하거나 클릭하여 업로드</p>
            <small>최대 {maxFiles}개 파일, 각 파일당 최대 50MB</small>
          </div>
        </div>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* 선택된 파일 목록 */}
        {files.length > 0 && (
          <div className="mb-3">
            <h6>선택된 파일:</h6>
            <ListGroup>
              {files.map((file, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="me-2">{fileService.getFileIcon(file.name, file.type)}</span>
                    <span>{file.name}</span>
                    <small className="text-muted ms-2">({fileService.formatFileSize(file.size)})</small>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {/* 업로드 진행률 */}
        {uploading && (
          <div className="mb-3">
            <ProgressBar 
              now={uploadProgress} 
              label={`${uploadProgress}%`}
              animated 
            />
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* 업로드 버튼 */}
        <div className="d-flex justify-content-end">
          <Button
            variant="primary"
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                업로드 중...
              </>
            ) : (
              <>
                <i className="bi bi-upload me-2"></i>
                파일 업로드
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FileUploader;