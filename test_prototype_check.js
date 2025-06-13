// Prototype 오염 상태 확인
console.log('Object.prototype.isAdmin:', Object.prototype.isAdmin);
console.log('빈 객체의 isAdmin:', {}.isAdmin);

// 새 객체 테스트
const testObj = {};
console.log('새 객체의 isAdmin:', testObj.isAdmin);

// req.user 시뮬레이션
const mockUser = { id: 1, role: 'user' };
console.log('mockUser.isAdmin:', mockUser.isAdmin);
