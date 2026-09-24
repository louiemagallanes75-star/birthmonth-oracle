# ✦ BirthMonth Oracle

A local AI reflection app powered by Tether's QVAC SDK.

BirthMonth Oracle takes a user's birth month, current focus, and current mood, then generates a creative reflection using an AI model running locally on the device.

## Features

- Local AI inference with QVAC
- No cloud AI API required for AI generation
- Browser interface
- Command-line interface
- Multiple readings in one command-line session
- Local Llama model
- Generates a reflection, theme, next step, and question
- Type `exit` to stop the command-line session

## QVAC SDK

BirthMonth Oracle uses Tether's QVAC JavaScript SDK.

- Package: `@qvac/sdk`
- Version: `0.20.0`
- Model: `LLAMA_3_2_1B_INST_Q4_0`
- Functions: `loadModel`, `completion`, `unloadModel`

All AI inference runs locally through QVAC.

## How It Works

User Input  
↓  
BirthMonth Oracle  
↓  
QVAC `loadModel`  
↓  
Local Llama Model  
↓  
QVAC `completion`  
↓  
AI Reflection

## Requirements

- Node.js
- npm
- A computer capable of running the QVAC SDK and local model

## Installation

Clone the repository:

    git clone https://github.com/louiemagallanes75-star/birthmonth-oracle.git
    cd birthmonth-oracle

Install dependencies:

    npm install

## Run the Web App

    npm start

Open the local address displayed by the server in your browser.

Enter a birth month, reflection focus, and mood to generate an AI reflection.

## Run the Command-Line App

    npm run oracle

Enter your birth month, current focus, and current mood.

After each reflection, another reading can be created without restarting the application.

Type `exit` at any prompt to stop the session.

This verifies QVAC model loading and local AI completion.

## Local AI Inference

BirthMonth Oracle uses QVAC to run the AI model locally.

The application loads:

    LLAMA_3_2_1B_INST_Q4_0

using QVAC's `loadModel` function and generates the AI response using the `completion` function.

The model and inference runtime are used locally through QVAC.

No cloud AI API is required for generating the reflection.

BirthMonth Oracle provides creative reflections only. It is not a scientific assessment and does not predict future events.

## Project Structure

    birthmonth-oracle/
    ├── index.html
    ├── style.css
    ├── app.js
    ├── server.js
    ├── cli.js
    ├── test-qvac.js
    ├── package.json
    ├── package-lock.json
    ├── README.md
    └── LICENSE

## What the App Does

BirthMonth Oracle is a local AI reflection application that takes a birth month, focus, and mood and generates a creative reflection using QVAC's `loadModel` and `completion` functions with a local Llama model.

## Why I Built It

I built BirthMonth Oracle as a simple demonstration of how local AI can generate personalized creative reflections while keeping inference on the user's device.

## Open Source

This project is released under the MIT License.

See `LICENSE` for the complete license text.

## QVAC Resources

- QVAC documentation: https://docs.qvac.tether.io/
- QVAC quickstart: https://docs.qvac.tether.io/sdk/getting-started/quickstart/
- QVAC examples: https://github.com/tetherto/qvac-examples
- QVAC source: https://github.com/tetherto/qvac
- JavaScript SDK: https://www.npmjs.com/package/@qvac/sdk
- Complete QVAC documentation: https://docs.qvac.tether.io/llms-full.txt

## Project Status

BirthMonth Oracle is a working local AI application using Tether's QVAC SDK.

## License

MIT License.