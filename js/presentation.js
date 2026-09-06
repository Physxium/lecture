const root =
    document.getElementById(
        "presentation-root"
    );


/* --------------------------------
   Polling
-------------------------------- */

const POLL_INTERVAL = 1000;

let currentIndex = 0;

let lastAnswerState = "";

let polling = false;

let pollingStopped = false;


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
   Ended screen
-------------------------------- */

function renderEndedPage() {

    root.innerHTML = `
        <section class="screen">

            <div class="slide-card center-slide">

                <header class="slide-header">

                    <h1>
                        강의가 종료되었습니다.
                    </h1>

                    <h2>
                        참여해 주셔서 감사합니다.
                    </h2>

                </header>

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
   Slide renderer
-------------------------------- */

async function renderSlide(
    index,
    suppliedAnswers = null
) {

    const slide =
        contents[index];


    if (!slide) {
        return;
    }


    /*
        질문 슬라이드
    */

    if (
        slide.type ===
        "question"
    ) {

        let answers =
            suppliedAnswers;


        /*
            polling에서 이미 받아온 답변이 없다면
            여기서 한 번만 불러옴
        */

        if (!answers) {

            try {

                answers =
                    await getQuestionAnswers(
                        slide.id
                    );

            } catch (error) {

                console.error(error);

                answers = [];

            }

        }


        lastAnswerState =
            JSON.stringify(
                answers
            );


        renderQuestion(
            slide,
            answers
        );

        return;
    }


    /*
        일반 슬라이드에서는
        답변 상태 초기화
    */

    lastAnswerState = "";


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

function renderQuestion(
    slide,
    answers = []
) {

    /*
        기존 스크롤 위치 보존
    */

    const oldScreen =
        root.querySelector(
            ".question-screen"
        );


    const previousScroll =
        oldScreen
            ? oldScreen.scrollTop
            : 0;


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
                            ${escapeHTML(
        slide.title
    )}
                        </h1>


                        ${slide.subtitle
            ? `
                                    <h2>
                                        ${escapeHTML(
                slide.subtitle
            )}
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
                                        ${escapeHTML(
                    answer.answer
                )}
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


    /*
        렌더링 후
        이전 스크롤 위치 복원
    */

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
                                    ${escapeHTML(
                slide.title
            )}
                                </h1>
                            `
            : ""
        }


                    ${slide.subtitle
            ? `
                                <h2>
                                    ${escapeHTML(
                slide.subtitle
            )}
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
                                    ${escapeHTML(
                slide.title
            )}
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
                                        ${escapeHTML(
                left.text
            )}
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
                                        ${escapeHTML(
                right.text
            )}
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

    /*
        강의 종료 후에는
        완전히 중지
    */

    if (pollingStopped) {
        return;
    }


    /*
        다른 탭 / 백그라운드에서는
        서버 요청하지 않음
    */

    if (document.hidden) {
        return;
    }


    /*
        이전 요청이 아직 진행 중이면
        중복 polling 방지
    */

    if (polling) {
        return;
    }


    polling = true;


    try {

        /*
            1.
            현재 강의 상태 확인
        */

        const state =
            await getLectureState();


        /*
            강의 종료
        */

        if (
            state.status ===
            "ended"
        ) {

            pollingStopped = true;

            renderEndedPage();

            return;
        }


        const newIndex =
            Number(
                state.currentSlide ?? 0
            );


        /*
            2.
            슬라이드가 바뀐 경우
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


        /*
            3.
            현재 슬라이드가 질문일 때만
            답변 조회
        */

        const currentSlide =
            contents[
            currentIndex
            ];


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


            /*
                답변이 실제로 바뀐 경우에만
                화면 다시 그림

                여기서 추가 fetch는 하지 않음.
                이미 받아온 answers를 그대로 사용.
            */

            if (
                answerState !==
                lastAnswerState
            ) {

                lastAnswerState =
                    answerState;


                renderQuestion(
                    currentSlide,
                    answers
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

    let state;


    try {

        state =
            await getLectureState();

    } catch (error) {

        console.error(error);


        /*
            API 오류 시에도
            첫 슬라이드는 표시
        */

        currentIndex = 0;

        await renderSlide(
            currentIndex
        );

        return;
    }


    /*
        접속 시 이미 종료 상태
    */

    if (
        state.status ===
        "ended"
    ) {

        pollingStopped = true;

        renderEndedPage();

        return;
    }


    currentIndex =
        Number(
            state.currentSlide ?? 0
        );


    await renderSlide(
        currentIndex
    );


    setInterval(
        pollPresentation,
        POLL_INTERVAL
    );
}


initPresentation();