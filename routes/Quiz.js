const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
    createQuiz, getAllQuizByUser,
    deleteQuiz, updateQuiz, ToggleQuizAvailability,
    getQuizById, submitQuestion
} = require("../controllers/quiz/quiz");

router.post("/create", auth, createQuiz);
router.get("/all", auth, getAllQuizByUser);
router.get("/:id", auth, getQuizById);
router.patch("/update/:id", auth, updateQuiz);
router.delete("/delete/:id", auth, deleteQuiz);

router.patch("/update/:id/activity", auth, ToggleQuizAvailability);

router.patch("/:id/submit", auth, submitQuestion);

module.exports = router;