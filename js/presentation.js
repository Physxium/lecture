const root =
    document.getElementById(
        "presentation-root"
    );


let currentIndex = 0;

let lastAnswerState = "";

let polling = false;


/* --------------------------------
   HTML escape
-------------------------------- */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* --------------------------------
   API
-------------------------------- */

async function getLectureState() {

    const response =
        await fetch(
            "/api/state",
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {
        throw new Error(
            "Failed to load lecture state"
        );
    }

    return response.json();
}


async function getQuestionAnswers(
    questionId
) {

    const response =
        await fetch(
            `/api/answers?questionId=${encodeURIComponent(questionId)}`,
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {
        throw new Error(
            "Failed to load answers"
        );
    }

    return response.json();
}


/* --------------------------------
   Slide renderer
-------------------------------- */

async function renderSlide(index) {

    const slide =
        contents[index];

    if (!slide) {
        return;
    }


    if (
        slide.type === "question"
    ) {

        await renderQuestion(
            slide
        );

        return;
    }


    if (
        slide.layout ===
        "double-column"
    ) {

        renderDoubleColumn(
            slide
        );

        return;
    }


    renderPresentation(
        slide
    );
}


/* --------------------------------
   Question
-------------------------------- */

async function renderQuestion(slide) {

    const oldScreen =
        root.querySelector(
            ".question-screen"
        );

    const previousScroll =
        oldScreen
            ? oldScreen.scrollTop
            : 0;


    let answers = [];

    try {

        answers =
            await getQuestionAnswers(
                slide.id
            );

    } catch (error) {

        console.error(error);

    }


    const publicAnswers =
        answers.filter(
            answer =>
                Number(
                    answer.is_public
                ) === 1
        );


    root.innerHTML = `
        <section class="screen question-screen">

            <div class="question-stage">

                <div class="question-card">

                    <header class="slide-header">

                        <h1>
                            ${escapeHTML(slide.title)}
                        </h1>

                        ${slide.subtitle
            ? `
                                    <h2>
                                        ${escapeHTML(slide.subtitle)}
                                    </h2>
                                `
            : ""
        }

                    </header>


                    ${slide.image
            ? `
                                <div class="question-image">
                                    <img
                                        src="${slide.image}"
                                        alt=""
                                    />
                                </div>
                            `
            : ""
        }


                    <div class="submission-count">
                        ${answers.length}명 제출
                    </div>

                </div>


                <div class="public-answer-list">

                    ${publicAnswers
            .map(
                answer => `
                                    <div class="public-answer-card">
                                        ${escapeHTML(answer.answer)}
                                    </div>
                                `
            )
            .join("")
        }

                </div>

            </div>


            <footer class="slide-footer">
                ${escapeHTML(
            lectureConfig.footer || ""
        )}
            </footer>

        </section>
    `;


    const newScreen =
        root.querySelector(
            ".question-screen"
        );

    if (newScreen) {

        newScreen.scrollTop =
            previousScroll;

    }
}


/* --------------------------------
   Presentation
-------------------------------- */

function renderPresentation(slide) {

    const hasImage =
        Boolean(
            slide.image
        );


    const paragraphs =
        (slide.paragraphs || [])
            .map(
                text => `
                    <p>
                        ${escapeHTML(text)}
                    </p>
                `
            )
            .join("");


    root.innerHTML = `
        <section class="screen">

            <div
                class="
                    slide-card
                    ${slide.align === "center"
            ? "center-slide"
            : ""
        }
                "
            >

                <header class="slide-header">

                    ${slide.title
            ? `
                                <h1>
                                    ${escapeHTML(slide.title)}
                                </h1>
                            `
            : ""
        }

                    ${slide.subtitle
            ? `
                                <h2>
                                    ${escapeHTML(slide.subtitle)}
                                </h2>
                            `
            : ""
        }

                </header>


                <div
                    class="
                        slide-content
                        ${hasImage
            ? "split-layout"
            : "text-layout"
        }
                    "
                >

                    ${hasImage
            ? `
                                <div class="image-panel">
                                    <img
                                        src="${slide.image}"
                                        alt=""
                                    />
                                </div>
                            `
            : ""
        }


                    <div class="text-panel">
                        ${paragraphs}
                    </div>

                </div>

            </div>


            <footer class="slide-footer">
                ${escapeHTML(
            lectureConfig.footer || ""
        )}
            </footer>

        </section>
    `;
}


/* --------------------------------
   Double column
-------------------------------- */

function renderDoubleColumn(slide) {

    const [left, right] =
        slide.columns;


    root.innerHTML = `
        <section class="screen">

            <div class="slide-card">

                <header class="slide-header">

                    ${slide.title
            ? `
                                <h1>
                                    ${escapeHTML(slide.title)}
                                </h1>
                            `
            : ""
        }

                </header>


                <div class="double-column">

                    <div class="column-card">

                        <h2>
                            ${escapeHTML(
            left.subtitle || ""
        )}
                        </h2>

                        ${left.image
            ? `
                                    <img
                                        src="${left.image}"
                                        alt=""
                                    />
                                `
            : ""
        }

                        ${left.text
            ? `
                                    <p>
                                        ${escapeHTML(left.text)}
                                    </p>
                                `
            : ""
        }

                    </div>


                    <div class="column-card">

                        <h2>
                            ${escapeHTML(
            right.subtitle || ""
        )}
                        </h2>

                        ${right.image
            ? `
                                    <img
                                        src="${right.image}"
                                        alt=""
                                    />
                                `
            : ""
        }

                        ${right.text
            ? `
                                    <p>
                                        ${escapeHTML(right.text)}
                                    </p>
                                `
            : ""
        }

                    </div>

                </div>

            </div>


            <footer class="slide-footer">
                ${escapeHTML(
            lectureConfig.footer || ""
        )}
            </footer>

        </section>
    `;
}


/* --------------------------------
   Polling
-------------------------------- */

async function pollPresentation() {

    if (polling) {
        return;
    }

    polling = true;

    try {

        const state =
            await getLectureState();

        const newIndex =
            Number(
                state.currentSlide ?? 0
            );


        /*
            슬라이드 변경
        */

        if (
            newIndex !==
            currentIndex
        ) {

            currentIndex =
                newIndex;

            lastAnswerState = "";

            await renderSlide(
                currentIndex
            );

            return;
        }


        const currentSlide =
            contents[
            currentIndex
            ];


        /*
            질문 슬라이드라면
            답변 상태 확인
        */

        if (
            currentSlide?.type ===
            "question"
        ) {

            const answers =
                await getQuestionAnswers(
                    currentSlide.id
                );

            const answerState =
                JSON.stringify(
                    answers
                );


            if (
                answerState !==
                lastAnswerState
            ) {

                lastAnswerState =
                    answerState;

                await renderQuestion(
                    currentSlide
                );

            }

        }

    } catch (error) {

        console.error(
            "Presentation polling error:",
            error
        );

    } finally {

        polling = false;

    }
}


/* --------------------------------
   Start
-------------------------------- */

async function initPresentation() {

    try {

        const state =
            await getLectureState();

        currentIndex =
            Number(
                state.currentSlide ?? 0
            );

    } catch (error) {

        console.error(error);

        currentIndex = 0;

    }


    await renderSlide(
        currentIndex
    );


    setInterval(
        pollPresentation,
        500
    );
}


initPresentation();