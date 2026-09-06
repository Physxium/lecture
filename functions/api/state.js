export async function onRequestGet(context) {

    const row =
        await context.env.DB
            .prepare(`
                SELECT
                    current_slide,
                    status
                FROM lecture_state
                WHERE id = 1
            `)
            .first();


    return Response.json({
        currentSlide:
            row?.current_slide ?? 0,

        status:
            row?.status ?? "live"
    });
}


export async function onRequestPost(context) {

    const body =
        await context.request.json();


    /*
        현재 슬라이드 변경
    */

    if (
        body.currentSlide !== undefined
    ) {

        const currentSlide =
            Number(
                body.currentSlide
            );


        if (
            !Number.isInteger(
                currentSlide
            )
        ) {

            return Response.json(
                {
                    error:
                        "Invalid currentSlide"
                },
                {
                    status: 400
                }
            );

        }


        await context.env.DB
            .prepare(`
                UPDATE lecture_state
                SET current_slide = ?
                WHERE id = 1
            `)
            .bind(
                currentSlide
            )
            .run();

    }


    /*
        강의 상태 변경
    */

    if (
        body.status !== undefined
    ) {

        const status =
            String(
                body.status
            );


        if (
            status !== "live" &&
            status !== "ended"
        ) {

            return Response.json(
                {
                    error:
                        "Invalid status"
                },
                {
                    status: 400
                }
            );

        }


        await context.env.DB
            .prepare(`
                UPDATE lecture_state
                SET status = ?
                WHERE id = 1
            `)
            .bind(
                status
            )
            .run();

    }


    /*
        최종 상태 반환
    */

    const row =
        await context.env.DB
            .prepare(`
                SELECT
                    current_slide,
                    status
                FROM lecture_state
                WHERE id = 1
            `)
            .first();


    return Response.json({
        ok: true,

        currentSlide:
            row?.current_slide ?? 0,

        status:
            row?.status ?? "live"
    });

}