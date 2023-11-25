const { default: mongoose } = require('mongoose')
const quizModel = require('../../models/Quiz')
const UserResultModel = require('../../models/UserResult')

const createQuiz = async (req, res) => {
    try {
        const {
            quizName, quizSubTitle,
            questions,
            isChecked
        } = req.body

        const { userId } = req.user

        const newQuiz = await quizModel.create({
            user: userId,
            quizName, quizSubTitle,
            questions,
            isChecked
        })

        console.log(questions)

        res.status(201).json({ quiz: newQuiz })
        // res.status(201).json({ quiz: 'newQuiz' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getAllQuizByUser = async (req, res) => {
    try {
        const { userId } = req.user
        const quiz = await quizModel.find({ user: userId })

        res.status(200).json({ quiz })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params
        const {
            quizName, quizSubTitle,
            questions,
            isChecked
        } = req.body

        if (!id) return res.status(400).json({ message: 'Quiz id not found' })
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Quiz id is not valid' })

        await quizModel.findByIdAndUpdate(id, {
            quizName, quizSubTitle,
            questions,
            isChecked
        }, { new: true })

        res.status(201).json({ message: 'Quiz updated successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) return res.status(400).json({ message: 'Quiz id not found' })
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Quiz id is not valid' })

        await quizModel.findByIdAndDelete(id)
        res.status(201).json({ message: 'Quiz deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const ToggleQuizAvailability = async (req, res) => {
    try {
        const { id } = req.params
        const { isChecked } = req.body

        if (!id) return res.status(400).json({ message: 'Quiz id not found' })
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Quiz id is not valid' })

        const { _id, isChecked: newIsChecked } = await quizModel.findByIdAndUpdate(id, {
            isChecked
        }, { new: true })

        res.status(201).json({ quizId: _id, isChecked: newIsChecked })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getQuizById = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.user

        if (!id) return res.status(400).json({ message: 'Empty Quiz id' })
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Quiz id is not valid' })

        let user_result = await UserResultModel.findOne({ user: userId, quiz: id })
        var quiz = [];

        if (user_result) {
            // since user result already exists, this means user has already attempted and submited some questions.
            // so we will not be sending those questions again.
            // Those question are stored in user_result.UserAttempted array
            const { UserAttempted } = user_result
            const attemptedQuestions = UserAttempted.map(({ question }) => question)
            quiz = await quizModel.findById(id)
            quiz.questions = quiz.questions.filter(({ _id }) => !attemptedQuestions.includes(_id))
        }
        else { quiz = await quizModel.findById(id) }

        res.status(200).json({ quiz })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const submitQuestion = async (req, res) => {
    try {
        const { id: quiz } = req.params
        const { userId: user } = req.user
        const { isCorrect, question } = req.body

        if (!quiz) return res.status(400).json({ message: 'Empty Quiz id' })
        if (!mongoose.Types.ObjectId.isValid(quiz)) return res.status(400).json({ message: 'Quiz id is not valid' })

        console.log('Check 1')

        const existingQuiz = await quizModel.findById(quiz)

        console.log('Check 2')
        if (!existingQuiz.isChecked)
            return res.status(200).json({ status: false, message: 'Quiz not found' })

        console.log('Check 3')
        const user_result = await UserResultModel.findOne({ user, quiz })
        if (!user_result) {
            const new_user_result = await UserResultModel.create({
                user, quiz,
                UserAttempted: [{ question, isCorrect }]
            })
            console.log(new_user_result, '\n', new_user_result.UserAttempted)
            res.status(201).json({ status: true, user_result, existingQuiz })
        } else {
            const new_user_result = await UserResultModel.findByIdAndUpdate(user_result._id, {
                $push: { UserAttempted: { question, isCorrect } }
            }, { new: true })
            console.log(new_user_result, '\n', new_user_result.UserAttempted)
            res.status(201).json({ status: true, user_result, existingQuiz })
        }

        // res.status(201).json({ message: 'Question submitted successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getQuizResult = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.user

        if (!id) return res.status(400).json({ message: 'Empty Quiz id' })
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Quiz id is not valid' })

        const { questions, user, quizName } = await quizModel.findById(id).select('questions user quizName').lean()

        if (!user.equals(userId))
            return res.status(400).json({ status: false, message: 'You are not authorized to see this result' })

        const quizResults = await UserResultModel.find({ quiz: id }).populate({ path: 'user', select: 'username mail _id' })

        res.status(200).json({ length: questions.length, quizName, results: quizResults })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createQuiz,
    getAllQuizByUser,
    updateQuiz,
    deleteQuiz,
    ToggleQuizAvailability,
    getQuizById,
    submitQuestion,
    getQuizResult
}