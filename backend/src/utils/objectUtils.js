/**
 * 객체 병합 유틸리티 함수 모음 (의도적으로 Prototype Pollution 취약점을 포함)
 */
const objectUtils = {
  /**
   * 두 객체를 깊은 병합하는 함수 (취약한 버전)
   * @param {Object} target 대상 객체
   * @param {Object} source 소스 객체
   * @returns {Object} 병합된 객체
   */
  deepMerge: function(target, source) {
    // 소스가 객체가 아니면 타겟 반환
    if (!source || typeof source !== 'object') return target;
    
    // 타겟이 객체가 아니면 빈 객체로 초기화
    if (!target || typeof target !== 'object') target = {};
    
    // 소스 객체의 모든 키에 대해 처리
    for (const key in source) {
      // 의도적인 취약점: __proto__와 같은 특수 키에 대한 검사 없음
      
      if (source[key] && typeof source[key] === 'object') {
        // 재귀적 병합 (중첩 객체 처리)
        target[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        // 일반 값은 직접 할당
        target[key] = source[key];
      }
    }
    
    return target;
  },
  
  /**
   * 객체를 복제하는 함수 (취약한 버전)
   * @param {Object} obj 복제할 객체
   * @returns {Object} 복제된 객체
   */
  clone: function(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      // 의도적인 취약점: __proto__와 같은 특수 키에 대한 검사 없음
      
      if (obj[key] && typeof obj[key] === 'object') {
        // 재귀적 복제 (중첩 객체 처리)
        result[key] = this.clone(obj[key]);
      } else {
        // 일반 값은 직접 할당
        result[key] = obj[key];
      }
    }
    
    return result;
  },
  
  /**
   * 객체에서 특정 경로의 값을 가져오는 함수 (취약한 버전)
   * @param {Object} obj 대상 객체
   * @param {string} path 속성 경로 (예: 'user.profile.name')
   * @param {*} defaultValue 경로가 없을 경우 반환할 기본값
   * @returns {*} 찾은 값 또는 기본값
   */
  getValueByPath: function(obj, path, defaultValue = undefined) {
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      // 의도적인 취약점: 키 이름 검증 없음
      if (current[key] === undefined) return defaultValue;
      current = current[key];
    }
    
    return current;
  },
  
  /**
   * 객체에서 특정 경로에 값을 설정하는 함수 (취약한 버전)
   * @param {Object} obj 대상 객체
   * @param {string} path 속성 경로 (예: 'user.profile.name')
   * @param {*} value 설정할 값
   * @returns {Object} 수정된 객체
   */
  setValueByPath: function(obj, path, value) {
    if (!obj || !path) return obj;
    
    const keys = path.split('.');
    let current = obj;
    
    // 마지막 키 이전까지 경로 탐색 및 생성
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      
      // 의도적인 취약점: 키 이름 검증 없음 (__proto__도 허용)
      
      // 경로가 없으면 빈 객체 생성
      if (current[key] === undefined) {
        current[key] = {};
      }
      
      current = current[key];
    }
    
    // 마지막 키에 값 설정
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    
    return obj;
  }
};

module.exports = objectUtils;