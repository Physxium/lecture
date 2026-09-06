export async function onRequestGet(context) {
    const row = await context.env.DB
        .prepare(`
      SELECT current_slide
      FROM lecture_state
      WHERE id = 1
    `)
        .first();

    return Response.json({
        currentSlide: row?.current_slide ?? 0
    });
}


export async function onRequestPost(context) {
    const body = await context.request.json();

    const currentSlide =
        Number(body.currentSlide);

    if (!Number.isInteger(currentSlide)) {
        return Response.json(
            { error: "Invalid currentSlide" },
            { status: 400 }
        );
    }

    await context.env.DB
        .prepare(`
      UPDATE lecture_state
      SET current_slide = ?
      WHERE id = 1
    `)
        .bind(currentSlide)
        .run();

    return Response.json({
        ok: true,
        currentSlide
    });
}