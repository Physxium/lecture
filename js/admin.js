/* --------------------------------
   Dev access
-------------------------------- */

const params =
    new URLSearchParams(
        window.location.search
    );

const devKey =
    params.get("dev");


if (
    devKey !== "0005"
) {

    document.body.innerHTML = `
        <main
            style="
                padding:40px;
                font-family:sans-serif;
            "
        >
            <h1>
                접근할 수 없습니다.
            </h1>
        </main>
    `;

    throw new Error(
        "Unauthorized admin access"
    );
}


/* --------------------------------
   Elements
-------------------------------- */

const slideList =
    document.getElementById(
        "slide-list"
    );

const answerList =
    document.getElementById(
        "answer-list"
    );

const resetButton =
    document.getElementById(
        "reset-answers-button"
    );


let currentIndex = 0;

let polling = false;

let lastAnswerState = "";


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


async function setLectureState(
    slideIndex
) {

    const response =
        await fetch(
            "/api/state",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        currentSlide:
                            slideIndex
                    })
            }
        );


    if (!response.ok) {

        throw new Error(
            "Failed to update lecture state"
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


async function setAnswerPublic(
    id,
    isPublic
) {

    const response =
        await fetch(
            "/api/answers",
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        id,
                        isPublic
                    })
            }
        );


    if (!response.ok) {

        throw new Error(
            "Failed to update answer"
        );

    }

    return response.json();
}


async function resetAnswers() {

    const response =
        await fetch(
            "/api/reset",
            {
                method: "POST"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Failed to reset answers"
        );

    }

    return response.json();
}


/* --------------------------------
   Slide list
-------------------------------- */

function renderSlideList() {

    slideList.innerHTML = "";


    contents.forEach(
        (slide, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "admin-slide-button";


            button.innerHTML = `
                <span>
                    ${index + 1}
                </span>

                <strong>
                    ${escapeHTML(
                slide.title ||
                "제목 없음"
            )}
                </strong>
            `;


            button.addEventListener(
                "click",
                async () => {

                    try {

                        await setLectureState(
                            index
                        );


                        currentIndex =
                            index;

                        lastAnswerState = "";

                        updateActiveSlide();

                        await renderAnswers();

                    } catch (error) {

                        console.error(error);

                        alert(
                            "슬라이드 변경에 실패했습니다."
                        );

                    }

                }
            );


            slideList.appendChild(
                button
            );

        }
    );


    updateActiveSlide();
}


/* --------------------------------
   Active slide
-------------------------------- */

function updateActiveSlide() {

    const buttons =
        document.querySelectorAll(
            ".admin-slide-button"
        );


    buttons.forEach(
        (button, index) => {

            button.classList.toggle(
                "active",
                index ===
                currentIndex
            );

        }
    );

}


/* --------------------------------
   Answers
-------------------------------- */

async function renderAnswers() {

    const slide =
        contents[
        currentIndex
        ];


    if (
        !slide ||
        slide.type !==
        "question"
    ) {

        answerList.innerHTML = `
            <p class="admin-empty">
                현재 슬라이드는 질문이 아닙니다.
            </p>
        `;

        lastAnswerState = "";

        return;
    }


    let answers = [];


    try {

        answers =
            await getQuestionAnswers(
                slide.id
            );

    } catch (error) {

        console.error(error);

        return;
    }


    if (
        answers.length === 0
    ) {

        answerList.innerHTML = `
            <p class="admin-empty">
                아직 제출된 답변이 없습니다.
            </p>
        `;

        lastAnswerState =
            JSON.stringify([]);

        return;
    }


    answerList.innerHTML =
        answers
            .map(
                answer => `
                    <button
                        class="
                            admin-answer-button
                            ${Number(
                    answer.is_public
                ) === 1
                        ? "public"
                        : ""
                    }
                        "
                        data-id="${answer.id}"
                        data-public="${answer.is_public}"
                    >

                        <strong>
                            ${escapeHTML(answer.name)}
                        </strong>

                        <span>
                            ${escapeHTML(answer.answer)}
                        </span>

                        <small>
                            ${Number(
                        answer.is_public
                    ) === 1
                        ? "공개 중"
                        : "비공개"
                    }
                        </small>

                    </button>
                `
            )
            .join("");


    lastAnswerState =
        JSON.stringify(
            answers
        );


    document
        .querySelectorAll(
            ".admin-answer-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        const currentlyPublic =
                            Number(
                                button.dataset.public
                            ) === 1;


                        try {

                            await setAnswerPublic(
                                id,
                                !currentlyPublic
                            );


                            await renderAnswers();

                        } catch (error) {

                            console.error(error);

                            alert(
                                "답변 공개 상태 변경에 실패했습니다."
                            );

                        }

                    }
                );

            }
        );

}


/* --------------------------------
   Reset
-------------------------------- */

resetButton.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "모든 학생 답변을 초기화할까요?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await resetAnswers();

            lastAnswerState = "";

            await renderAnswers();

        } catch (error) {

            console.error(error);

            alert(
                "답변 초기화에 실패했습니다."
            );

        }

    }
);


/* --------------------------------
   Polling
-------------------------------- */

async function pollAdmin() {

    if (polling) {
        return;
    }

    polling = true;


    try {

        /*
            현재 슬라이드 확인
        */

        const state =
            await getLectureState();


        const newIndex =
            Number(
                state.currentSlide ?? 0
            );


        if (
            newIndex !==
            currentIndex
        ) {

            currentIndex =
                newIndex;

            lastAnswerState = "";

            updateActiveSlide();

            await renderAnswers();

            return;
        }


        /*
            질문일 때
            새 답변이 들어왔는지 확인
        */

        const slide =
            contents[
            currentIndex
            ];


        if (
            slide?.type ===
            "question"
        ) {

            const answers =
                await getQuestionAnswers(
                    slide.id
                );


            const answerState =
                JSON.stringify(
                    answers
                );


            if (
                answerState !==
                lastAnswerState
            ) {

                await renderAnswers();

            }

        }

    } catch (error) {

        console.error(
            "Admin polling error:",
            error
        );

    } finally {

        polling = false;

    }

}


/* --------------------------------
   Start
-------------------------------- */

async function initAdmin() {

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


    renderSlideList();

    await renderAnswers();


    setInterval(
        pollAdmin,
        500
    );
}


initAdmin();