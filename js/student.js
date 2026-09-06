const studentRoot =
    document.getElementById(
        "student-root"
    );


/* --------------------------------
   Polling
-------------------------------- */

const POLL_INTERVAL = 3000;

let lastStudentIndex = -1;

let polling = false;

let pollingStopped = false;

let currentAnswer = null;


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
   Local student data
-------------------------------- */

function getStudentName() {

    return localStorage.getItem(
        "lectureStudentName"
    ) || "";
}


function saveStudentName(name) {

    localStorage.setItem(
        "lectureStudentName",
        name
    );
}


/*
    학생 본인의 답변만
    자기 브라우저에 기억.

    실제 강의 데이터는 D1이 기준.
*/

function getMyAnswers() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "lectureMyAnswers"
            ) || "{}"
        );

    } catch {

        return {};

    }
}


function getMyAnswer(questionId) {

    const answers =
        getMyAnswers();

    return answers[questionId] || null;
}


function saveMyAnswer(
    questionId,
    name,
    answer
) {

    const answers =
        getMyAnswers();


    answers[questionId] = {
        name,
        answer
    };


    localStorage.setItem(
        "lectureMyAnswers",
        JSON.stringify(
            answers
        )
    );
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
   Ended screen
-------------------------------- */

function renderEndedPage() {

    studentRoot.innerHTML = `
        <section class="student-shell">

            <div class="student-card waiting-card">

                <div class="student-eyebrow">
                    강의 종료
                </div>

                <h1>
                    강의가 종료되었습니다.
                </h1>

                <p>
                    참여해 주셔서 감사합니다.
                </p>

            </div>

        </section>
    `;
}


/* --------------------------------
   Student page
-------------------------------- */

async function renderStudentPage(
    state = null
) {

    try {

        if (!state) {

            state =
                await getLectureState();

        }

    } catch (error) {

        console.error(error);

        return;
    }


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
        일반 발표 슬라이드
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
        getStudentName();


    currentAnswer =
        getMyAnswer(
            slide.id
        );


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
                currentAnswer
            )
            : renderAnswerForm(
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
   Answer form
-------------------------------- */

function renderAnswerForm(
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
   Submitted state
-------------------------------- */

function renderSubmittedState(
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


                const answer =
                    document
                        .getElementById(
                            "student-answer"
                        )
                        .value
                        .trim();


                if (
                    !name ||
                    !answer
                ) {
                    return;
                }


                try {

                    await submitAnswer(
                        slide.id,
                        name,
                        answer
                    );


                    /*
                        이름 기억
                    */

                    saveStudentName(
                        name
                    );


                    /*
                        본인이 제출한 답변도
                        자기 브라우저에 기억
                    */

                    saveMyAnswer(
                        slide.id,
                        name,
                        answer
                    );


                    currentAnswer = {
                        name,
                        answer
                    };


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
                    currentAnswer?.name ||
                    getStudentName();


                const savedText =
                    currentAnswer?.answer ||
                    "";


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

    /*
        종료 상태를 한번 받았다면
        이 페이지에서는 더 이상 polling 안 함
    */

    if (pollingStopped) {
        return;
    }


    /*
        브라우저가 백그라운드라면
        서버 요청 안 함
    */

    if (document.hidden) {
        return;
    }


    /*
        이전 요청이 아직 진행 중이면
        중복 호출 방지
    */

    if (polling) {
        return;
    }


    polling = true;


    try {

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
            슬라이드가 바뀐 경우에만
            학생 화면 다시 렌더링
        */

        if (
            newIndex !==
            lastStudentIndex
        ) {

            await renderStudentPage(
                state
            );

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

async function initStudent() {

    let state;


    try {

        state =
            await getLectureState();

    } catch (error) {

        console.error(error);

        return;
    }


    /*
        처음 접속했는데 이미 종료 상태라면
        종료 화면만 표시하고 polling 시작 안 함
    */

    if (
        state.status ===
        "ended"
    ) {

        pollingStopped = true;

        renderEndedPage();

        return;
    }


    await renderStudentPage(
        state
    );


    setInterval(
        pollStudent,
        POLL_INTERVAL
    );
}


initStudent();