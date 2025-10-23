const app = require('express');
const { login, signup } = require('../controllers/authController');
const { getAllUsers, createUser } = require('../controllers/userController');

const router = app.Router();

router.post('/login', login);
router.post('/signup', signup);

router.route('/').get(getAllUsers).post(createUser);

module.exports = router;
