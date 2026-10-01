# novelpia-sdk

> 노벨피아(Novelpia) 비공식 고성능 TypeScript API 클라이언트

[![npm version](https://img.shields.io/npm/v/novelpia-sdk.svg)](https://www.npmjs.com/package/novelpia-sdk)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

별도의 웹 브라우저 없이 노벨피아의 REST 엔드포인트를 호출하여 작품 검색, 큐레이션, 필터링 조회 등을 수행할 수 있는 초경량/고성능 TypeScript SDK입니다.

---

## 특징

- **Undici 기반 고성능 통신**: Keep-Alive 풀링 및 최적화된 HTTP 파이프라이닝
- **풍부한 검색 필터**: 장르, 정렬, 완결 여부, 챌린지 여부 등 완벽 지원
- **큐레이션 탐색**: 밀리언 노벨 등 메인 그룹별 추천 목록 조회
- **완전한 TypeScript 지원**: 엄격한 타입 정의와 친절한 JSDoc 자동 완성
- **모듈화된 서브패스**: `./client`, `./types`, `./errors`, `./cache`, `./retry` 개별 임포트 가능

---

## 설치

```bash
pnpm add novelpia-sdk
# or
npm install novelpia-sdk
```

---

## 빠른 시작

```typescript
import { NovelPiaClient } from "novelpia-sdk"

const client = new NovelPiaClient()

// 1. 소설 검색
const results = await client.search({
    search_val: "판타지",
    rows: 20,
    sort_col: "count_view", // 조회수 순 정렬
    is_complete: 0,          // 연재중인 작품만
})

console.log(`총 ${results.total_cnt}개의 소설 발견`)
results.list.forEach((novel) => {
    console.log(`- ${novel.novel_name} by ${novel.writer_nick} (조회수: ${novel.count_view})`)
})

// 2. 큐레이션 조회 (예: 밀리언 노벨)
const curation = await client.getCuration({
    main_group: 59,
    rows: 50,
})
console.log(`큐레이션 제목: ${curation.conf.title}`)
```

---

## API 레퍼런스

### `new NovelPiaClient(baseUrl?)`

| 옵션 / 인자 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `baseUrl` | `string` | `"https://novelpia.com/proc"` | 노벨피아 API 프로세스 기본 URL |

### 주요 메서드

| 메서드 | 반환 타입 | 설명 |
|---|---|---|
| `search(params)` | `Promise<NovelSearchResponse>` | 키워드, 장르, 정렬, 연재/완결 필터 검색 |
| `getCuration(params)` | `Promise<NovelCurationResponse>` | 메인 그룹별 추천 큐레이션 소설 목록 조회 |

---

## 주요 파라미터 및 타입

### `SearchParams`

| 필드 | 타입 | 설명 |
|---|---|---|
| `search_val` | `string` | 검색 키워드 |
| `page` | `number` | 페이지 번호 (기본값: 1) |
| `rows` | `number` | 페이지 당 행 수 (기본값: 20) |
| `search_type` | `string` | 검색 대상 (`'all'`, `'writer'`, `'novel_name'` 등) |
| `novel_genre` | `string` | 장르 태그 필터 (예: `"판타지"`, `"하렘"`) |
| `sort_col` | `'last_viewdate' \| 'count_view' \| 'count_good'` | 정렬 기준 (최신순 / 조회순 / 추천순) |
| `is_complete` | `0 \| 1` | 0: 연재중, 1: 완결작 |
| `is_challenge` | `0 \| 1` | 챌린지 리그 여부 |

---

## 라이선스

[Apache-2.0](./LICENSE)
