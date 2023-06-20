const { Configuration, OpenAIApi } =  require("openai");
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");

const client = new textToSpeech.TextToSpeechClient();

// Convert text to speech using Google Cloud Text-to-Speech API
const getSpeech = async (text) => {
  const request = {
    input: { text: text},
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3", pitch: 0, speakingRate: 1.1 },
  };

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile("output.mp3", response.audioContent, "binary");
  console.log("Audio content written to file: output.mp3");
};

// Get response from ChatGPT API
const getGPTResponse = async (transcript) => {
  const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: transcript,
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.data.choices[0].text;
};

const getAudioUrl = async (text) => {
  const audio = fs.readFileSync("output.mp3");
  const base64Audio = new Buffer.from(audio).toString("base64");
  const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
  return audioUrl;
}

module.exports = { getSpeech, getGPTResponse, getAudioUrl };
