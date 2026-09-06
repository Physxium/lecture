const params = new URLSearchParams(window.location.search);
const devKey = params.get("dev");

if (devKey !== "0005") {
    document.body.innerHTML = `
    <main style="padding:40px;font-family:sans-serif;">
      <h1>접근할 수 없습니다.</h1>
    </main>
  `;

    throw new Error("Unauthorized admin access");
}

const slideList = document.getElementById("slide-list");

const answerList =
    document.getElementById(
        "answer-list"
    );

function renderSlideList() {

    slideList.innerHTML = "";

    contents.forEach((slide, index) => {

        const button = document.createElement("button");

        button.className = "admin-slide-button";

        button.innerHTML = `
      <span>${index + 1}</span>
      <strong>${slide.title || "제목 없음"}</strong>
    `;

        button.addEventListener("click", () => {

            localStorage.setItem(
                "lectureCurrentSlide",
                String(index)
            );

            updateActiveSlide();

        });

        slideList.appendChild(button);

    });

    updateActiveSlide();
}


function updateActiveSlide() {

    const currentIndex =
        Number(
            localStorage.getItem(
                "lectureCurrentSlide"
            ) ?? 0
        );

    const buttons =
        document.querySelectorAll(
            ".admin-slide-button"
        );

    buttons.forEach(
        (button, index) => {

            button.classList.toggle(
                "active",
                index === currentIndex
            );

        }
    );

    renderAnswers();

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


function renderAnswers() {

    const currentIndex =
        Number(
            localStorage.getItem(
                "lectureCurrentSlide"
            ) ?? 0
        );

    const slide =
        contents[
        currentIndex
        ];


    if (
        !slide ||
        slide.type !== "question"
    ) {

        answerList.innerHTML = `
      <p class="admin-empty">
        현재 슬라이드는 질문이 아닙니다.
      </p>
    `;

        return;
    }


    const answers =
        getAnswers().filter(
            answer =>
                answer.questionId === slide.id
        );


    if (
        answers.length === 0
    ) {

        answerList.innerHTML = `
      <p class="admin-empty">
        아직 제출된 답변이 없습니다.
      </p>
    `;

        return;
    }


    answerList.innerHTML =
        answers
            .map(
                (answer, index) => `
          <button
            class="
              admin-answer-button
              ${answer.isPublic
                        ? "public"
                        : ""}
            "
            data-name="${answer.name}"
          >

            <strong>
              ${answer.name}
            </strong>

            <span>
              ${answer.text}
            </span>

            <small>
              ${answer.isPublic
                        ? "공개 중"
                        : "비공개"
                    }
            </small>

          </button>
        `
            )
            .join("");


    document
        .querySelectorAll(
            ".admin-answer-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const name =
                            button.dataset.name;

                        const allAnswers =
                            getAnswers();

                        const target =
                            allAnswers.find(
                                answer =>
                                    answer.questionId === slide.id &&
                                    answer.name === name
                            );


                        if (!target) {
                            return;
                        }


                        target.isPublic =
                            !target.isPublic;


                        saveAnswers(
                            allAnswers
                        );

                        renderAnswers();

                    }
                );

            }
        );

}

const resetButton =
    document.getElementById(
        "reset-answers-button"
    );

resetButton.addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "모든 학생 답변을 초기화할까요?"
            );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            "lectureAnswers"
        );

        renderAnswers();

    }
);


renderSlideList();

setInterval(
    renderAnswers,
    500
);