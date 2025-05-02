import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { Task, TaskDocument } from './schemas/task.schema';
import { ErrorMessages } from 'src/config';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(
    userId: string,
    title: string,
    tasks: { task: string; completed: boolean }[],
  ) {
    if (!userId || !title || !Array.isArray(tasks)) {
      throw new BadRequestException(ErrorMessages.INVALID_INPUT_DATA);
    }

    const todo = await this.todoModel.create({ userId, title });

    const tasksWithTodoId = tasks.map((task) => ({
      task: task.task,
      completed: task.completed,
      todoId: todo._id,
    }));

    await this.taskModel.insertMany(tasksWithTodoId);

    // return {  };
  }

  async findAll(userId: string) {
    if (!userId) throw new BadRequestException(ErrorMessages.USER_ID_REQUIRED);

    const todos = await this.todoModel.find({ userId });
    const todosWithTasks = await Promise.all(
      todos.map(async (todo) => {
        const tasks = await this.taskModel.find({ todoId: todo._id });
        return {
          ...todo.toObject(),
          tasks,
        };
      }),
    );

    return todosWithTasks;
  }

  async findOne(userId: string, todoId: string) {
    if (!userId || !todoId) {
      throw new BadRequestException(ErrorMessages.USER_AND_TODO_ID_REQUIRED);
    }

    const todo = await this.todoModel.findOne({ _id: todoId, userId });
    if (!todo) {
      throw new NotFoundException(ErrorMessages.TODO_NOT_FOUND);
    }

    const tasks = await this.taskModel.find({ todoId });

    return {
      ...todo.toObject(),
      tasks,
    };
  }

  async addTask(userId: string, todoId: string, taskText: string) {
    if (!userId || !todoId || !taskText) {
      throw new BadRequestException(ErrorMessages.MISSING_FIELDS);
    }

    const todo = await this.todoModel.findOne({ _id: todoId, userId });
    if (!todo) {
      throw new NotFoundException(ErrorMessages.TODO_NOT_FOUND);
    }

    const newTask = await this.taskModel.create({
      task: taskText,
      completed: false,
      todoId,
    });

    return newTask;
  }

  async updateTask(
    userId: string,
    todoId: string,
    taskId: string,
    completed: boolean,
  ) {
    if (!userId || !todoId || !taskId) {
      throw new BadRequestException(ErrorMessages.MISSING_FIELDS);
    }

    const todo = await this.todoModel.findOne({ _id: todoId, userId });
    if (!todo) {
      throw new NotFoundException(ErrorMessages.TODO_NOT_FOUND);
    }

    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: taskId, todoId },
      { completed },
      { new: true },
    );

    if (!updatedTask) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND);
    }

    return updatedTask;
  }

  async deleteTask(userId: string, todoId: string, taskId: string) {
    if (!userId || !todoId || !taskId) {
      throw new BadRequestException(ErrorMessages.MISSING_FIELDS);
    }

    const todo = await this.todoModel.findOne({ _id: todoId, userId });
    if (!todo) {
      throw new NotFoundException(ErrorMessages.TODO_NOT_FOUND);
    }

    const deletedTask = await this.taskModel.findOneAndDelete({
      _id: taskId,
      todoId,
    });

    if (!deletedTask) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND);
    }

    return deletedTask;
  }

  async delete(userId: string, todoId: string) {
    if (!userId || !todoId) {
      throw new BadRequestException(ErrorMessages.USER_AND_TODO_ID_REQUIRED);
    }

    const deletedTodo = await this.todoModel.findOneAndDelete({
      _id: todoId,
      userId,
    });

    if (!deletedTodo) {
      throw new NotFoundException(ErrorMessages.TODO_NOT_FOUND);
    }

    await this.taskModel.deleteMany({ todoId });

    return { message: 'Todo and all related tasks deleted successfully' };
  }
}
