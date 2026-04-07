/**
 * 예제 5: 에러 처리 및 타입 안정성
 *
 * 실행: ts-node examples/05-error-handling.ts
 */
import { NovelPiaClient, type NovelSearchResponse } from "../index"

async function searchWithErrorHandling(keyword: string): Promise<void> {
    const client = new NovelPiaClient()

    try {
        console.log(`🔍 "${keyword}" 검색 중...\n`)

        const result: NovelSearchResponse = await client.search({
            search_val: keyword,
            rows: 5,
        })

        // 검색 결과 확인
        if (result.status !== 200) {
            console.warn(`⚠️ 응답 상태: ${result.status}`)
            if (result.errmsg) {
                console.warn(`오류 메시지: ${result.errmsg}`)
            }
            return
        }

        // 결과 검증
        if (!result.list || result.list.length === 0) {
            console.log(`📭 "${keyword}"로 검색된 소설이 없습니다.`)
            return
        }

        // 성공적으로 처리
        console.log(
            `✅ 검색 성공! ${result.list.length}개의 소설을 찾았습니다.\n`,
        )

        result.list.forEach((novel, index) => {
            console.log(`${index + 1}. ${novel.novel_name}`)

            // 타입 안정성 - 필드 존재 확인
            if (novel.cover_url) {
                console.log(`   이미지: ${novel.cover_url}`)
            }

            if (novel.novel_genre_arr && novel.novel_genre_arr.length > 0) {
                console.log(`   장르: ${novel.novel_genre_arr.join(", ")}`)
            }

            console.log("")
        })
    } catch (error) {
        // 타입 안전한 에러 처리
        if (error instanceof Error) {
            console.error(`❌ 오류 발생: ${error.message}`)
            console.error(`   스택: ${error.stack}`)
        } else {
            console.error(`❌ 알 수 없는 오류:`, error)
        }
    }
}

async function main() {
    // 여러 검색어로 테스트
    const keywords = ["판타지", "로맨스", "일상"]

    for (const keyword of keywords) {
        await searchWithErrorHandling(keyword)
        console.log("=".repeat(60) + "\n")
    }
}

main()
