import express from 'express';
import multer from 'multer';
import fs from 'fs';

export const imageRouter = express.Router();

const upload = multer({
  dest: 'uploads/'
});

imageRouter.post(
  '/analyze',
  upload.single('image'),
  async (req, res) => {
    try {
      const imageBase64 = fs.readFileSync(
        req.file.path,
        'base64'
      );

      const response = await fetch(
        'http://localhost:11434/api/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llava',
            prompt:
              '음식 이름과 예상 영양성분을 알려줘.',
            images: [imageBase64],
            stream: false
          })
        }
      );

      const data = await response.json();

      res.json(data);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: '이미지 분석 실패'
      });
    }
  }
);