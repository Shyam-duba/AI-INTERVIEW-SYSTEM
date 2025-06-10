const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Add user
const addUser = async (username, email, password) => {
  const hashedPassword = await require('bcryptjs').hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

// Find user by username
const findUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
  return result.rows[0];
};
const findUserById = async (id) =>{
  const result = await pool.query('SELECT * FROM users WHERE id=$1',[id])
  return result.rows[0];
}

const addInterview = async (id, duration, role=NaN) =>{
  const interviewId = uuidv4(); // example: '550e8400-e29b-41d4-a716-446655440000'
  const result = await pool.query(
    'INSERT INTO interviews (interview_id, role, duration,user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [interviewId,role,duration,id]
  )
  // console.log(result.rows[0])

  return result.rows[0];
}
// services/userService.js
const updateUserDetails = async (name, email, old_name) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE name = $3 RETURNING *',
    [name, email, old_name]
  );
  return result.rows[0];
};


module.exports = { addUser, findUserByUsername,updateUserDetails, findUserById, addInterview };
