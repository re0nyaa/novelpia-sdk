/**
 * 예제 4: 페이지네이션
 *
 * 실행: ts-node examples/04-pagination.ts
 */
import { NovelPiaClient } from "../index"

async function main() {
    const client = new NovelPiaClient()

    try {
        console.log("📄 페이지네이션 예제\n")

        const ROWS_PER_PAGE = 10

        // 1페이지 조회
        console.log(`📖 1페이지 (${ROWS_PER_PAGE}개씩)\n`)
        const page1 = await client.search({
            search_val: "판타지",
            page: 1,
            rows: ROWS_PER_PAGE,
        })

        console.log(`검색 결과: ${page1.total_cnt}개`)
        console.log(`차단됨: ${page1.block_cnt}개`)
        console.log(`현재 페이지: ${page1.list.length}개\n`)

        page1.list.forEach((novel, index) => {
            console.log(`  ${index + 1}. ${novel.novel_name}`)
        })

        console.log("\n" + "=".repeat(60) + "\n")

        // 2페이지 조회
        console.log(`📖 2페이지\n`)
        const page2 = await client.search({
            search_val: "판타지",
            page: 2,
            rows: ROWS_PER_PAGE,
        })

        page2.list.forEach((novel, index) => {
            console.log(`  ${ROWS_PER_PAGE + index + 1}. ${novel.novel_name}`)
        })

        console.log("\n" + "=".repeat(60) + "\n")

        // 페이지 계산
        const totalPages = Math.ceil(page1.total_cnt / ROWS_PER_PAGE)
        console.log(`💡 총 ${page1.total_cnt} 개의 마서 ${totalPages}페이지`)
        console.log(`   (페이지당 ${ROWS_PER_PAGE}개)\n`)

        // 마지막 페이지 조회 예시
        const lastPage = await client.search({
            search_val: "판타지",
            page: totalPages,
            rows: ROWS_PER_PAGE,
        })

        console.log(`📖 마지막 페이지 (${totalPages}페이지)\n`)
        console.log(`이 페이지의 항목: ${lastPage.list.length}개`)
    } catch (error) {
        console.error(
            "❌ 오류:",
            error instanceof Error ? error.message : error,
        )
    }
}

main()
