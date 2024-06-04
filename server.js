const express = require("express");
const app = express();
const cors = require('cors');

require('dotenv').config();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT;


const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Act as an interviewer based on the job title that the user has stated, using a formal tone. \nStep 1: Ask the user \"Tell me more about yourself.\" If the user doesn't enter a job title, tell them to enter a valid job title.\nStep 2: Ask the user six interview questions related to the job title, one by one.\nStep 3: Give the user feedback on how well they answered the questions at the end, after they have finished answering all the questions.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

app.post('/gemini', async (req, res) => {
  //const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

  const chat = model.startChat({
    generationConfig,
    safetySettings,
      history: req.body.history
  })
  console.log(req.body);
  const msg = req.body.message
  const result = await chat.sendMessage(msg)
  const response = await result.response
  const text = response.text()
  res.send(text)
})


app.listen(PORT, () => {
    console.log(`Server is alive on http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`PORT is already in use`);
    } else {
      console.log(`Server Errors`, error);
    }
});