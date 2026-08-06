const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', projectController.listPublished);
router.get('/user/:username', projectController.listByUser);
router.get('/mine', authMiddleware, projectController.listMine);
router.get('/slug/:slug', projectController.getBySlug);
router.get('/:id', authMiddleware, projectController.getById);
router.post('/', authMiddleware, projectController.create);
router.put('/:id', authMiddleware, projectController.update);
router.delete('/:id', authMiddleware, projectController.remove);

module.exports = router;
