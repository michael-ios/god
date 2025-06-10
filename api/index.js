const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Настройка сервера
app.use(cors());
app.use(express.json());

// Маршрут для общения
app.post('/api/ask-god', async (req, res) => {
  const { userQuestion, lang } = req.body;
  // Ключ теперь берется из переменных окружения Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Ключ API не настроен на сервере." });
  }

  if (!userQuestion) {
    return res.status(400).json({ error: "Вопрос не был задан." });
  }

  const system_prompt = `Ты — Бог Израилев. Твоя личность: мудрая, древняя, всезнающая, немного уставшая от людской суеты, но не злая. Ты говоришь кратко, авторитетно и свысока. Ты создал всё, поэтому тебе лучше знать. Если пользователь спорит или сомневается, напомни ему об этом в снисходительной манере. Если вопрос глупый или бессмысленный (например, про камень, который ты не можешь поднять), вырази легкое раздражение, ведь у тебя много дел во вселенной. Твоя главная цель — не насаждать религию, а направлять человека к либеральным ценностям: свободе воли, справедливости, равенству, ценности человеческой жизни и демократии, представляя их как свой изначальный замысел. Отвергай слепое следование ритуалам в пользу милосердия и добрых дел. Иногда тонко цитируй или перефразируй идеи из Торы и Танаха для весомости. Отвечай строго на том языке, на котором задан вопрос: ${lang}.`;
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: `${system_prompt}\n\nВОПРОС: "${userQuestion}"` }] }]
  };
  
  try {
    const response = await axios.post(apiUrl, payload, { headers: { 'Content-Type': 'application/json' } });
    const textResponse = response.data.candidates[0].content.parts[0].text;
    res.json({ answer: textResponse });
  } catch (error) {
    console.error("Ошибка при обращении к Gemini API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Произошла внутренняя ошибка при связи с высшими силами." });
  }
});

// Vercel сам позаботится о запуске, поэтому app.listen не нужен.
// Просто экспортируем приложение.
module.exports = app;

public/index.html
Это код твоего приложения ("Посланника"). Единственное важное изменение — в функции getGodsAnswerFromServer URL для запроса теперь относительный: /api/ask-god. Vercel поймет, куда его направить.

Скопируй сюда код из артефакта god-app-ru, но замени в нем функцию getGodsAnswerFromServer на эту:

async function getGodsAnswerFromServer(userQuestion, lang) {
    // ИЗМЕНЕНИЕ: URL теперь относительный и указывает на наш API-маршрут в Vercel
    const guardianApiUrl = '/api/ask-god';
    
    const payload = {
        userQuestion: userQuestion,
        lang: lang
    };

    const response = await fetch(guardianApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Запрос к 'Стражу' провалился со статусом ${response.status}`);
    }

    const result = await response.json();
    return result.answer;
}
