import {
    NovelPiaClient,
    type SearchParams,
    type CurationParams,
} from "../src/client"
import type { NovelSearchResponse, CurationResponse } from "../src/types"

// Mock fetch from undici
jest.mock("undici", () => ({
    fetch: jest.fn(),
}))

import { fetch } from "undici"

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe("NovelPiaClient", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("constructor", () => {
        it("should use default BASE_URL when not provided", () => {
            const client = new NovelPiaClient()
            expect(client).toBeInstanceOf(NovelPiaClient)
        })

        it("should use custom baseUrl when provided", () => {
            const customUrl = "https://novelpia.com/proc"
            const client = new NovelPiaClient(customUrl)
            expect(client).toBeInstanceOf(NovelPiaClient)
        })
    })

    describe("search method", () => {
        it("should fetch with correct URL and default params", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [],
                total_cnt: 0,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const result = await client.search({ search_val: "테스트" })

            expect(result.status).toBe(200)
            expect(mockFetch).toHaveBeenCalledTimes(1)
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("cmd=novel_search")
            expect(callUrl).toContain("search_val=")
        })

        it("should handle search with custom parameters", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [
                    {
                        novel_no: 1,
                        novel_name: "테스트 소설",
                        novel_search: "",
                        novel_subtitle: null,
                        novel_age: 0,
                        mem_no: 1,
                        novel_thumb: "",
                        novel_img: null,
                        novel_thumb_all: "",
                        novel_img_all: "",
                        novel_count: 0,
                        novel_status: 1,
                        novel_type: 1,
                        novel_genre: "[]",
                        novel_story: "",
                        novel_weekly: 0,
                        count_view: 100,
                        count_good: 50,
                        count_book: 10,
                        count_pick: 1,
                        writer_nick: "작가",
                        writer_original: "",
                        isbn: "",
                        last_viewdate: "2026-04-07",
                        is_monopoly: 0,
                        is_complete: 0,
                        is_donation_refusal: 0,
                        is_secondary_creation: 0,
                        is_contest: 0,
                        start_date: "2026-04-01",
                        status_date: "2026-04-07",
                        del_date: null,
                        complete_date: null,
                        last_write_date: "2026-04-07",
                        novel_live: 1,
                        is_indent: 0,
                        main_genre: 1,
                        is_osmu: null,
                        flag_collect: 0,
                        flag_img_policy: 0,
                        flag_translate: 0,
                        reg_date: "2026-04-01",
                        update_dt: "2026-04-07",
                        is_video: 0,
                        cover_url: "",
                        writer_mem_no: 1,
                        novel_genre_arr: [],
                        is_challenge: 0,
                    },
                ],
                total_cnt: 1,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const params: SearchParams = {
                page: 2,
                rows: 50,
                search_val: "판타지",
                sort_col: "count_view",
                is_complete: 1,
            }

            const result = await client.search(params)

            expect(result.list).toHaveLength(1)
            expect(result.list[0].novel_name).toBe("테스트 소설")
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("page=2")
            expect(callUrl).toContain("rows=50")
        })

        it("should throw error when response is not ok", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Not Found",
            } as any)

            const client = new NovelPiaClient()

            await expect(
                client.search({ search_val: "테스트" }),
            ).rejects.toThrow("Failed to fetch: Not Found")
        })
    })

    describe("getCuration method", () => {
        it("should fetch curation with correct URL", async () => {
            const mockResponse: CurationResponse = {
                status: 200,
                errmsg: "",
                list: [],
                conf: {
                    idx: 59,
                    sub_title: "테스트",
                    title: "테스트",
                    bg_color: "#ffffff",
                    flag_adult: 0,
                    view_more_link: "/test",
                    sid: "test",
                    flag_apply: 1,
                    flag_icon_position: 0,
                    icon_url: "",
                },
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const result = await client.getCuration({ main_group: 59 })

            expect(result.status).toBe(200)
            expect(result.conf.idx).toBe(59)
            expect(mockFetch).toHaveBeenCalledTimes(1)
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("cmd=million_novel_curation")
            expect(callUrl).toContain("main_group=59")
        })

        it("should handle curation with prev_million_flag", async () => {
            const mockResponse: CurationResponse = {
                status: 200,
                errmsg: "",
                list: [
                    {
                        novel_name: "테스트 소설",
                        novel_no: "1",
                        writer_nick: "작가",
                        cover_url: "",
                        link_url: "/novel/1",
                        novel_age: "0",
                        novel_genre: [],
                        novel_story: "",
                        novel_words: "",
                        novel_thumb: "",
                        mem_nick: "작가",
                        novel_free: "0",
                    },
                ],
                conf: {
                    idx: 59,
                    sub_title: "테스트",
                    title: "테스트",
                    bg_color: "#ffffff",
                    flag_adult: 0,
                    view_more_link: "/test",
                    sid: "test",
                    flag_apply: 1,
                    flag_icon_position: 0,
                    icon_url: "",
                },
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const params: CurationParams = {
                main_group: 59,
                rows: 100,
                prev_million_flag: true,
            }

            const result = await client.getCuration(params)

            expect(result.list).toHaveLength(1)
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("prev_million_flag=true")
        })

        it("should throw error when response is not ok", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Internal Server Error",
            } as any)

            const client = new NovelPiaClient()

            await expect(
                client.getCuration({ main_group: 59 }),
            ).rejects.toThrow("Failed to fetch: Internal Server Error")
        })
    })
})
