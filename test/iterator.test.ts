import { NovelPiaClient } from "../src/client"
import type { NovelSearch, NovelSearchResponse } from "../src/types"

// Mock fetch from undici
jest.mock("undici", () => ({
    fetch: jest.fn(),
}))

import { fetch } from "undici"

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

const createMockNovel = (id: number): NovelSearch => ({
    novel_no: id,
    novel_name: `Novel ${id}`,
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
    writer_nick: "Author",
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
})

describe("Auto Pagination & Async Iterators", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("paginateSearch", () => {
        it("should iterate through pages until total_cnt is reached", async () => {
            const page1Response: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [createMockNovel(1), createMockNovel(2)],
                total_cnt: 4,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            const page2Response: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [createMockNovel(3), createMockNovel(4)],
                total_cnt: 4,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => page1Response,
                } as any)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => page2Response,
                } as any)

            const client = new NovelPiaClient()
            const pages: NovelSearchResponse[] = []

            for await (const page of client.paginateSearch({
                search_val: "test",
                rows: 2,
            })) {
                pages.push(page)
            }

            expect(pages).toHaveLength(2)
            expect(pages[0].list[0].novel_no).toBe(1)
            expect(pages[1].list[0].novel_no).toBe(3)
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })

        it("should respect maxPages option", async () => {
            const page1Response: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [createMockNovel(1)],
                total_cnt: 100,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => page1Response,
            } as any)

            const client = new NovelPiaClient()
            const pages: NovelSearchResponse[] = []

            for await (const page of client.paginateSearch(
                { search_val: "test", rows: 1 },
                { maxPages: 2 },
            )) {
                pages.push(page)
            }

            expect(pages).toHaveLength(2)
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })
    })

    describe("iterateSearch", () => {
        it("should yield individual novels across pages", async () => {
            const page1Response: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [createMockNovel(10), createMockNovel(20)],
                total_cnt: 3,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            const page2Response: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [createMockNovel(30)],
                total_cnt: 3,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => page1Response,
                } as any)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => page2Response,
                } as any)

            const client = new NovelPiaClient()
            const novels: NovelSearch[] = []

            for await (const novel of client.iterateSearch({
                search_val: "test",
                rows: 2,
            })) {
                novels.push(novel)
            }

            expect(novels).toHaveLength(3)
            expect(novels.map((n) => n.novel_no)).toEqual([10, 20, 30])
        })
    })
})
