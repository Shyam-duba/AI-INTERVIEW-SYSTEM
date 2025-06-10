// Example usage
const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./config/db');
const authroutes = require('./routes/Auth');
const updateroutes = require('./routes/ProfileUpdates');
const interviewroutes = require('./routes/InterviewService');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api',authroutes)
app.use('/api/updates', updateroutes);
app.use('/api/interviews', interviewroutes);
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
