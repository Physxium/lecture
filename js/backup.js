const backupRoot =
    document.getElementById("backup-root");


function renderBackup() {

    backupRoot.innerHTML = contents
        .map((slide, index) => {

            if (slide.type === "question") {
                return renderBackupQuestion(slide, index);
            }

            if (slide.layout === "double-column") {
                return renderBackupDoubleColumn(slide, index);
            }

            return renderBackupPresentation(slide, index);

        })
        .join("");
}


function renderBackupPresentation(slide, index) {

    const hasImage =
        Boolean(slide.image);

    const paragraphs =
        (slide.paragraphs || [])
            .map(
                text => `<p>${text}</p>`
            )
            .join("");

    return `
    <section class="backup-slide">

      <div
        class="
          backup-slide-card
          ${slide.align === "center"
            ? "backup-center-slide"
            : ""}
        "
      >

        <header class="backup-header">

          ${slide.title
            ? `<h1>${slide.title}</h1>`
            : ""
        }

          ${slide.subtitle
            ? `<h2>${slide.subtitle}</h2>`
            : ""
        }

        </header>


        <div
          class="
            backup-content
            ${hasImage
            ? "backup-split-layout"
            : "backup-text-layout"}
          "
        >

          ${hasImage
            ? `
                <div class="backup-image-panel">
                  <img
                    src="${slide.image}"
                    alt=""
                  />
                </div>
              `
            : ""
        }

          <div class="backup-text-panel">
            ${paragraphs}
          </div>

        </div>

      </div>

      <footer class="backup-footer">
        ${lectureConfig.footer || ""}
      </footer>

    </section>
  `;
}


function renderBackupDoubleColumn(slide, index) {

    const [left, right] =
        slide.columns || [{}, {}];

    return `
    <section class="backup-slide">

      <div class="backup-slide-card">

        <header class="backup-header">

          ${slide.title
            ? `<h1>${slide.title}</h1>`
            : ""
        }

          ${slide.subtitle
            ? `<h2>${slide.subtitle}</h2>`
            : ""
        }

        </header>


        <div class="backup-double-column">

          <div class="backup-column-card">

            ${left.subtitle
            ? `<h2>${left.subtitle}</h2>`
            : ""
        }

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
            ? `<p>${left.text}</p>`
            : ""
        }

          </div>


          <div class="backup-column-card">

            ${right.subtitle
            ? `<h2>${right.subtitle}</h2>`
            : ""
        }

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
            ? `<p>${right.text}</p>`
            : ""
        }

          </div>

        </div>

      </div>

      <footer class="backup-footer">
        ${lectureConfig.footer || ""}
      </footer>

    </section>
  `;
}


function renderBackupQuestion(slide, index) {

    return `
    <section class="backup-slide">

      <div class="backup-slide-card backup-question-card">

        <div class="backup-question-label">
          질문
        </div>

        <header class="backup-header">

          ${slide.title
            ? `<h1>${slide.title}</h1>`
            : ""
        }

          ${slide.subtitle
            ? `<h2>${slide.subtitle}</h2>`
            : ""
        }

        </header>

        ${slide.image
            ? `
              <div class="backup-question-image">
                <img
                  src="${slide.image}"
                  alt=""
                />
              </div>
            `
            : ""
        }

      </div>

      <footer class="backup-footer">
        ${lectureConfig.footer || ""}
      </footer>

    </section>
  `;
}


renderBackup();