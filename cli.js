import readline from "readline";

import {
  loadModel,
  completion,
  unloadModel,
  LLAMA_3_2_1B_INST_Q4_0
} from "@qvac/sdk";


let modelId = null;


/*
 * Command Prompt interface.
 */
const rl =
  readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


/*
 * Ask a question.
 */
function ask(question) {

  return new Promise(
    resolve => {

      rl.question(
        question,
        answer => {

          resolve(
            answer.trim()
          );

        }
      );

    }
  );

}


/*
 * Check whether the user wants
 * to exit the program.
 */
function isExit(value) {

  return value
    .trim()
    .toLowerCase() === "exit";

}


/*
 * Load QVAC only once.
 */
async function loadQVAC() {

  if (modelId) {
    return;
  }


  console.log("");
  console.log("Loading QVAC local AI...");
  console.log("");


  modelId =
    await loadModel({

      modelSrc:
        LLAMA_3_2_1B_INST_Q4_0,

      onProgress:
        progress => {

          if (
            progress.percentage !== undefined
          ) {

            process.stdout.write(
              `\rModel loading: ${progress.percentage}%`
            );

          }

        }

    });


  console.log("");
  console.log("");

  console.log(
    "QVAC model loaded."
  );

  console.log("");

}


/*
 * Generate one reflection.
 */
async function generateReflection(
  birthMonth,
  focus,
  mood
) {

  const prompt = `
You are BirthMonth Oracle.

Create a short personal reflection.

USER:
Birth month: ${birthMonth}
Focus: ${focus}
Mood: ${mood}

Return EXACTLY these four labeled sections:

REFLECTION:
Write 1 or 2 natural sentences directly to the user.

THEME:
Write only 2 to 5 words.

NEXT STEP:
Write exactly one practical sentence.

QUESTION:
Write exactly one thoughtful question.

IMPORTANT:

- Use the labels exactly as written.
- Put each label on its own line.
- Never put two labels on the same line.
- Never repeat a label.
- Do not add any other labels.
- Do not add text before REFLECTION.
- Do not add text after QUESTION.
- Speak directly to the user using "you" and "your".
- Never speak as if you personally have a birth month.
- Never say "I've been curious".
- Never say "I think" or "I feel".
- Do not mention astrology.
- Do not predict the future.
- Do not claim supernatural powers.
- Do not claim the birth month scientifically determines personality.
- Use the birth month only as a creative reflection prompt.
- Connect the response to the selected focus and mood.
- Keep the writing warm, natural, concise, and practical.
- The NEXT STEP must be realistically actionable.
- The QUESTION should encourage personal reflection.

This is a creative reflection, not a prediction or scientific assessment.
`;


  console.log(
    "Generating reflection with QVAC..."
  );

  console.log("");


  const response =
    await completion({

      modelId,

      history: [

        {
          role: "user",
          content: prompt
        }

      ]

    });


  const text =
    await response.text;


  return parseReflection(
    text,
    birthMonth,
    focus,
    mood
  );

}


/*
 * Parse QVAC output.
 */
