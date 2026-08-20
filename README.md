# Novelpia API Client

Novelpia 소설 플랫폼의 API를 TypeScript로 쉽게 사용할 수 있는 클라이언트 라이브러리입니다.

## 설치

```bash
npm install novelpia-sdk
# or
pnpm add novelpia-sdk
```

> [!NOTE]
> 기존 `novelpia` 패키지로 설치하더라도 `novelpia-sdk`와 동일하게 호환됩니다. 최신 기능 및 업데이트를 위해 `novelpia-sdk` 사용을 권장합니다.


## 빠른 시작

### 기본 사용법

```typescript
import { NovelPiaClient } from "novelpia-sdk"

// 클라이언트 초기화
const client = new NovelPiaClient()

// 소설 검색
const results = await client.search({
    search_val: "판타지",
    rows: 20,
})

console.log(`총 ${results.total_cnt}개의 소설 발견`)
results.list.forEach((novel) => {
    console.log(`- ${novel.novel_name} by ${novel.writer_nick}`)
})
```

## 사용 예제

### 소설 검색하기

```typescript
const client = new NovelPiaClient()

// 기본 검색
const basicSearch = await client.search({
    search_val: "안녕",
})

// 상세 검색
const advancedSearch = await client.search({
    search_val: "판타지",
    page: 1,
    rows: 50,
    sort_col: "count_view", // 조회수 순
    novel_genre: "하렘",
    is_complete: 0, // 연재중인 작품만
    is_challenge: 0,
})

// 결과 처리
console.log(`찾은 소설: ${advancedSearch.total_cnt}개`)
advancedSearch.list.forEach((novel) => {
    console.log({
        id: novel.novel_no,
        title: novel.novel_name,
        author: novel.writer_nick,
        views: novel.count_view,
        likes: novel.count_good,
        genres: novel.novel_genre_arr,
        story: novel.novel_story,
        lastUpdate: novel.last_write_date,
    })
})
```

### 큐레이션 조회하기

```typescript
const client = new NovelPiaClient()

// 밀리언 노벨 큐레이션
const curation = await client.getCuration({
    main_group: 59,
    rows: 100,
})

console.log(`큐레이션: ${curation.conf.title}`)
console.log(`${curation.conf.sub_title}`)

curation.list.forEach((novel) => {
    console.log({
        title: novel.novel_name,
        author: novel.writer_nick,
        genres: novel.novel_genre,
        link: novel.link_url,
    })
})
```

### 페이지네이션

```typescript
const client = new NovelPiaClient()

// 1페이지 (20개씩)
const page1 = await client.search({
    search_val: "소설",
    page: 1,
    rows: 20,
})

// 2페이지
const page2 = await client.search({
    search_val: "소설",
    page: 2,
    rows: 20,
})

console.log(`전체: ${page1.total_cnt}개`)
console.log(`필터된: ${page1.block_cnt}개 제외됨`)
```

### 에러 처리

```typescript
const client = new NovelPiaClient()

try {
    const results = await client.search({
        search_val: "판타지",
    })
    console.log(`찾은 소설: ${results.list.length}개`)
} catch (error) {
    console.error("API 요청 실패:", error.message)
}
```

### 커스텀 API URL 사용

```typescript
// 다른 주소의 API 서버 사용
const customClient = new NovelPiaClient("https://custom.api.com/proc")

const results = await customClient.search({
    search_val: "소설",
})
```

## 검색 파라미터

### SearchParams

```typescript
interface SearchParams {
    page?: number // 페이지 번호 (기본: 1)
    rows?: number // 행 개수 (기본: 20)
    search_type?: string // 검색 타입 (기본: 'all')
    search_val?: string // 검색어
    novel_type?: string // 소설 타입
    novel_genre?: string // 장르
    sort_col?: "last_viewdate" | "count_view" | "count_good" // 정렬
    is_complete?: 0 | 1 // 완결 여부
    is_challenge?: 0 | 1 // 챌린지 여부
}
```

### CurationParams

```typescript
interface CurationParams {
    main_group: number // 그룹 ID
    rows?: number // 행 개수 (기본: 100)
    prev_million_flag?: boolean // 이전 밀리언 플래그
}
```

## 응답 타입

### 소설 정보 (NovelSearch)

```typescript
{
    novel_no: number                 // 소설 번호
    novel_name: string              // 소설 제목
    writer_nick: string             // 작가 닉네임
    novel_story: string             // 소설 설명
    count_view: number              // 조회수
    count_good: number              // 추천수
    count_book: number              // 북마크 수
    novel_genre_arr: string[]       // 장르 배열
    cover_url: string               // 커버 이미지 URL
    last_write_date: string         // 마지막 업데이트 날짜
    is_complete: number             // 완결 여부
    // ... 기타 필드
}
```

### 검색 응답 (NovelSearchResponse)

```typescript
{
    status: number                  // HTTP 상태 코드
    list: NovelSearch[]            // 소설 목록
    total_cnt: number              // 전체 개수
    block_cnt: number              // 차단된 개수
    block_adult_cnt: number        // 성인 차단 개수
}
```

## 테스트

```bash
# 테스트 실행
pnpm test

# 커버리지 확인
pnpm test -- --coverage
```

## 빌드

```bash
# TypeScript 컴파일
pnpm build

# 결과는 dist/ 디렉토리에 생성됨
```

## 타입 지원

완벽한 TypeScript 지원과 자동 완성을 제공합니다:

```typescript
import { NovelPiaClient, type NovelSearchResponse } from "novelpia-sdk"

const client = new NovelPiaClient()
const result: NovelSearchResponse = await client.search({
    search_val: "판타지",
})
```

## 라이선스

MIT
