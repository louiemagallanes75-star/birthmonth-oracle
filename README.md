# BirthMonth Oracle ✦

A local AI reflection app powered by Tether's QVAC SDK.

BirthMonth Oracle takes a user's birth month, current focus, and current mood, then generates a creative reflection using AI running locally on the device.

## Features

- Local AI inference with QVAC
- No cloud AI API required
- Browser interface
- Command Prompt interface
- Multiple readings in one Command Prompt session
- Type `exit` to stop the session
- Generates a reflection, theme, next step, and question

## QVAC SDK

- Package: `@qvac/sdk`
- Version: `0.20.0`
- Model: `LLAMA_3_2_1B_INST_Q4_0`
- Functions used: `loadModel`, `completion`, `unloadModel`

All AI inference runs locally through QVAC.

## Installation

Requirements:

- Node.js
- npm

Clone the repository:

    git clone https://github.com/louiemagallanes75-star/birthmonth-oracle.git
    cd birthmonth-oracle
    npm install

## Run the Web App

    npm start

Open the local address shown by the server.

## Run the Command Prompt App

    npm run oracle

Enter your birth month, current focus, and current mood.

After each reflection, another entry can be created without restarting the application.

Type `exit` at any prompt to stop the session.

## Test QVAC

    npm run test:qvac

This verifies QVAC model loading and local completion.

## How It Works

User Input  
↓  
Local Node.js App  
↓  
QVAC `loadModel`  
↓  
QVAC `completion`  
↓  
Local AI Reflection

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

## Note

BirthMonth Oracle provides creative reflections only. It is not a scientific assessment or a prediction of future events.

## License

MIT License.

## QVAC Functions

This app uses QVAC's `loadModel` to load the local AI model and `completion` to generate BirthMonth Oracle responses on-device.

## Project Status

BirthMonth Oracle is ready for local QVAC testing and use.
