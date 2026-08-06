const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', blogController.listPublished);
router.get('/user/:username', blogController.listByUser);
router.get('/mine', authMiddleware, blogController.listMine);
router.get('/slug/:slug', blogController.getBySlug);
router.get('/:id', authMiddleware, blogController.getById);
router.post('/', authMiddleware, blogController.create);
router.put('/:id', authMiddleware, blogController.update);
router.delete('/:id', authMiddleware, blogController.remove);

module.exports = router;
