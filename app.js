const birthMonth = document.getElementById("birthMonth");
const focus = document.getElementById("focus");
const mood = document.getElementById("mood");

const oracleButton = document.getElementById("oracleButton");
const buttonText = oracleButton.querySelector(".button-text");

const status = document.getElementById("status");

const resultCard = document.getElementById("resultCard");

const resultTitle =
  document.getElementById("resultTitle");

const resultReflection =
  document.getElementById("resultReflection");

const resultTheme =
  document.getElementById("resultTheme");

const resultAction =
  document.getElementById("resultAction");

const resultQuestion =
  document.getElementById("resultQuestion");


oracleButton.addEventListener(
  "click",
  async () => {

    const month =
      birthMonth.value;

    const selectedFocus =
      focus.value;

    const selectedMood =
      mood.value;


    /*
     * Validate the form before
     * sending anything to the server.
     */
    if (!month) {

      status.textContent =
        "Please choose your birth month.";

      birthMonth.focus();

      return;

    }


    if (!selectedFocus) {

      status.textContent =
        "Please choose your current focus.";

      focus.focus();

      return;

    }


    if (!selectedMood) {

      status.textContent =
        "Please choose how you are feeling.";

      mood.focus();

      return;

    }


    /*
     * Prepare the interface for
     * local AI generation.
     */
    oracleButton.disabled = true;

    buttonText.textContent =
      "Creating your reflection...";

    status.textContent =
      "Running local AI inference with QVAC...";

    resultCard.classList.add(
      "hidden"
    );


    try {

      /*
       * Send the user's selections
       * to our local Node server.
       */
      const response =
        await fetch(
          "/api/oracle",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                birthMonth: month,

                focus: selectedFocus,

                mood: selectedMood

              })

          }
        );


      const data =
        await response.json();


      /*
       * Handle server errors.
       */
      if (!response.ok) {

        throw new Error(
          data.error ||
          "The Oracle could not create a reflection."
        );

      }


      /*
       * Display the QVAC response.
       */
      resultTitle.textContent =
        `${month} • ${selectedFocus}`;


      resultReflection.textContent =
        data.reflection ||
        "No reflection was returned.";


      resultTheme.textContent =
        data.theme ||
        "A moment for reflection.";


      resultAction.textContent =
        data.action ||
        "Take one small step that supports your focus.";


      resultQuestion.textContent =
        data.question ||
        "What would you like to understand more clearly?";


      /*
       * Show the result.
       */
      resultCard.classList.remove(
        "hidden"
      );


      status.textContent =
        "Your reflection was generated locally on this device.";


      /*
       * Move the result into view.
       */
      resultCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


    } catch (error) {

      console.error(
        "Oracle request failed:",
        error
      );


      status.textContent =
        error.message ||
        "Something went wrong.";

    } finally {

      /*
       * Restore the button.
       */
      oracleButton.disabled = false;

      buttonText.textContent =
        "Reveal My Reflection";

    }

  }
);