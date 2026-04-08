# 예제 실행 가이드

Novelpia API 클라이언트 사용 예제들입니다.

## 준비

예제를 실행하기 전에 의존성을 설치하세요:

```bash
pnpm install
```

## 예제 목록

### 기본 검색 (`01-basic-search.ts`)

가장 간단한 검색 예제입니다.

```bash
pnpm tsx examples/01-basic-search.ts
```

**출력:**

```
📚 "판타지" 검색 중...

✅ 검색 완료!
📊 전체: 5000개, 필터됨: 3개

1. 이세계 멸망 갤러리
   작가: 안녕검
   조회: 17,273,944 | 추천: 1,259,120
   장르: 판타지, 중세, 일상
   업데이트: 2026-04-07 18:30:00
```

### 고급 검색 (`02-advanced-search.ts`)

정렬 및 필터링을 사용한 검색 예제입니다.

```bash
pnpm tsx examples/02-advanced-search.ts
```

**주요 기능:**

- 조회수순 정렬
- 추천순 정렬
- 최근 업데이트순 정렬

### PD픽 조회 (`03-pd-picks.ts`)

편집자들이 엄선한 PD픽(편집자 픽) 조회 예제입니다.

```bash
pnpm tsx examples/03-pd-picks.ts
```

**주요 기능:**

- PD픽 조회 (`target: "pd-picks"`)
- 편집자 추천 작품 표시

```
📌 PD픽 (편집자 픽)
============================================================

 1. 소설 제목
    작가: 작가명
    장르: 판타지, 전생
```

### 밀리언 노벨 조회 (`04-million-novel.ts`)

100만 조회를 달성한 독자들이 선택한 명작 조회 예제입니다.

```bash
pnpm tsx examples/04-million-novel.ts
```

**주요 기능:**

- 밀리언 노벨 조회 (`target: "million"`)
- 100만 조회 달성 작품 표시

```
 밀리언 노벨 (Million Novel)
============================================================

 1. 명작 소설 제목
    작가: 작가명
    장르: 로맨스, 실연
```

### 페이지네이션 (`05-pagination.ts`)

대량의 검색 결과를 페이지 단위로 조회하는 예제입니다.

```bash
pnpm tsx examples/05-pagination.ts
```

**특징:**

- 여러 페이지 조회
- 페이지 수 계산
- 마지막 페이지 처리

### 에러 처리 (`06-error-handling.ts`)

안전한 에러 처리와 타입 검증 예제입니다.

```bash
pnpm tsx examples/06-error-handling.ts
```

**주요 내용:**

- try-catch 에러 처리
- 응답 상태 확인
- 결과 검증
- 필드 존재 확인

## 의존성 설치

`tsx`를 사용하여 TypeScript를 직접 실행할 수 있습니다:

```bash
# 이미 설치됨 (devDependencies)
pnpm install
```

## 실제 프로젝트에서 사용하기

### TypeScript 프로젝트

```typescript
import { NovelPiaClient } from "novelpia"

const client = new NovelPiaClient()
const result = await client.search({ search_val: "판타지" })
```

### JavaScript (ES6+) 프로젝트

```javascript
const { NovelPiaClient } = require("novelpia")

const client = new NovelPiaClient()
const result = await client.search({ search_val: "판타지" })
```

### 비동기 함수 사용

```typescript
async function searchNovels() {
    const client = new NovelPiaClient()

    try {
        const result = await client.search({
            search_val: "하렘",
            rows: 20,
            sort_col: "count_view",
        })

        console.log(`찾은 소설: ${result.list.length}개`)
        result.list.forEach((novel) => {
            console.log(`- ${novel.novel_name} (${novel.writer_nick})`)
        })
    } catch (error) {
        console.error("검색 실패:", error)
    }
}

searchNovels()
```

## 타입스크립트 지원

모든 API는 완벽한 타입 지원을 제공합니다:

```typescript
import {
    NovelPiaClient,
    type NovelSearchResponse,
    type SearchParams,
} from "novelpia"

const client = new NovelPiaClient()

// 검색 파라미터 타입 체크
const params: SearchParams = {
    search_val: "판타지",
    rows: 20,
    sort_col: "count_view", // 자동 완성이 지원됨
}

// 응답 타입 체크
const response: NovelSearchResponse = await client.search(params)
```

## 팁 & 트릭

### 1. 최고 조회수 소설 찾기

```typescript
const topNovels = await client.search({
    search_val: "",
    rows: 100,
    sort_col: "count_view",
})
```

### 2. 특정 장르의 신작 찾기

```typescript
const newFantasy = await client.search({
    search_val: "판타지",
    rows: 50,
    sort_col: "last_viewdate", // 최근 업데이트
    is_complete: 0, // 연재중인 소설만
})
```

### 3. 여러 검색 결과 합치기

```typescript
const results = await Promise.all([
    client.search({ search_val: "판타지" }),
    client.search({ search_val: "로맨스" }),
    client.search({ search_val: "일상" }),
])
```

### 4. 페이지 전체 순회

```typescript
async function getAllNovels(keyword: string) {
    const allNovels = []
    let page = 1

    while (true) {
        const result = await client.search({
            search_val: keyword,
            page,
            rows: 50,
        })

        if (result.list.length === 0) break

        allNovels.push(...result.list)
        page++
    }

    return allNovels
}
```

## 문제 해결

### API 응답이 없다면

- 인터넷 연결 확인
- Novelpia 서버 상태 확인
- 검색어 확인

### 타입 에러가 발생한다면

- TypeScript 버전 업데이트: `pnpm upgrade typescript`
- tsconfig.json의 strict 모드 확인

### 성능 개선

대량의 검색 결과가 필요하면:

- rows 파라미터를 100으로 설정 (최대값)
- 서버 부하를 고려하여 요청 간격 추가

```typescript
// 1초 간격으로 요청
for (let page = 1; page <= 10; page++) {
    const result = await client.search({
        search_val: "소설",
        page,
        rows: 100,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
}
```

## 더 알아보기

- [메인 README](../README.md) - 전체 문서
- [API 문서](../README.md#-응답-타입) - 응답 구조
- [테스트](../test) - 추가 예제

---

**Happy coding! **
