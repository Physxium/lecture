const studentRoot =
    document.getElementById("student-root");


function getCurrentIndex() {
    return Number(
        localStorage.getItem(
            "lectureCurrentSlide"
        ) ?? 0
    );
}


function getAnswers() {

    return JSON.parse(
        localStorage.getItem(
            "lectureAnswers"
        ) || "[]"
    );

}


function saveAnswers(answers) {

    localStorage.setItem(
        "lectureAnswers",
        JSON.stringify(answers)
    );

}


function renderStudentPage() {

    const currentIndex =
        getCurrentIndex();

    const slide =
        contents[currentIndex];


    if (!slide) {
        return;
    }


    /*
        발표 슬라이드일 때
    */

    if (slide.type !== "question") {

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
            다음 질문이 표시되면 답변을 입력해 주세요.
          </p>

        </div>

      </section>
    `;

        return;
    }


    /*
        질문 슬라이드일 때
    */

    const answers =
        getAnswers();

    const savedName =
        localStorage.getItem(
            "lectureStudentName"
        ) || "";

    const existingAnswer =
        answers.find(
            answer =>
                answer.questionId === slide.id &&
                answer.name === savedName
        );


    studentRoot.innerHTML = `
    <section class="student-shell">

      <div class="student-card">

        <div class="student-eyebrow">
          질문
        </div>

        <h1>
          ${slide.title || ""}
        </h1>

        ${slide.subtitle
            ? `
              <p class="student-question-subtitle">
                ${slide.subtitle}
              </p>
            `
            : ""
        }
        ${slide.image
                    ? `
            <div class="student-question-image">
                <img src="${slide.image}" alt="" />
            </div>
            `
                    : ""
        }

        ${existingAnswer
            ? renderSubmittedState(
                slide,
                existingAnswer
            )
            : renderAnswerForm(
                slide,
                savedName
            )
        }

      </div>

    </section>
  `;


    bindStudentEvents(slide);
}


function renderAnswerForm(
    slide,
    savedName = ""
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
        value="${savedName}"
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
      ></textarea>

      <button
        type="submit"
        class="student-submit-button"
      >
        제출
      </button>

    </form>
  `;
}


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
        ${answer.text}
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


function bindStudentEvents(slide) {

    const form =
        document.getElementById(
            "answer-form"
        );


    if (form) {

        form.addEventListener(
            "submit",
            event => {

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


                if (!name || !text) {
                    return;
                }


                localStorage.setItem(
                    "lectureStudentName",
                    name
                );


                const answers =
                    getAnswers();


                const existingIndex =
                    answers.findIndex(
                        answer =>
                            answer.questionId === slide.id &&
                            answer.name === name
                    );


                const newAnswer = {
                    questionId: slide.id,
                    name,
                    text,
                    isPublic: false,
                    submittedAt: Date.now()
                };


                if (existingIndex >= 0) {

                    /*
                        같은 이름 + 같은 질문
                        → 덮어쓰기
          
                        기존 공개 상태는 유지
                    */

                    newAnswer.isPublic =
                        answers[
                            existingIndex
                        ].isPublic;

                    answers[
                        existingIndex
                    ] = newAnswer;

                } else {

                    answers.push(
                        newAnswer
                    );

                }


                saveAnswers(
                    answers
                );

                renderStudentPage();

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

                const name =
                    localStorage.getItem(
                        "lectureStudentName"
                    ) || "";

                const answers =
                    getAnswers();

                const answer =
                    answers.find(
                        item =>
                            item.questionId === slide.id &&
                            item.name === name
                    );


                studentRoot.innerHTML = `
          <section class="student-shell">

            <div class="student-card">

              <div class="student-eyebrow">
                질문
              </div>

              <h1>
                ${slide.title || ""}
              </h1>

              ${slide.subtitle
                        ? `
                    <p class="student-question-subtitle">
                      ${slide.subtitle}
                    </p>
                  `
                        : ""
                    }

              <form id="answer-form">

                <label class="student-label">
                  이름
                </label>

                <input
                  id="student-name"
                  class="student-input"
                  type="text"
                  value="${name}"
                  required
                />

                <label class="student-label">
                  답변
                </label>

                <textarea
                  id="student-answer"
                  class="student-textarea"
                  required
                >${answer?.text || ""}</textarea>

                <button
                  type="submit"
                  class="student-submit-button"
                >
                  다시 제출
                </button>

              </form>

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


let lastStudentIndex =
    getCurrentIndex();


renderStudentPage();


setInterval(
    () => {

        const newIndex =
            getCurrentIndex();

        if (
            newIndex !==
            lastStudentIndex
        ) {

            lastStudentIndex =
                newIndex;

            renderStudentPage();

        }

    },
    500
);