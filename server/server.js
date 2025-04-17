import experss from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';
import mammoth from 'mammoth';
// import pdf from 'pdf-parse';



// api AI
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = experss();
app.use(cors());
app.use(experss.json());


// Đọc file .docx
const docxPath = './fileTrain.docx';

async function extractDocxContent() {
  const dataBuffer = fs.readFileSync(docxPath);
  const result = await mammoth.extractRawText({ buffer: dataBuffer });
  return result.value; // Trả về nội dung văn bản từ file .docx
}

let docxContent = ""; // Khởi tạo biến để lưu nội dung file .docx
(async () => {
  docxContent = await extractDocxContent(); // Gán nội dung file .docx sau khi đọc xong
})();

app.get('/', (req, res) => {
  res.status(200).send({ 
    message: 'Hello from MyChat!' });
});

app.post('/', async (req, res) => {
  

  const prompt = req.body.prompt;
  // console.log(prompt);
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [
      {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": `trả lời câu hỏi sau đây dựa vào nội dung trong file: ${docxContent}`
          }
        ]
      },  
        {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": `${prompt}`
          }
        ]
      }
    ],
    text: {
      "format": {
        "type": "text"
      }
    },
    reasoning: {},
    tools: [],
    temperature: 1,
    max_output_tokens: 2048,
    top_p: 1,
    store: true
  });

  res.status(200).send({
    bot: response.output_text,
  });
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'));