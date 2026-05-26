# 장인과 하루 Frontend

Expo + React Native 기반 앱 골격입니다. 메인 화면은 AI 검색, 추천 장인 체험, 내 주변 장인 지도, 인기 체험, 한물결 카드뉴스를 중심으로 구성합니다.

기획서 v4 기준 앱은 Spring Boot 메인 API(`../backend`)만 호출합니다. FastAPI AI 서버(`../backend_python`)는 Spring 내부 연동 대상이며 프론트엔드에 주소나 인증 계약을 노출하지 않습니다.

## Version

- App version: `0.1.0`
- Expo SDK: `51`
- React Native: `0.74.5`
- App status: 초기 스캐폴드

## Stack

- Expo, React Native, TypeScript
- NativeWind
- React Navigation
- TanStack Query
- Expo AuthSession, Expo Push Notifications
- React Native Maps + Kakao Map SDK 연동 예정
- Toss Payments React Native SDK 연동 예정

## Local Setup

```bash
npm install
npm run start
```

## Docker 사용 여부

프론트엔드는 초기 개발 단계에서 Docker를 사용하지 않습니다.

이유:

- Expo 개발 서버는 로컬 기기, Expo Go, iOS/Android 시뮬레이터와 네트워크 연결이 필요합니다.
- EAS Build, 푸시 알림, AuthSession, 딥링크 테스트는 로컬 Expo 환경이 더 단순합니다.
- 프론트엔드가 필요한 서버 의존성은 백엔드의 Docker Compose가 제공합니다.

## 프로젝트 초기 설정

### 1. 패키지 설치

```bash
npm install
```

### 2. API 주소 설정

로컬 외부 API 기본 주소는 Spring Boot의 `http://localhost:8080/api`입니다.

필요하면 `.env.local`을 만들고 아래 값을 지정합니다.

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

실기기 Expo Go에서 백엔드에 접속할 때는 `localhost` 대신 Mac의 로컬 네트워크 IP를 사용해야 합니다.

예:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8080/api
```

### 3. Expo 실행

```bash
npm run start
```

이후 Expo Go, iOS Simulator, Android Emulator 중 하나로 실행합니다.

### 4. 개발 흐름

1. 홈/카드뉴스/체험 상세/예약 화면을 mock 데이터로 먼저 구현합니다.
2. Spring API 응답 형태가 확정되면 `src/services/api.ts`를 통해 연결합니다.
3. 다국어 문구는 화면에 하드코딩하지 않고 i18n 구조로 분리합니다.
4. 예약, 결제, 푸시 알림은 백엔드 상태값과 함께 맞춰 구현합니다.

세부 구현 항목과 2026-06-28 완료 일정은 [TODO.md](./TODO.md)를 기준으로 진행합니다.
