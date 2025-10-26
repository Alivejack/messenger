const app = require('express');
const {
  login,
  signup,
  protect,
  logout,
} = require('../controllers/authController');
const { getAllUsers, createUser } = require('../controllers/userController');

const router = app.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);

router.use(protect);

router.route('/').get(getAllUsers).post(createUser);

module.exports = router;
