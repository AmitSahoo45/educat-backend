const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    quizName: {
        type: String,
        required: true,
    },
    quizSubTitle: {
        type: String,
        required: true,
    },
    questions: [{
        quizQuestion: {
            type: String,
            required: true,
        },
        quizOptions: [{
            index: Number,
            option: String,
            isCorrect: Boolean,
        }]
    }],
    isChecked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);

// quizQuestion: {
//     type: String,
//     required: true,
// },
// quizOptions: [{
//     index: Number,
//     option: String,
//     isCorrect: Boolean,
// }],