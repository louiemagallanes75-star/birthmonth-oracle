import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  loadModel,
  completion,
  unloadModel,
  LLAMA_3_2_1B_INST_Q4_0
} from "@qvac/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

let modelId = null;
let loadingPromise = null;


/*
 * Load QVAC once and reuse the model.
 */
async function getModel() {

  if (modelId) {
    return modelId;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  console.log("");
  console.log("Loading QVAC model...");

  loadingPromise = loadModel({

    modelSrc:
      LLAMA_3_2_1B_INST_Q4_0,

    onProgress: (progress) => {

      console.log(
        "Model loading:",
        progress
      );

    }

  });

  try {

    modelId =
      await loadingPromise;

    console.log(
      "QVAC model loaded:",
      modelId
    );

    return modelId;

  } finally {

    loadingPromise = null;

  }

}


/*
 * Send JSON response.
 */
function sendJson(
  res,
  status,
  data
) {

  res.writeHead(
    status,
    {
      "Content-Type":
        "application/json",

      "Access-Control-Allow-Origin":
        "*"
    }
  );

  res.end(
    JSON.stringify(data)
  );

}


/*
 * Serve frontend files.
 */
function serveFile(
  res,
  filePath
) {

  const extension =
    path.extname(filePath);

  const contentTypes = {

    ".html":
      "text/html",

    ".css":
      "text/css",

    ".js":
      "text/javascript"

  };

  fs.readFile(
    filePath,
    (error, data) => {

      if (error) {

        res.writeHead(404);

        res.end(
          "File not found"
        );

        return;

      }

      res.writeHead(
        200,
        {
          "Content-Type":
            contentTypes[
              extension
            ] ||
            "application/octet-stream"
        }
      );

      res.end(data);

    }
  );

}


/*
 * Generate a reflection using
 * QVAC local inference.
 */
async function createReflection(
  birthMonth,
  focus,
  mood
) {

  const model =
    await getModel();


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


  console.log("");
  console.log(
    "Generating local reflection..."
  );


  const response =
    await completion({

      modelId: model,

      history: [

        {
          role: "user",
          content: prompt
        }

      ]

    });


  const text =
    await response.text;


  console.log("");
  console.log(
    "RAW QVAC RESPONSE:"
  );

  console.log(text);

  console.log("");


  return parseReflection(
    text,
    birthMonth,
    focus,
    mood
  );

}


/*
 * Parse QVAC output.
 *
 * This parser handles both:
 *
 * REFLECTION: ...
 * THEME: ...
 * NEXT STEP: ...
 * QUESTION: ...
 *
 * and responses where the small model
 * accidentally puts everything on one line.
 */
function parseReflection(
  text,
  birthMonth,
  focus,
  mood
) {

  const result = {

    birthMonth,

    focus,

    mood,

    reflection: "",

    theme: "",

    action: "",

    question: "",

    rawText: text

  };


  if (!text) {
    return result;
  }


  /*
   * Normalize the response.
   */
  let normalized =
    text
      .replace(/\r/g, " ")
      .replace(/\*\*/g, "")
      .replace(/\r\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();


  /*
   * Make sure each known label begins
   * a new logical section.
   */
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
      )
      .trim();


  /*
   * Extract the four sections.
   */
  const sectionPattern =
    /(REFLECTION|THEME|NEXT\s+STEP|QUESTION)\s*:\s*([\s\S]*?)(?=\s+(?:REFLECTION|THEME|NEXT\s+STEP|QUESTION)\s*:|$)/gi;


  const matches =
    [...normalized.matchAll(
      sectionPattern
    )];


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
   * Remove accidental labels from
   * values if the model duplicated them.
   */
  result.reflection =
    removeLabels(
      result.reflection
    );

  result.theme =
    removeLabels(
      result.theme
    );

  result.action =
    removeLabels(
      result.action
    );

  result.question =
    removeLabels(
      result.question
    );


  /*
   * Fallback values.
   */
  if (!result.reflection) {

    result.reflection =
      "This is a useful moment to pause, notice where you are, and consider what matters most to you right now.";

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


  /*
   * Keep the theme short if the model
   * returned an unexpectedly long sentence.
   */
  result.theme =
    shortenTheme(
      result.theme
    );


  /*
   * Remove accidental quotation marks.
   */
  result.reflection =
    cleanValue(
      result.reflection
    );

  result.theme =
    cleanValue(
      result.theme
    );

  result.action =
    cleanValue(
      result.action
    );

  result.question =
    cleanValue(
      result.question
    );


  return result;

}


/*
 * Remove known section labels from
 * accidentally polluted model output.
 */
function removeLabels(
  value
) {

  if (!value) {
    return "";
  }

  return value
    .replace(
      /\bREFLECTION\s*:/gi,
      ""
    )
    .replace(
      /\bTHEME\s*:/gi,
      ""
    )
    .replace(
      /\bNEXT\s+STEP\s*:/gi,
      ""
    )
    .replace(
      /\bQUESTION\s*:/gi,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
 * Keep theme concise.
 */
function shortenTheme(
  value
) {

  if (!value) {
    return "";
  }


  const words =
    value
      .split(/\s+/)
      .filter(Boolean);


  if (words.length <= 6) {
    return value;
  }


  return words
    .slice(0, 6)
    .join(" ")
    .replace(/[.,!?;:]+$/, "");

}


/*
 * Clean extracted values.
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
 * Handle the Oracle API request.
 */
function handleOracle(
  req,
  res
) {

  let body = "";


  req.on(
    "data",
    chunk => {

      body += chunk;

    }
  );


  req.on(
    "end",
    async () => {

      try {

        const data =
          JSON.parse(body);


        const birthMonth =
          data.birthMonth;

        const focus =
          data.focus;

        const mood =
          data.mood;


        if (
          !birthMonth ||
          !focus ||
          !mood
        ) {

          sendJson(
            res,
            400,
            {
              error:
                "Please complete your birth month, focus, and mood."
            }
          );

          return;

        }


        const result =
          await createReflection(
            birthMonth,
            focus,
            mood
          );


        sendJson(
          res,
          200,
          result
        );


      } catch (error) {

        console.error(
          "BirthMonth Oracle error:",
          error
        );


        sendJson(
          res,
          500,
          {
            error:
              error.message ||
              "Something went wrong while creating your reflection."
          }
        );

      }

    }
  );

}


/*
 * Create HTTP server.
 */
const server =
  http.createServer(
    (req, res) => {


      /*
       * QVAC API endpoint.
       */
      if (
        req.method === "POST" &&
        req.url === "/api/oracle"
      ) {

        handleOracle(
          req,
          res
        );

        return;

      }


      /*
       * Frontend.
       */
      if (
        req.method === "GET"
      ) {

        let requestedPath =
          req.url === "/"
            ? "/index.html"
            : req.url;


        requestedPath =
          requestedPath
            .split("?")[0];


        const filePath =
          path.join(
            __dirname,
            requestedPath
          );


        serveFile(
          res,
          filePath
        );

        return;

      }


      res.writeHead(404);

      res.end(
        "Not found"
      );

    }
  );


/*
 * Start server.
 */
server.listen(
  PORT,
  () => {

    console.log("");

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
      `Open: http://localhost:${PORT}`
    );

    console.log("");

    console.log(
      "QVAC local inference is ready."
    );

    console.log("");

  }
);


/*
 * Clean shutdown.
 */
process.on(
  "SIGINT",
  async () => {

    console.log(
      "\nShutting down..."
    );


    if (modelId) {

      try {

        await unloadModel({
          modelId
        });

        console.log(
          "QVAC model unloaded."
        );

      } catch {}

    }


    server.close();

    process.exit(0);

  }
);