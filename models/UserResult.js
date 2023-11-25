const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userQuizResultSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: "Quiz"
    },
    UserAttempted: [{
        question: { type: Schema.Types.ObjectId, ref: "Quiz.questions" },
        isCorrect: Boolean
    }],
    TotalQuestions: { type: Number, default: 0 },
    TotalAttempted: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("QuizResult", userQuizResultSchema);
