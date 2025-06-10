import React from 'react';

const DefaultAvatar = ({ size = 150, username, className = "" }) => {
  // 사용자명의 첫 글자를 대문자로 변환
  const initial = username ? username.charAt(0).toUpperCase() : 'U';
  
  // 사용자명을 기반으로 색상 생성 (해시 함수 사용)
  const getColorFromUsername = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // HSL 색상으로 변환 (채도와 밝기 고정으로 보기 좋은 색상 생성)
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const backgroundColor = getColorFromUsername(username || 'default');

  return (
    <div
      className={`d-flex align-items-center justify-content-center rounded-circle ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: backgroundColor,
        color: 'white',
        fontSize: size * 0.4,
        fontWeight: 'bold',
        userSelect: 'none'
      }}
    >
      {initial}
    </div>
  );
};

export default DefaultAvatar;
