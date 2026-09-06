const studentRoot =
    document.getElementById(
        "student-root"
    );


let lastStudentIndex = -1;

let currentAnswer = null;

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


async function submitAnswer(
    questionId,
    name,
    answer
) {

    const response =
        await fetch(
            "/api/answers",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        questionId,
                        name,
                        answer
                    })
            }
        );


    if (!response.ok) {

        throw new Error(
            "Failed to submit answer"
        );

    }

    return response.json();
}


/* --------------------------------
   Student page
-------------------------------- */

async function renderStudentPage() {

    let state;

    try {

        state =
            await getLectureState();

    } catch (error) {

        console.error(error);

        return;
    }


    const currentIndex =
        Number(
            state.currentSlide ?? 0
        );


    lastStudentIndex =
        currentIndex;


    const slide =
        contents[
        currentIndex
        ];


    if (!slide) {
        return;
    }


    /*
        발표 슬라이드
    */

    if (
        slide.type !==
        "question"
    ) {

        currentAnswer = null;

        studentRoot.innerHTML = `
            <section class="student-shell">

                <div class="student-card waiting-card">

                    <div class="student-eyebrow">
                        강의 진행 중
                    </div>

                    <h1>
                        잠시만 기다려 주세요
                    </h1>

                    <p>
                        다음 질문이 표시되면
                        답변을 입력해 주세요.
                    </p>

                </div>

            </section>
        `;

        return;
    }


    /*
        질문 슬라이드
    */

    const savedName =
        localStorage.getItem(
            "lectureStudentName"
        ) || "";


    let answers = [];

    try {

        answers =
            await getQuestionAnswers(
                slide.id
            );

    } catch (error) {

        console.error(error);

    }


    currentAnswer =
        savedName
            ? answers.find(
                answer =>
                    answer.name ===
                    savedName
            ) || null
            : null;


    studentRoot.innerHTML = `
        <section class="student-shell">

            <div class="student-card">

                <div class="student-eyebrow">
                    질문
                </div>

                <h1>
                    ${escapeHTML(slide.title)}
                </h1>

                ${slide.subtitle
            ? `
                            <p class="student-question-subtitle">
                                ${escapeHTML(slide.subtitle)}
                            </p>
                        `
            : ""
        }

                ${slide.image
            ? `
                            <div class="student-question-image">
                                <img
                                    src="${slide.image}"
                                    alt=""
                                />
                            </div>
                        `
            : ""
        }


                ${currentAnswer
            ? renderSubmittedState(
                slide,
                currentAnswer
            )
            : renderAnswerForm(
                slide,
                savedName
            )
        }

            </div>

        </section>
    `;


    bindStudentEvents(
        slide
    );
}


/* --------------------------------
   Form
-------------------------------- */

function renderAnswerForm(
    slide,
    savedName = "",
    savedText = ""
) {

    return `
        <form id="answer-form">

            <label class="student-label">
                이름
            </label>

            <input
                id="student-name"
                class="student-input"
                type="text"
                value="${escapeHTML(savedName)}"
                autocomplete="name"
                placeholder="이름을 입력하세요"
                required
            />


            <label class="student-label">
                답변
            </label>

            <textarea
                id="student-answer"
                class="student-textarea"
                placeholder="자유롭게 답변해 주세요"
                required
            >${escapeHTML(savedText)}</textarea>


            <button
                type="submit"
                class="student-submit-button"
            >
                제출
            </button>

        </form>
    `;
}


/* --------------------------------
   Submitted
-------------------------------- */

function renderSubmittedState(
    slide,
    answer
) {

    return `
        <div class="student-submitted">

            <div class="submitted-message">
                답변이 제출되었습니다.
            </div>

            <div class="submitted-answer">
                ${escapeHTML(answer.answer)}
            </div>

            <button
                id="edit-answer-button"
                class="student-edit-button"
                type="button"
            >
                수정
            </button>

        </div>
    `;
}


/* --------------------------------
   Events
-------------------------------- */

function bindStudentEvents(slide) {

    const form =
        document.getElementById(
            "answer-form"
        );


    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const name =
                    document
                        .getElementById(
                            "student-name"
                        )
                        .value
                        .trim();


                const text =
                    document
                        .getElementById(
                            "student-answer"
                        )
                        .value
                        .trim();


                if (
                    !name ||
                    !text
                ) {
                    return;
                }


                /*
                    학생 이름은
                    이 브라우저에 기억
                */

                localStorage.setItem(
                    "lectureStudentName",
                    name
                );


                try {

                    await submitAnswer(
                        slide.id,
                        name,
                        text
                    );


                    /*
                        서버에서 다시 읽어서
                        최종 상태 표시
                    */

                    await renderStudentPage();

                } catch (error) {

                    console.error(error);

                    alert(
                        "답변 제출에 실패했습니다. 다시 시도해 주세요."
                    );

                }

            }
        );

    }


    const editButton =
        document.getElementById(
            "edit-answer-button"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                const savedName =
                    localStorage.getItem(
                        "lectureStudentName"
                    ) || "";


                const savedText =
                    currentAnswer?.answer || "";


                studentRoot.innerHTML = `
                    <section class="student-shell">

                        <div class="student-card">

                            <div class="student-eyebrow">
                                질문
                            </div>

                            <h1>
                                ${escapeHTML(slide.title)}
                            </h1>

                            ${slide.subtitle
                        ? `
                                        <p class="student-question-subtitle">
                                            ${escapeHTML(slide.subtitle)}
                                        </p>
                                    `
                        : ""
                    }

                            ${slide.image
                        ? `
                                        <div class="student-question-image">
                                            <img
                                                src="${slide.image}"
                                                alt=""
                                            />
                                        </div>
                                    `
                        : ""
                    }

                            ${renderAnswerForm(
                        slide,
                        savedName,
                        savedText
                    )}

                        </div>

                    </section>
                `;


                bindStudentEvents(
                    slide
                );

            }
        );

    }

}


/* --------------------------------
   Polling
-------------------------------- */

async function pollStudent() {

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
            질문/슬라이드가 바뀔 때만
            학생 화면 변경
        */

        if (
            newIndex !==
            lastStudentIndex
        ) {

            await renderStudentPage();

        }

    } catch (error) {

        console.error(
            "Student polling error:",
            error
        );

    } finally {

        polling = false;

    }
}


/* --------------------------------
   Start
-------------------------------- */

renderStudentPage();


setInterval(
    pollStudent,
    500
);