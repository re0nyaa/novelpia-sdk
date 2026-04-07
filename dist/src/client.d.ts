import type { NovelSearchResponse, CurationResponse } from "./types";
export interface SearchParams {
    page?: number;
    rows?: number;
    search_type?: string;
    search_val?: string;
    novel_type?: string;
    novel_genre?: string;
    sort_col?: "last_viewdate" | "count_view" | "count_good";
    is_complete?: 0 | 1;
    is_challenge?: 0 | 1;
}
export interface CurationParams {
    main_group: number;
    rows?: number;
    prev_million_flag?: boolean;
}
/** Novelpia API 클라이언트 */
export declare class NovelPiaClient {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * 소설 검색
     */
    search(params: SearchParams): Promise<NovelSearchResponse>;
    /**
     * 큐레이션 조회
     */
    getCuration(params: CurationParams): Promise<CurationResponse>;
}
