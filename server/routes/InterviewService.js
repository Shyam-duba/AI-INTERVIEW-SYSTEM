const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewaare/AuthMiddleware");
const {addInterview, endInterview, getReportById} = require("../controllers/userController")

/*
GET /api/<>-interview
*/
router.post("/create-interview",authMiddleware, async (req, res) => {
   const {user_id,duration,role} = req.body;

   const result = await addInterview(user_id, duration, role);

   console.log(result)

   res.status(200).json({ message: "Interview started  successfully", 
    interview_id:result['interview_id']});
   
});

/*
GET /api/start-interview
*/
router.post("/start-interview", authMiddleware, (req, res) => {
    res.send("Hello World");
});


/*
GET /api/end-interview
*/
router.post("/end-interview", authMiddleware, endInterview);


router.post("/get-report", getReportById);
module.exports = router;