function parseReflection(
  text,
  birthMonth,
  focus,
  mood
) {

  const result = {

    reflection: "",

    theme: "",

    action: "",

    question: ""

  };


  if (!text) {

    return result;

  }


  let normalized =
    text
      .replace(/\r/g, " ")
      .replace(/\*\*/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();


  normalized =
    normalized
      .replace(
        /\s*REFLECTION\s*:/gi,
        "\nREFLECTION:"
      )
      .replace(
        /\s*THEME\s*:/gi,
        "\nTHEME:"
      )
      .replace(
        /\s*NEXT\s+STEP\s*:/gi,
        "\nNEXT STEP:"
      )
      .replace(
        /\s*QUESTION\s*:/gi,
        "\nQUESTION:"
      );


  const pattern =
    /(REFLECTION|THEME|NEXT\s+STEP|QUESTION)\s*:\s*([\s\S]*?)(?=\s+(?:REFLECTION|THEME|NEXT\s+STEP|QUESTION)\s*:|$)/gi;


  const matches =
    [...normalized.matchAll(pattern)];


  for (const match of matches) {

    const label =
      match[1]
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();


    const value =
      cleanValue(
        match[2]
      );


    if (
      label === "REFLECTION" &&
      !result.reflection
    ) {

      result.reflection =
        value;

    }


    if (
      label === "THEME" &&
      !result.theme
    ) {

      result.theme =
        value;

    }


    if (
      label === "NEXT STEP" &&
      !result.action
    ) {

      result.action =
        value;

    }


    if (
      label === "QUESTION" &&
      !result.question
    ) {

      result.question =
        value;

    }

  }


  /*
   * Fallbacks.
   */
  if (!result.reflection) {

    result.reflection =
      "Take a moment to notice where you are and what matters most to you right now.";

  }


  if (!result.theme) {

    result.theme =
      `${focus} reflection`;

  }


  if (!result.action) {

    result.action =
      `Take one small step that supports your ${focus.toLowerCase()} focus today.`;

  }


  if (!result.question) {

    result.question =
      `What would you like to understand more clearly about your ${focus.toLowerCase()} right now?`;

  }


  return result;

}


/*
 * Clean section values.
 */
function cleanValue(
  value
) {

  return value
    .replace(
      /^[-•*]\s*/,
      ""
    )
    .replace(
      /^["']+/,
      ""
    )
    .replace(
      /["']+$/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
 * Display one result.
 */
function displayResult(
  result
) {

  console.log("");

  console.log(
    "========================================"
  );

  console.log(
    "             YOUR REFLECTION"
  );

  console.log(
    "========================================"
  );

  console.log("");


  console.log(
    "REFLECTION:"
  );

  console.log(
    result.reflection
  );

  console.log("");


  console.log(
    "THEME:"
  );

  console.log(
    result.theme
  );

  console.log("");


  console.log(
    "NEXT STEP:"
  );

  console.log(
    result.action
  );

  console.log("");


  console.log(
    "QUESTION:"
  );

  console.log(
    result.question
  );

  console.log("");


  console.log(
    "========================================"
  );

  console.log(
    "Generated locally with QVAC."
  );

  console.log(
    "========================================"
  );

  console.log("");

}


/*
 * Get one complete entry.
 */
async function getEntry() {

  console.log(
    "----------------------------------------"
  );

  console.log(
    "NEW ORACLE READING"
  );

  console.log(
    'Type "exit" at any time to quit.'
  );

  console.log(
    "----------------------------------------"
  );

  console.log("");


  const birthMonth =
    await ask(
      "Birth month: "
    );


  if (isExit(birthMonth)) {
    return null;
  }


  const focus =
    await ask(
      "Current focus: "
    );


  if (isExit(focus)) {
    return null;
  }


  const mood =
    await ask(
      "Current mood: "
    );


  if (isExit(mood)) {
    return null;
  }


  if (
    !birthMonth ||
    !focus ||
    !mood
  ) {

    console.log("");

    console.log(
      "Please provide all three values."
    );

    console.log("");

    return "retry";

  }


  return {

    birthMonth,

    focus,

    mood

  };

}


/*
 * Main CLI program.
 */
async function main() {

  console.clear();


  console.log(
    "========================================"
  );

  console.log(
    "        ✦ BIRTHMONTH ORACLE ✦"
  );

  console.log(
    "========================================"
  );

  console.log("");

  console.log(
    "LOCAL AI COMMAND PROMPT EDITION"
  );

  console.log(
    "Powered by Tether's QVAC SDK"
  );

  console.log("");

  console.log(
    "Create multiple reflections in one session."
  );

  console.log(
    'Type "exit" at any prompt to stop.'
  );

  console.log("");


  try {

    /*
     * Keep the program running until
     * the user types exit.
     */
    while (true) {

      const entry =
        await getEntry();


      /*
       * Exit requested.
       */
      if (entry === null) {

        console.log("");

        console.log(
          "Exiting BirthMonth Oracle..."
        );

        break;

      }


      /*
       * Missing input.
       * Start another entry.
       */
      if (entry === "retry") {

        continue;

      }


      /*
       * Load QVAC once.
       *
       * Every following reading reuses
       * the already-loaded local model.
       */
      await loadQVAC();


      /*
       * Generate this reading.
       */
      const result =
        await generateReflection(

          entry.birthMonth,

          entry.focus,

          entry.mood

        );


      /*
       * Display the result.
       */
      displayResult(
        result
      );

    }


  } catch (error) {

    console.error("");

    console.error(
      "QVAC error:"
    );

    console.error(
      error.message ||
      error
    );

    console.error("");

  } finally {

    /*
     * Unload QVAC once when the user
     * exits the entire CLI session.
     */
    if (modelId) {

      try {

        console.log(
          "Unloading QVAC model..."
        );


        await unloadModel({
          modelId
        });


        console.log(
          "QVAC model unloaded."
        );

      } catch (error) {

        console.error(
          "Could not unload QVAC model."
        );

      }

    }


    rl.close();

  }

}


main();