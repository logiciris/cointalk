// 사용자 메뉴 권한 확인 API
router.get('/menu-permissions', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    // 빈 객체로 시작해서 Prototype 오염 영향 받도록
    const userInfo = {};
    userInfo.id = user.id;
    userInfo.username = user.username;
    userInfo.role = user.role;
    
    // Prototype 오염 확인
    console.log('메뉴 권한 확인 - userInfo.isAdmin:', userInfo.isAdmin);
    console.log('메뉴 권한 확인 - req.user.isAdmin:', req.user.isAdmin);
    
    // 관리자 권한 체크 (role 또는 prototype pollution으로 추가된 isAdmin)
    const hasAdminAccess = userInfo.role === 'admin' || userInfo.isAdmin || req.user.isAdmin;
    
    // 메뉴 구성
    const menus = [
      { name: '내 프로필', path: `/profile/${user.username}`, icon: 'bi-person' },
      { name: '설정', path: '/settings', icon: 'bi-gear' },
      { name: '저장됨', path: '/saved', icon: 'bi-bookmark' }
    ];
    
    // 관리자 권한이 있으면 관리자 메뉴 추가
    if (hasAdminAccess) {
      menus.splice(-1, 0, { 
        name: '관리자 패널', 
        path: '/admin', 
        icon: 'bi-shield-check',
        isAdmin: true 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      hasAdminAccess,
      menus
    });
  } catch (err) {
    console.error('메뉴 권한 확인 오류:', err);
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;