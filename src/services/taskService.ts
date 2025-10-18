import { 
  NewTaskDTO, 
  TaskBriefDTO, 
  TaskDTO, 
  TaskStatus, 
  UpdateTaskDTO } from "../types/dto";
import { prisma } from "../lib/prisma";
import redisClient from "../lib/redis";

const cacheListTtl = Number(process.env.CACHE_LIST_TTL_SECONDS) || 300;

export const createTask = async (dto: NewTaskDTO) => {
  const task = await prisma.task.create({
    data: {
      title: dto.title,
      description: dto.description,
      deadline: dto.deadline,
      status: "new",
      createdAt: new Date(),
    },
  });

  await prisma.historyEntry.create({
    data: {
      taskId: task.id,
      changedAt: new Date(),
      status: "new",
    },
  });

  await redisClient.invalidateTasksCache();

  return task;
};

export const getTasks = async (status?: TaskStatus, sortBy?: string): Promise <TaskBriefDTO[]> => {
  const cacheKey = redisClient.generateTaskKey(status, sortBy);
  const cachedTasks = await redisClient.get(cacheKey);
  if (cachedTasks) return cachedTasks;
  
  const getSorting = () => {
    if (!sortBy) return [undefined, undefined];
    const parts = sortBy.split(":");

    if (parts.length !== 2) return [undefined, undefined];
    const [field, dir] = parts;

    if (dir !== "asc" && dir !== "desc") return [undefined, undefined];

    return [field, dir as 'asc' | 'desc'];
  }
  const [deadline, direction] = getSorting();

  const tasks = await prisma.task.findMany({
    where: status ? { status: status } : undefined,
    orderBy: deadline ? { [deadline]: direction } : undefined,
    select: {
      id: true,
      title: true,
      status: true,
      deadline: true,
    }
  });
  
  await redisClient.set(cacheKey, tasks, cacheListTtl);
  return tasks;
};

export const getTaskById =  (id: number): Promise <TaskDTO | null> => 
   prisma.task.findUnique({where: {id}});
  

export const updateTask = async (dto: UpdateTaskDTO): Promise <TaskDTO | null> => {
  const existingTask = await prisma.task.findUnique({
    where: {
      id: Number(dto.id)
    },
  });

  if (!existingTask) return null;

  const updatedTask = await prisma.task.update({
    where: {
      id: Number(dto.id)
    },
    data: {
      title: dto.title ?? existingTask.title,
      description: dto.description ?? existingTask.description,
      deadline: dto.deadline ?? existingTask.deadline,
      status: dto.status ?? existingTask.status,
    },
  });

  if (dto.status && dto.status !== existingTask.status) {
    await prisma.historyEntry.create({
      data: {
        taskId: updatedTask.id,
        changedAt: new Date(),
        status: dto.status,
      },
    });
  }

  await redisClient.invalidateTaskCache(dto.id);
  return updatedTask;
};


export const deleteTask = async (id: number): Promise <boolean> => {
  try {
    await prisma.task.delete({where: { id }});
    await redisClient.invalidateTaskCache(id);
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    return false;
  }
};