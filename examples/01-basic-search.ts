/**
 * 예제 1: 기본 소설 검색
 *
 * 실행: ts-node examples/01-basic-search.ts
 */
import { NovelPiaClient } from "../index"

async function main() {
    const client = new NovelPiaClient()

    try {
        // "판타지" 검색
        console.log('📚 "판타지" 검색 중...\n')
        const result = await client.search({
            search_val: "판타지",
            rows: 5, // 5개만 가져오기
        })

        console.log(`✅ 검색 완료!`)
        console.log(
            `📊 전체: ${result.total_cnt}개, 필터됨: ${result.block_cnt}개\n`,
        )

        // 첫 5개 소설 출력
        result.list.forEach((novel, index) => {
            console.log(`${index + 1}. ${novel.novel_name}`)
            console.log(`   작가: ${novel.writer_nick}`)
            console.log(
                `   조회: ${novel.count_view.toLocaleString()} | 추천: ${novel.count_good.toLocaleString()}`,
            )
            console.log(`   장르: ${novel.novel_genre_arr.join(", ")}`)
            console.log(`   업데이트: ${novel.last_write_date}`)
            console.log("")
        })
    } catch (error) {
        console.error(
            "❌ 오류:",
            error instanceof Error ? error.message : error,
        )
    }
}

main()
