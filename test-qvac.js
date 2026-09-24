import {
  loadModel,
  completion,
  unloadModel,
  LLAMA_3_2_1B_INST_Q4_0
} from "@qvac/sdk";

console.log("========================================");
console.log("       BIRTHMONTH ORACLE / QVAC TEST");
console.log("========================================");
console.log("");

console.log("Loading QVAC model...");

const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  onProgress: (progress) => {
    console.log("Loading:", progress);
  }
});

console.log("");
console.log("QVAC model loaded successfully.");
console.log("Model ID:", modelId);
console.log("");
console.log("Generating local AI response...");

const response = await completion({
  modelId,
  history: [
    {
      role: "user",
      content:
        "Give me a short, friendly oracle message for someone starting a new month."
    }
  ]
});

const text = await response.text;

console.log("");
console.log("AI RESPONSE:");
console.log(text);
console.log("");

await unloadModel({ modelId });

console.log("QVAC model unloaded.");
console.log("");
console.log("QVAC TEST COMPLETE.");