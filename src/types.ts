/**
 * 노벨피아 소설 검색 결과 단일 항목 정보
 */
export interface NovelSearch {
    /** 소설 고유 번호 */
    novel_no: number
    /** 소설 제목 */
    novel_name: string
    /** 검색용 정규화 텍스트 */
    novel_search: string
    /** 소설 부제목 (없을 경우 null) */
    novel_subtitle: string | null
    /** 연령 제한 등급 (0: 전체이용가, 19: 성인 등) */
    novel_age: number
    /** 작가 회원 번호 */
    mem_no: number
    /** 썸네일 이미지 파일명 또는 경로 */
    novel_thumb: string
    /** 대표 이미지 파일명 또는 경로 */
    novel_img: string | null
    /** 전체 썸네일 경로 */
    novel_thumb_all: string
    /** 전체 대표 이미지 경로 */
    novel_img_all: string
    /** 등록된 총 회차 수 */
    novel_count: number
    /** 연재 상태 코드 */
    novel_status: number
    /** 소설 구분 타입 코드 */
    novel_type: number
    /** 소설 대표 장르 */
    novel_genre: string
    /** 소설 소개 줄거리/시놉시스 */
    novel_story: string
    /** 주간 조회/순위 지표 */
    novel_weekly: number
    /** 누적 조회수 */
    count_view: number
    /** 누적 추천(좋아요) 수 */
    count_good: number
    /** 선작(북마크) 수 */
    count_book: number
    /** 후원/픽 수 */
    count_pick: number
    /** 작가 닉네임 */
    writer_nick: string
    /** 원작자 정보 */
    writer_original: string
    /** ISBN 번호 */
    isbn: string
    /** 최근 조회 일시 */
    last_viewdate: string
    /** 독점 연재 여부 플래그 (1: 독점) */
    is_monopoly: number
    /** 완결 여부 플래그 (1: 완결) */
    is_complete: number
    /** 후원 거부 여부 플래그 */
    is_donation_refusal: number
    /** 2차 창작(패러디 등) 여부 플래그 */
    is_secondary_creation: number
    /** 공모전 출품작 여부 플래그 */
    is_contest: number
    /** 최초 연재 시작 일시 */
    start_date: string
    /** 상태 변경 일시 */
    status_date: string
    /** 삭제 일시 (삭제되지 않은 경우 null) */
    del_date: string | null
    /** 완결 처리 일시 */
    complete_date: string | null
    /** 최근 회차 등록/수정 일시 */
    last_write_date: string
    /** 공개(라이브) 상태 여부 (1: 공개) */
    novel_live: number
    /** 들여쓰기 적용 여부 */
    is_indent: number
    /** 메인 장르 ID */
    main_genre: number
    /** OSMU(원소스멀티유즈) 지원 여부 */
    is_osmu: number | null
    /** 수집 플래그 */
    flag_collect: number
    /** 이미지 정책 플래그 */
    flag_img_policy: number
    /** 번역 지원 플래그 */
    flag_translate: number
    /** 등록 일시 */
    reg_date: string
    /** 수정 일시 */
    update_dt: string
    /** 비디오 포함 여부 */
    is_video: number
    /** 완성된 표지 이미지 URL */
    cover_url: string
    /** 작가 회원 고유 번호 */
    writer_mem_no: number
    /** 소설 태그/장르 목록 배열 */
    novel_genre_arr: string[]
    /** 챌린지 리그 작품 여부 (1: 챌린지) */
    is_challenge: number
}

/**
 * 노벨피아 소설 검색 API 응답 인터페이스
 */
export interface NovelSearchResponse {
    /** 응답 상태 코드 (200: 성공) */
    status: number
    /** 결과 코드 */
    code: string
    /** 에러 메시지 (정상인 경우 빈 문자열) */
    errmsg: string
    /** 검색된 소설 목록 */
    list: NovelSearch[]
    /** 전체 검색 결과 소설 수 */
    total_cnt: number
    /** 차단/필터링된 소설 수 */
    block_cnt: number
    /** 성인 필터링된 소설 수 */
    block_adult_cnt: number
    /** 비공개 필터링된 소설 수 */
    block_not_live_cnt: number
}

/**
 * 큐레이션(밀리언/PD픽 등) 단일 소설 항목 정보
 */
