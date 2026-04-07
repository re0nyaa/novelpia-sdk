/**
 * 예제 3: 큐레이션 조회
 *
 * 실행: ts-node examples/03-curation.ts
 */
import { NovelPiaClient } from "../index"

async function main() {
    const client = new NovelPiaClient()

    try {
        console.log("🎬 큐레이션 조회 예제\n")

        // 밀리언 노벨 큐레이션
        const curation = await client.getCuration({
            main_group: 59,
            rows: 10,
        })

        // 큐레이션 제목 출력
        console.log(`🏆 ${curation.conf.title}`)
        console.log(`📌 ${curation.conf.sub_title}\n`)
        console.log("=".repeat(60) + "\n")

        // 소설 목록 출력
        curation.list.forEach((novel, index) => {
            console.log(
                `${String(index + 1).padStart(2, " ")}. ${novel.novel_name}`,
            )
            console.log(`    작가: ${novel.writer_nick}`)
            console.log(`    장르: ${novel.novel_genre.join(", ")}`)
            console.log(`    링크: ${novel.link_url}`)
            if (novel.novel_story) {
                const preview = novel.novel_story
                    .substring(0, 50)
                    .replace(/\n/g, " ")
                console.log(`    소개: ${preview}...`)
            }
            console.log("")
        })

        console.log(`\n총 ${curation.list.length}개의 추천 작품`)
    } catch (error) {
        console.error(
            "❌ 오류:",
            error instanceof Error ? error.message : error,
        )
    }
}

main()
