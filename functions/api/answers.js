export async function onRequestGet(context) {
    const url =
        new URL(context.request.url);

    const questionId =
        url.searchParams.get("questionId");

    if (!questionId) {
        return Response.json(
            { error: "questionId is required" },
            { status: 400 }
        );
    }

    const result =
        await context.env.DB
            .prepare(`
        SELECT
          id,
          question_id,
          name,
          answer,
          is_public,
          submitted_at
        FROM answers
        WHERE question_id = ?
        ORDER BY submitted_at ASC
      `)
            .bind(questionId)
            .all();

    return Response.json(
        result.results || []
    );
}


export async function onRequestPost(context) {
    const body =
        await context.request.json();

    const questionId =
        String(body.questionId || "").trim();

    const name =
        String(body.name || "").trim();

    const answer =
        String(body.answer || "").trim();


    if (
        !questionId ||
        !name ||
        !answer
    ) {
        return Response.json(
            { error: "Missing fields" },
            { status: 400 }
        );
    }


    await context.env.DB
        .prepare(`
      INSERT INTO answers (
        question_id,
        name,
        answer
      )
      VALUES (?, ?, ?)

      ON CONFLICT(question_id, name)
      DO UPDATE SET
        answer = excluded.answer,
        submitted_at = CURRENT_TIMESTAMP
    `)
        .bind(
            questionId,
            name,
            answer
        )
        .run();


    return Response.json({
        ok: true
    });
}


export async function onRequestPatch(context) {
    const body =
        await context.request.json();

    const id =
        Number(body.id);

    const isPublic =
        body.isPublic ? 1 : 0;


    if (!Number.isInteger(id)) {
        return Response.json(
            { error: "Invalid id" },
            { status: 400 }
        );
    }


    await context.env.DB
        .prepare(`
      UPDATE answers
      SET is_public = ?
      WHERE id = ?
    `)
        .bind(
            isPublic,
            id
        )
        .run();


    return Response.json({
        ok: true
    });
}