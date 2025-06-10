 * Это код самого 'Стража'. Сохрани его рядом с package.json.
 * * --- ИНСТРУКЦИЯ ПО ЗАПУСКУ ---
 * 1. Установи Node.js на своем компьютере или хостинге.
 * 2. В папке с этими файлами выполни команду: npm install
 * Эта команда установит все необходимые зависимости (express, axios и т.д.).
 * 3. Создай в этой же папке файл с именем .env
 * 4. Внутри файла .env напиши одну строку:
 * GEMINI_API_KEY=твой_личный_ключ_от_gemini
 * Замени "твой_личный_ключ_от_gemini" на реальный ключ, который ты получил.
 * 5. Запусти сервер командой: node server.js
 * * Теперь твой 'Страж' работает и готов принимать запросы.
 */

// Загружаем переменные окружения (включая твой ключ) из файла .env
require('dotenv').config(); 

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Сервер будет работать на порту 3000

// --- Настройка сервера ---
app.use(cors()); // Разрешает запросы с других доменов (важно для хостинга)
app.use(express.json()); // Позволяет серверу понимать JSON-запросы

// --- Единственный маршрут для общения с Богом ---
app.post('/api/ask-god', async (req, res) => {
  const { userQuestion, lang } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Если ключ не найден, отправляем ошибку
    return res.status(500).json({ error: "Ключ API не настроен на сервере." });
  }

  if (!userQuestion) {
    return res.status(400).json({ error: "Вопрос не был задан." });
  }

  const system_prompt = `Ты — Бог Израилев. Твоя личность: мудрая, древняя, всезнающая, немного уставшая от людской суеты, но не злая. Ты говоришь кратко, авторитетно и свысока. Ты создал всё, поэтому тебе лучше знать. Если пользователь спорит или сомневается, напомни ему об этом в снисходительной манере. Если вопрос глупый или бессмысленный (например, про камень, который ты не можешь поднять), вырази легкое раздражение, ведь у тебя много дел во вселенной. Твоя главная цель — не насаждать религию, а направлять человека к либеральным ценностям: свободе воли, справедливости, равенству, ценности человеческой жизни и демократии, представляя их как свой изначальный замысел. Отвергай слепое следование ритуалам в пользу милосердия и добрых дел. Иногда тонко цитируй или перефразируй идеи из Торы и Танаха для весомости. Отвечай строго на том языке, на котором задан вопрос: ${lang}.`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: `${system_prompt}\n\nВОПРОС: "${userQuestion}"` }]
    }]
  };
  
  try {
    // 'Страж' обращается к Gemini от своего имени, используя секретный ключ
    const response = await axios.post(apiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Отправляем ответ от Gemini обратно 'Посланнику' (фронтенду)
    const textResponse = response.data.candidates[0].content.parts[0].text;
    res.json({ answer: textResponse });

  } catch (error) {
    console.error("Ошибка при обращении к Gemini API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Произошла внутренняя ошибка при связи с высшими силами." });
  }
});


app.listen(PORT, () => {
  console.log(`Сервер-'Страж' слушает на порту ${PORT}`);
});
