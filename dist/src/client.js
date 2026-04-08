import { fetch } from "undici";
// Curation 타겟과 main_group 매핑
const CURATION_GROUP_MAP = {
    million: 59,
    "pd-picks": 210,
};
const BASE_URL = "https://novelpia.com/proc";
/** Novelpia API 클라이언트 */
export class NovelPiaClient {
    baseUrl;
    constructor(baseUrl = BASE_URL) {
        this.baseUrl = baseUrl;
    }
    /**
     * 소설 검색
     */
    async search(params) {
        const searchParams = new URLSearchParams({
            cmd: "novel_search",
            page: String(params.page ?? 1),
            rows: String(params.rows ?? 20),
            search_type: params.search_type ?? "all",
            search_val: params.search_val ?? "",
            novel_type: params.novel_type ?? "",
            novel_genre: params.novel_genre ?? "",
            sort_col: params.sort_col ?? "last_viewdate",
            is_complete: params.is_complete ? "1" : "",
            is_challenge: params.is_challenge ? "1" : "",
            block_out: "0",
            block_stop: "0",
            is_contest: "0",
            list_display: "list",
            _: Date.now().toString(),
        });
        const response = await fetch(`${this.baseUrl}/novel?${searchParams}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = (await response.json());
        return data;
    }
    /**
     * 큐레이션 조회
     * @param params.target - "million" (100만 조회 명작) 또는 "pd-picks" (편집자 픽)
     */
    async getCuration(params) {
        const mainGroup = CURATION_GROUP_MAP[params.target];
        const searchParams = new URLSearchParams({
            cmd: "million_novel_curation",
            main_group: String(mainGroup),
            rows: String(params.rows ?? 100),
            _: Date.now().toString(),
        });
        if (params.prev_million_flag) {
            searchParams.append("prev_million_flag", "true");
        }
        const response = await fetch(`${this.baseUrl}/novel_curation?${searchParams}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = (await response.json());
        return data;
    }
}
