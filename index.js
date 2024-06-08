const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const windowSize = 10;
let storedNumbers = [];

const fetchNumbersFromApi = async (url, token) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching numbers from API');
  }
};

const addNewNumbers = (numbers) => {
  const newNumbers = numbers.filter((num) => !storedNumbers.includes(num));
  storedNumbers.push(...newNumbers);

  if (storedNumbers.length > windowSize) {
    storedNumbers = storedNumbers.slice(-windowSize);
  }
};

const calculateAverage = () => {
  if (storedNumbers.length === 0) {
    return 0;
  }
  const sum = storedNumbers.reduce((acc, num) => acc + num, 0);
  return sum / storedNumbers.length;
};

app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;
  const validIds = ['p', 'f', 'e', 'r'];

  if (!validIds.includes(numberId)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const apiUrl = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibo',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/rand',
  }[numberId];

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3ODI2ODgwLCJpYXQiOjE3MTc4MjY1ODAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImQ5ZDJiNmI1LTg0N2ItNDEyNy05ODU3LTcyN2UxYWEwYWM3YiIsInN1YiI6ImFudHJpa3NoMTYuYkBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJhamF5S3VtYXJHYXJnRW5naW5lZXJpbmdDb2xsZWdlIiwiY2xpZW50SUQiOiJkOWQyYjZiNS04NDdiLTQxMjctOTg1Ny03MjdlMWFhMGFjN2IiLCJjbGllbnRTZWNyZXQiOiJpVGpHeU9jVXhrV3ZwRHZJIiwib3duZXJOYW1lIjoiQW50cmlrc2hfQmFuc2FsIiwib3duZXJFbWFpbCI6ImFudHJpa3NoMTYuYkBnbWFpbC5jb20iLCJyb2xsTm8iOiIyMTAwMjcxNjQwMDA5In0.2cgjvMTvBYorSV08GnhmuCXmcBlnmNS40dvDE3DuqvQ'; // Replace with your actual token

  try {
    const numbers = await fetchNumbersFromApi(apiUrl, token);
    addNewNumbers(numbers);

    const avg = calculateAverage();
    const windowPrevState = storedNumbers.slice(0, -numbers.length);
    const windowCurrState = storedNumbers.slice(-windowSize);

    res.json({
      windowPrevState,
      windowCurrState,
      numbers,
      avg: avg.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching numbers' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
