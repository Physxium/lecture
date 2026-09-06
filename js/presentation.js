const root = document.getElementById("presentation-root");

let lastAnswerState = "";

let currentIndex =
    Number(
        localStorage.getItem(
            "lectureCurrentSlide"
        ) ?? 0
    );

function renderSlide(index) {

    const slide =
        contents[index];

    if (!slide) return;


    if (
        slide.type === "question"
    ) {

        renderQuestion(
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

function getAnswers() {

    return JSON.parse(
        localStorage.getItem(
            "lectureAnswers"
        ) || "[]"
    );

}


function renderQuestion(slide) {

    const oldScreen =
        root.querySelector(".question-screen");

    const previousScroll =
        oldScreen ? oldScreen.scrollTop : 0;

    const answers =
        getAnswers().filter(
            answer =>
                answer.questionId === slide.id
        );

    const publicAnswers =
        answers.filter(
            answer =>
                answer.isPublic
        );

    root.innerHTML = `
    <section class="screen question-screen">

      <div class="question-stage">

        <div class="question-card">

          <header class="slide-header">

            <h1>
              ${slide.title || ""}
            </h1>

            ${slide.subtitle
            ? `
                  <h2>
                    ${slide.subtitle}
                  </h2>
                `
            : ""
        }

          </header>

          ${slide.image
            ? `
                <div class="question-image">
                    <img src="${slide.image}" alt="" />
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
                    ${answer.text}
                  </div>
                `
            )
            .join("")
        }

        </div>

      </div>

      <footer class="slide-footer">
        ${lectureConfig.footer || ""}
      </footer>

    </section>
  `;


    const newScreen =
        root.querySelector(".question-screen");

    if (newScreen) {
        newScreen.scrollTop =
            previousScroll;
    }
}

function renderPresentation(slide) {
    const hasImage = Boolean(slide.image);

    const paragraphs = (slide.paragraphs || [])
        .map(text => `<p>${text}</p>`)
        .join("");

    root.innerHTML = `
    <section class="screen">

      <div class="slide-card ${slide.align === "center" ? "center-slide" : ""}">

        <header class="slide-header">
          ${slide.title ? `<h1>${slide.title}</h1>` : ""}
          ${slide.subtitle ? `<h2>${slide.subtitle}</h2>` : ""}
        </header>

        <div class="slide-content ${hasImage ? "split-layout" : "text-layout"}">

        ${hasImage
                    ? `
                <div class="image-panel">
                <img src="${slide.image}" alt="" />
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
          ${lectureConfig.footer || ""}
        </footer>
    </section>
  `;
}

function renderDoubleColumn(slide) {
    const [left, right] = slide.columns;

    root.innerHTML = `
    <section class="screen">

      <div class="slide-card">

        <header class="slide-header">
          ${slide.title ? `<h1>${slide.title}</h1>` : ""}
        </header>

        <div class="double-column">

          <div class="column-card">
            <h2>${left.subtitle || ""}</h2>

            ${left.image
            ? `<img src="${left.image}" alt="" />`
            : ""
        }

            ${left.text
            ? `<p>${left.text}</p>`
            : ""
        }
          </div>

          <div class="column-card">
            <h2>${right.subtitle || ""}</h2>

            ${right.image
            ? `<img src="${right.image}" alt="" />`
            : ""
        }

            ${right.text
            ? `<p>${right.text}</p>`
            : ""
        }
          </div>

        </div>

        
      </div>

    <footer class="slide-footer">
          ${lectureConfig.footer || ""}
    </footer>

    </section>
  `;
}

renderSlide(currentIndex);

setInterval(() => {

    const newIndex =
        Number(
            localStorage.getItem(
                "lectureCurrentSlide"
            ) ?? 0
        );


    /*
        슬라이드가 바뀐 경우
    */

    if (newIndex !== currentIndex) {

        currentIndex = newIndex;

        lastAnswerState = "";

        renderSlide(currentIndex);

        return;
    }


    const currentSlide =
        contents[currentIndex];


    /*
        질문 슬라이드일 때만
        답변 상태가 실제로 바뀌었는지 확인
    */

    if (
        currentSlide?.type === "question"
    ) {

        const answers =
            getAnswers().filter(
                answer =>
                    answer.questionId ===
                    currentSlide.id
            );

        const answerState =
            JSON.stringify(answers);


        if (
            answerState !==
            lastAnswerState
        ) {

            lastAnswerState =
                answerState;

            renderQuestion(
                currentSlide
            );

        }

    }

}, 500);