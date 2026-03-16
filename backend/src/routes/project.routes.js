// backend/src/routes/project.routes.js
import { Router } from 'express';
import { getMyProjects, createProject, updateProject, deleteProject } from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de projetos exigem que o utilizador esteja logado (OSC)
router.use(protect);

router.get('/', getMyProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;