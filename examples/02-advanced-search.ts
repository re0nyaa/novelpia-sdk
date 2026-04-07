/**
 * 예제 2: 정렬 및 필터링
 *
 * 실행: ts-node examples/02-advanced-search.ts
 */
import { NovelPiaClient } from "../index"

async function main() {
    const client = new NovelPiaClient()

    try {
        console.log("🔍 고급 검색 예제\n")

        // 1. 조회수 많은 소설 찾기
        console.log("1️⃣ 조회수 많은 순서대로 정렬\n")
        const topViewed = await client.search({
            search_val: "하렘",
            rows: 3,
            sort_col: "count_view", // 조회수순
        })

        topViewed.list.forEach((novel) => {
            console.log(`📖 ${novel.novel_name}`)
            console.log(`   조회: ${novel.count_view.toLocaleString()}`)
        })

        console.log("\n" + "=".repeat(50) + "\n")

        // 2. 추천이 많은 소설 찾기
        console.log("2️⃣ 추천이 많은 순서대로 정렬\n")
        const topRated = await client.search({
            search_val: "이세계",
            rows: 3,
            sort_col: "count_good", // 추천순
        })

        topRated.list.forEach((novel) => {
            console.log(`⭐ ${novel.novel_name}`)
            console.log(`   추천: ${novel.count_good.toLocaleString()}`)
        })

        console.log("\n" + "=".repeat(50) + "\n")

        // 3. 최근 업데이트된 소설 찾기
        console.log("3️⃣ 최근 업데이트된 순서\n")
        const recent = await client.search({
            search_val: "로맨스",
            rows: 3,
            sort_col: "last_viewdate", // 최근 업데이트
        })

        recent.list.forEach((novel) => {
            console.log(`🕐 ${novel.novel_name}`)
            console.log(`   마지막 업데이트: ${novel.last_write_date}`)
        })
    } catch (error) {
        console.error(
            "❌ 오류:",
            error instanceof Error ? error.message : error,
        )
    }
}

main()
