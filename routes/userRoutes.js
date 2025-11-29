const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to create a new user
router.post('/users', userController.createUser); // POST /api/users
router.get('/users', userController.getAllUsers); // GET /api/users
router.get('/users/search', userController.searchUsers); // GET /api/user/search
router.get('/users/paginated', userController.getPaginatedUsers); // GET /api/users
router.get('/users/search-and-paginate', userController.searchAndPaginatedUsers); // GET /api/users
router.delete('/users/delete-multiple-users', userController.deleteMultipleUsers); // GET /api/users/:id
router.delete('/users/:id', userController.deleteUser); // GET /api/users/:id
router.put('/users/:id', userController.updateUser); // GET /api/users/:id
router.get('/users/:id', userController.getUserById); // GET /api/users/:id



module.exports = router;