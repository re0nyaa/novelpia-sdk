import type {
    NovelSearch,
    NovelSearchResponse,
    CurationNovel,
    CurationResponse,
} from "../src/types"

describe("Types - NovelSearch", () => {
    it("should be a valid NovelSearch object", () => {
        const novel: NovelSearch = {
            novel_no: 300623,
            novel_name: "이세계 멸망 갤러리",
            novel_search: "test",
            novel_subtitle: null,
            novel_age: 0,
            mem_no: 85280,
            novel_thumb: "",
            novel_img: null,
            novel_thumb_all: "/imagebox/cover/test.file",
            novel_img_all: "/imagebox/cover/test.file",
            novel_count: 0,
            novel_status: 1,
            novel_type: 1,
            novel_genre: '["판타지"]',
            novel_story: "테스트 스토리",
            novel_weekly: 0,
            count_view: 1000,
            count_good: 500,
            count_book: 100,
            count_pick: 10,
            writer_nick: "테스트",
            writer_original: "",
            isbn: "",
            last_viewdate: "2026-04-07 18:30:00",
            is_monopoly: 1,
            is_complete: 0,
            is_donation_refusal: 0,
            is_secondary_creation: 0,
            is_contest: 0,
            start_date: "2024-08-29 16:38:57",
            status_date: "2026-04-07 18:43:31",
            del_date: null,
            complete_date: null,
            last_write_date: "2026-04-06 18:30:16",
            novel_live: 0,
            is_indent: 0,
            main_genre: 1,
            is_osmu: null,
            flag_collect: 0,
            flag_img_policy: 1,
            flag_translate: 0,
            reg_date: "2024-08-29 16:36:21",
            update_dt: "2026-04-01 00:14:15",
            is_video: 0,
            cover_url: "//images.novelpia.com/imagebox/cover/test.wimg",
            writer_mem_no: 85280,
            novel_genre_arr: ["판타지"],
            is_challenge: 0,
        }

        expect(novel.novel_no).toBe(300623)
        expect(novel.novel_name).toBe("이세계 멸망 갤러리")
        expect(novel.count_view).toBe(1000)
    })
})

describe("Types - NovelSearchResponse", () => {
    it("should be a valid NovelSearchResponse object", () => {
        const response: NovelSearchResponse = {
            status: 200,
            code: "",
            errmsg: "",
            list: [],
            total_cnt: 85,
            block_cnt: 3,
            block_adult_cnt: 0,
            block_not_live_cnt: 0,
        }

        expect(response.status).toBe(200)
        expect(response.total_cnt).toBe(85)
        expect(Array.isArray(response.list)).toBe(true)
    })
})

describe("Types - CurationNovel", () => {
    it("should be a valid CurationNovel object", () => {
        const novel: CurationNovel = {
            novel_name: "점 좀 봐줬더니 거물들이 집착한다",
            novel_no: "411144",
            writer_nick: "타락물고기",
            cover_url: "//images.novelpia.com/imagebox/cover/test.wimg",
            link_url: "/novel/411144",
            novel_age: "0",
            novel_genre: ["판타지", "전생", "하렘"],
            novel_story: "테스트 스토리",
            novel_words: "",
            novel_thumb: "//images.novelpia.com/imagebox/cover/test.wimg",
            mem_nick: "타락물고기",
            novel_free: "0",
        }

        expect(novel.novel_no).toBe("411144")
        expect(novel.writer_nick).toBe("타락물고기")
        expect(novel.novel_genre).toHaveLength(3)
    })
})

describe("Types - CurationResponse", () => {
    it("should be a valid CurationResponse object", () => {
        const response: CurationResponse = {
            status: 200,
            errmsg: "",
            list: [],
            conf: {
                idx: 59,
                sub_title: "100만의 선택! 밀리언 노벨!",
                title: "독자님들이 선택한 명작들!",
                bg_color: "#ffffff",
                flag_adult: 0,
                view_more_link: "/million_novel_pick",
                sid: "main11",
                flag_apply: 1,
                flag_icon_position: 0,
                icon_url: "",
            },
        }

        expect(response.status).toBe(200)
        expect(response.conf.idx).toBe(59)
        expect(response.conf.sub_title).toContain("선택")
    })
})

describe("Types - Enterprise Options", () => {
    it("should validate NovelPiaClientOptions typing", () => {
        const options: import("../src/types").NovelPiaClientOptions = {
            baseUrl: "https://novelpia.com/proc",
            timeout: 5000,
            maxRetries: 3,
            cache: true,
            cacheTtlMs: 30000,
            headers: {
                "User-Agent": "CustomAgent/1.0",
            },
        }

        expect(options.timeout).toBe(5000)
        expect(options.maxRetries).toBe(3)
    })
})

