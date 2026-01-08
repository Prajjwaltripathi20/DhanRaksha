const express = require('express');
const router = express.Router();
const {
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    transferBetweenAccounts
} = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getAccounts)
    .post(createAccount);

router.post('/transfer', transferBetweenAccounts);

router.route('/:id')
    .get(getAccount)
    .put(updateAccount)
    .delete(deleteAccount);

module.exports = router;
