# 카카오맵 Web SDK 설정 가이드

## 1. 카카오 개발자 계정 & API 키 발급

### 1.1 카카오 개발자 사이트 접속
- https://developers.kakao.com/ 접속
- 카카오 계정으로 로그인

### 1.2 애플리케이션 추가
1. "내 애플리케이션" 메뉴 선택
2. "애플리케이션 추가하기" 클릭
3. 앱 이름: `장인과하루` (또는 원하는 이름)
4. 사업자명: 개인 or 팀명 입력

### 1.3 JavaScript 키 확인
1. 생성된 앱 선택
2. "앱 키" 탭에서 **JavaScript 키** 복사
   - 형식: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (32자리)

### 1.4 플랫폼 등록
1. "플랫폼" 탭 선택
2. "Web 플랫폼 등록" 클릭
3. 사이트 도메인 등록:
   ```
   http://localhost:8081
   http://localhost:19006
   ```
   - Expo 개발 서버 포트는 기본적으로 19000-19006 사용
   - 배포 시 실제 도메인도 추가 필요

---

## 2. 프로젝트에 API 키 적용

### 2.1 .env 파일 수정
`frontend/.env` 파일을 열고 발급받은 JavaScript 키를 입력:

```bash
EXPO_PUBLIC_KAKAO_MAP_API_KEY=여기에_발급받은_JavaScript_키_붙여넣기
```

**예시:**
```bash
EXPO_PUBLIC_KAKAO_MAP_API_KEY=abc123def456ghi789jkl012mno345pq
```

### 2.2 개발 서버 재시작
```bash
# 기존 서버 종료 (Ctrl+C)
npx expo start --clear
```

---

## 3. 테스트 방법

### 3.1 지도가 표시되는 화면
1. **체험 상세 화면** (DetailBottomSheet)
   - 홈 → 체험 카드 클릭 → 하단 시트에서 "위치 안내" 섹션 확인

2. **장인 상세 화면** (ArtisanDetailScreen)
   - 홈 → "오늘의 장인" or "내 주변 장인" 클릭 → 하단 "위치" 섹션 확인

### 3.2 정상 작동 확인 사항
- ✅ 지도에 마커가 표시됨
- ✅ 지도 하단에 주소 정보 표시
- ✅ 지도 확대/축소/드래그 가능

### 3.3 문제 해결
만약 지도가 로드되지 않고 회색 박스만 보인다면:

1. **API 키 확인**
   ```bash
   # .env 파일 확인
   cat frontend/.env | grep KAKAO
   ```

2. **플랫폼 도메인 확인**
   - Expo 개발 서버 URL 확인: 터미널에 표시된 주소
   - 카카오 개발자 콘솔에서 해당 도메인이 등록되어 있는지 확인

3. **브라우저 콘솔 확인** (웹 테스트 시)
   - F12 → Console 탭
   - 빨간 에러 메시지 확인

4. **개발 서버 재시작**
   ```bash
   npx expo start --clear
   ```

---

## 4. 배포 시 추가 작업

### 4.1 프로덕션 도메인 등록
1. 카카오 개발자 콘솔 → 플랫폼 탭
2. 실제 배포 도메인 추가:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

### 4.2 사용량 모니터링
- 카카오맵 API는 **무료** (일 300,000건 제한)
- "통계" 탭에서 일일 사용량 확인 가능

---

## 5. 구현된 기능

### KakaoMapView 컴포넌트
- 위치: `frontend/src/components/KakaoMapView.tsx`
- Props:
  ```tsx
  interface KakaoMapViewProps {
    latitude: number;      // 위도
    longitude: number;     // 경도
    address?: string;      // 주소 (선택)
    height?: number;       // 높이 (기본 160)
    markerTitle?: string;  // 마커 타이틀 (선택)
  }
  ```

### 사용 예시
```tsx
import { KakaoMapView } from "@/components/KakaoMapView";

<KakaoMapView
  latitude={37.5665}
  longitude={126.9780}
  address="서울특별시 중구 세종대로 110"
  height={200}
  markerTitle="체험 장소"
/>
```

---

## 6. 참고 자료

- [카카오맵 Web SDK 공식 문서](https://apis.map.kakao.com/web/)
- [카카오 개발자 센터](https://developers.kakao.com/)
- [Expo WebView 문서](https://docs.expo.dev/versions/latest/sdk/webview/)

---

## 문제 해결 체크리스트

- [ ] 카카오 개발자 계정 생성 완료
- [ ] JavaScript API 키 발급 완료
- [ ] 플랫폼 도메인 등록 완료 (localhost:8081, localhost:19006)
- [ ] .env 파일에 API 키 입력 완료
- [ ] 개발 서버 재시작 완료
- [ ] 지도 정상 표시 확인
