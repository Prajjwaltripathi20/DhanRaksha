const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    contributeToGoal,
    deleteGoal
} = require('../controllers/goalController');

router.use(protect);

router.route('/')
    .get(getGoals)
    .post(createGoal);

router.route('/:id')
    .get(getGoal)
    .put(updateGoal)
    .delete(deleteGoal);

router.post('/:id/contribute', contributeToGoal);

module.exports = router;
