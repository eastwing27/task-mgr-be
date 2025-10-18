import { Router } from 'express';
import { 
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../../../services/taskService';
import { NewTaskDTO, TaskStatus, UpdateTaskDTO } from '../../../types/dto';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, sortBy } = req.query;
       
    const tasks = await getTasks(status as TaskStatus|undefined, sortBy as string|undefined);
    res.send(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await getTaskById(+req.params.id);
    if (!task) return res.status(404).send("Task not found");
    res.send(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/', async (req, res) => {
  try {
    const dto = req.body as NewTaskDTO;
    const task = await createTask(dto);
    res.status(201).send(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const dto = req.body as UpdateTaskDTO;
    dto.id = +req.params.id;
    const updatedTask = await updateTask(dto);
    if (!updatedTask) return res.status(404).send("Task not found");
    res.send(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteTask(+req.params.id);
    if (!deleted) return res.status(404).send("Task not found");
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
