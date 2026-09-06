export async function onRequestPost(context) {

    await context.env.DB
        .prepare(`
      DELETE FROM answers
    `)
        .run();


    return Response.json({
        ok: true
    });
}