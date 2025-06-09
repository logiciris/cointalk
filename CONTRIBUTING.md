# CoinTalk 기여 가이드

CoinTalk 프로젝트에 관심을 가져주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 설명합니다.

## 🤝 기여 방법

### 1. 이슈 리포트
- 버그를 발견하셨나요? [GitHub Issues](https://github.com/yourusername/cointalk/issues)에서 새 이슈를 생성해주세요.
- 기능 요청이 있으시면 동일한 방법으로 제안해주세요.

### 2. 코드 기여

#### 사전 준비
1. 이 저장소를 포크합니다
2. 로컬에 클론합니다
```bash
git clone https://github.com/yourusername/cointalk.git
cd cointalk
```

#### 개발 환경 설정
1. Docker 환경으로 개발하는 것을 권장합니다
```bash
docker-compose up -d
```

2. 또는 로컬 환경에서 개발할 경우:
```bash
# 프론트엔드
cd frontend && npm install

# 백엔드  
cd backend && npm install
```

#### 브랜치 전략
- `main` 브랜치는 안정적인 릴리스 버전입니다
- 새로운 기능은 `feature/기능명` 브랜치에서 개발합니다
- 버그 수정은 `bugfix/버그명` 브랜치에서 작업합니다

```bash
git checkout -b feature/amazing-feature
```

#### 코딩 컨벤션

**JavaScript/React**
- ES6+ 문법을 사용합니다
- 함수형 컴포넌트와 React Hooks를 우선 사용합니다
- 2칸 스페이스 들여쓰기를 사용합니다
- 세미콜론을 생략하지 않습니다

**CSS**
- Bootstrap 클래스를 우선 사용합니다
- 커스텀 CSS는 모듈화합니다
- 클래스명은 kebab-case를 사용합니다

**API**
- RESTful API 설계 원칙을 따릅니다
- 응답 형식을 일관성 있게 유지합니다
- 적절한 HTTP 상태 코드를 사용합니다

#### 커밋 메시지
커밋 메시지는 다음 형식을 따릅니다:

```
타입(스코프): 간단한 설명

상세 설명 (선택사항)

관련 이슈: #123
```

**타입:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드 과정 또는 도구 변경

**예시:**
```
feat(auth): 2차 인증 기능 추가

Google Authenticator를 이용한 2차 인증 시스템을 구현했습니다.
- TOTP 알고리즘 지원
- QR 코드 생성
- 백업 코드 제공

관련 이슈: #45
```

#### Pull Request 제출
1. 변경사항을 커밋하고 푸시합니다
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/amazing-feature
```

2. GitHub에서 Pull Request를 생성합니다
3. PR 템플릿에 따라 설명을 작성합니다
4. 코드 리뷰를 기다립니다

## 📋 PR 체크리스트

PR을 제출하기 전에 다음 사항을 확인해주세요:

- [ ] 코드가 프로젝트 스타일 가이드를 따릅니다
- [ ] 새로운 기능에 대한 테스트를 작성했습니다
- [ ] 기존 테스트가 모두 통과합니다
- [ ] 문서를 업데이트했습니다 (필요한 경우)
- [ ] 커밋 메시지가 컨벤션을 따릅니다

## 🧪 테스트

새로운 기능을 추가하거나 버그를 수정할 때는 적절한 테스트를 작성해주세요.

```bash
# 프론트엔드 테스트
cd frontend && npm test

# 백엔드 테스트  
cd backend && npm test
```

## 📚 문서화

코드 변경사항이 사용자에게 영향을 미치는 경우 다음 문서를 업데이트해주세요:

- README.md
- API 문서
- 사용자 가이드

## ❓ 질문이 있으신가요?

- [GitHub Discussions](https://github.com/yourusername/cointalk/discussions)에서 질문하세요
- [Issues](https://github.com/yourusername/cointalk/issues)에서 버그를 리포트하세요

## 🙏 감사합니다

여러분의 기여가 CoinTalk을 더 나은 플랫폼으로 만들어갑니다. 모든 기여자분들께 진심으로 감사드립니다!
