export type TaskStatus = 'new' | 'inProgress' | 'completed' | 'cancelled';

export type NewTaskDTO = {
    title: string;
    description?: string;
    deadline?: Date;
};

export type UpdateTaskDTO = {
    id: number;
    title?: string;
    description?: string;
    deadline?: Date;
    status?: TaskStatus;
};

export type TaskDTO = {
    id: number;
    title: string;
    description: string | null;
    deadline: Date | null;
    status: TaskStatus;
    createdAt: Date;
}

export type TaskBriefDTO = {
    id: number;
    title: string;
    status: TaskStatus;
    deadline: Date | null;
};