export interface CurationNovel {
    /** 소설 제목 */
    novel_name: string
    /** 소설 고유 번호 */
    novel_no: string
    /** 작가 닉네임 */
    writer_nick: string
    /** 표지 이미지 URL */
    cover_url: string
    /** 작품 상세 페이지 링크 URL */
    link_url: string
    /** 연령 제한 문자열 */
    novel_age: string
    /** 장르 태그 목록 */
    novel_genre: string[]
    /** 작품 소개글 */
    novel_story: string
    /** 총 글자 수 문자열 */
    novel_words: string
    /** 썸네일 이미지 경로 */
    novel_thumb: string
    /** 회원 닉네임 */
    mem_nick: string
    /** 무료 회차 여부/정보 */
    novel_free: string
}

/**
 * 큐레이션 테마 설정 메타데이터
 */
export interface CurationConfig {
    /** 큐레이션 인덱스 */
    idx: number
    /** 부제목 */
    sub_title: string
    /** 메인 제목 */
    title: string
    /** 배경 색상 코드 (예: '#FFFFFF') */
    bg_color: string
    /** 성인물 포함 여부 플래그 */
    flag_adult: number
    /** 더보기 링크 URL */
    view_more_link: string
    /** 큐레이션 세션 ID */
    sid: string
    /** 적용 여부 플래그 */
    flag_apply: number
    /** 아이콘 표시 위치 플래그 */
    flag_icon_position: number
    /** 큐레이션 아이콘 이미지 URL */
    icon_url: string
}

/**
 * 큐레이션 API 응답 구조체
 */
export interface CurationResponse {
    /** 응답 상태 코드 */
    status: number
    /** 에러 메시지 */
    errmsg: string
    /** 큐레이션 소설 목록 */
    list: CurationNovel[]
    /** 큐레이션 설정 메타데이터 */
    conf: CurationConfig
}

/**
 * 밀리언 소설 단일 항목 정보
 */
export interface MillionNovel {
    /** 소설 제목 */
    novel_name: string
    /** 소설 고유 번호 */
    novel_no: string
    /** 작가 닉네임 */
    writer_nick: string
    /** 표지 이미지 URL */
    cover_url: string
    /** 작품 상세 링크 URL */
    link_url: string
    /** 연령 제한 문자열 */
    novel_age: string
    /** 장르 목록 */
    novel_genre: string[]
    /** 소설 소개글 */
    novel_story: string
    /** 총 글자 수 문자열 */
    novel_words: string
    /** 썸네일 이미지 경로 */
    novel_thumb: string
    /** 회원 닉네임 */
    mem_nick: string
    /** 무료 회차 정보 */
    novel_free: string
}

/**
 * 로깅 기능을 위한 로거 인터페이스
 */
export interface Logger {
    /** 디버그 로그 출력 */
    debug(message: string, ...args: unknown[]): void
    /** 정보 로그 출력 */
    info(message: string, ...args: unknown[]): void
    /** 경고 로그 출력 */
    warn(message: string, ...args: unknown[]): void
    /** 에러 로그 출력 */
    error(message: string, ...args: unknown[]): void
}

/**
 * 요청 인터셉터에 전달되는 컨텍스트 객체
 */
export interface RequestInterceptorContext {
    /** 요청 대상 URL */
    url: string
    /** 요청 쿼리 파라미터 맵 */
    params?: Record<string, unknown>
    /** 요청 HTTP 헤더 */
    headers: Record<string, string>
    /** 현재 요청 시도 횟수 (0부터 시작) */
    attempt: number
    /** 취소 신호 AbortSignal */
    signal?: AbortSignal
}

/**
 * 응답 인터셉터에 전달되는 컨텍스트 객체
 */
export interface ResponseInterceptorContext<T = unknown> {
    /** 요청 URL */
    url: string
    /** 파싱된 응답 데이터 */
    data: T
    /** HTTP 상태 코드 */
    status: number
    /** 요청 처리 소요 시간 (밀리초) */
    durationMs: number
    /** 캐시 적중(Cache Hit) 여부 */
    cached?: boolean
}

/**
 * 에러 인터셉터에 전달되는 컨텍스트 객체
 */
export interface ErrorInterceptorContext {
    /** 요청 URL */
    url: string
    /** 발생한 에러 객체 */
    error: unknown
    /** 에러 발생 당시의 시도 횟수 */
    attempt: number
}

/**
 * 재시도 인터셉터에 전달되는 컨텍스트 객체
 */
export interface RetryInterceptorContext {
    /** 요청 URL */
    url: string
    /** 재시도 유발 원인 에러 객체 */
    error: unknown
    /** 다음 시도 횟수 */
    attempt: number
    /** 다음 시도까지의 대기 시간(밀리초) */
    delayMs: number
}

/**
 * 요청 직전에 실행되는 인터셉터 함수 타입
 */
export type RequestInterceptor = (
    context: RequestInterceptorContext,
) => void | RequestInterceptorContext | Promise<void | RequestInterceptorContext>

/**
 * 응답 수신 직후에 실행되는 인터셉터 함수 타입
 */
export type ResponseInterceptor<T = unknown> = (
    context: ResponseInterceptorContext<T>,
) => void | T | Promise<void | T>

/**
 * 요청 중 에러 발생 시 실행되는 인터셉터 함수 타입
 */
export type ErrorInterceptor = (
    context: ErrorInterceptorContext,
) => void | Promise<void>

/**
 * 재시도 수행 직전에 실행되는 인터셉터 함수 타입
 */
export type RetryInterceptor = (
    context: RetryInterceptorContext,
) => void | Promise<void>

/**
 * 클라이언트에 등록할 수 있는 인터셉터 묶음
 */
export interface ClientInterceptors {
    /** 요청 인터셉터 */
    onRequest?: RequestInterceptor | RequestInterceptor[]
    /** 응답 인터셉터 */
    onResponse?: ResponseInterceptor | ResponseInterceptor[]
    /** 에러 인터셉터 */
    onError?: ErrorInterceptor | ErrorInterceptor[]
    /** 재시도 인터셉터 */
    onRetry?: RetryInterceptor | RetryInterceptor[]
}

/**
 * NovelPiaClient 인스턴스 초기화 옵션
 */
export interface NovelPiaClientOptions {
    /** 기본 API 베이스 URL (기본값: 'https://novelpia.com/proc') */
    baseUrl?: string
    /** 요청 타임아웃 제한 시간(밀리초, 기본값: 10000) */
    timeout?: number
    /** 최대 재시도 횟수 (기본값: 3) */
    maxRetries?: number
    /** 재시도 기본 지연 시간(밀리초, 기본값: 500) */
    retryBaseDelayMs?: number
    /** 재시도 최대 지연 시간(밀리초, 기본값: 10000) */
    retryMaxDelayMs?: number
    /** 모든 요청에 기본으로 포함될 HTTP 헤더 */
    headers?: Record<string, string>
    /** 커스텀 fetch 함수 */
    fetch?: typeof fetch
    /** 캐시 활성화 여부(true 시 기본 MemoryTtlCache 사용) 또는 커스텀 CacheStore */
    cache?: boolean | import("./cache.js").CacheStore
    /** 기본 캐시 유효 시간(밀리초, 기본값: 60000) */
    cacheTtlMs?: number
    /** 커스텀 로거 */
    logger?: Logger
    /** 전역 인터셉터 설정 */
    interceptors?: ClientInterceptors
}

/**
 * 개별 API 요청 시 재정의할 수 있는 옵션
 */
export interface RequestOptions {
    /** 요청 타임아웃 제한 시간(밀리초) */
    timeout?: number
    /** 요청 취소를 위한 AbortSignal */
    signal?: AbortSignal
    /** 최대 재시도 횟수 */
    maxRetries?: number
    /** 해당 요청에 대해 캐시 조회를 건너뛸지 여부 */
    skipCache?: boolean
    /** 해당 요청에 적용할 캐시 유효 시간(밀리초) */
    cacheTtlMs?: number
    /** 추가 요청 HTTP 헤더 */
    headers?: Record<string, string>
}

/**
 * 페이지네이션 및 이터레이션 제어 옵션
 */
export interface PaginationOptions {
    /** 시작 페이지 번호 (기본값: 1) */
    startPage?: number
    /** 최대 가져올 페이지 수 (기본값: 무제한) */
    maxPages?: number
    /** 페이지 간 요청 대기 시간(밀리초, 기본값: 0) */
    pageDelayMs?: number
}


