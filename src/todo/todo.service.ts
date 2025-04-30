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
    try {
      if (!userId || !title || !Array.isArray(tasks)) {
        throw new BadRequestException('Invalid input data');
      }

      const todo = await this.todoModel.create({ userId, title });

      const tasksWithTodoId = tasks.map((task) => ({
        task: task.task,
        completed: task.completed,
        todoId: todo._id,
      }));

      await this.taskModel.insertMany(tasksWithTodoId);

      return { todo: todo.toObject() };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(userId: string) {
    try {
      if (!userId) throw new BadRequestException('User ID is required');

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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(userId: string, todoId: string) {
    try {
      if (!userId || !todoId) {
        throw new BadRequestException('User ID and Todo ID are required');
      }

      const todo = await this.todoModel.findOne({ _id: todoId, userId });
      if (!todo) {
        throw new NotFoundException('Todo not found or unauthorized');
      }

      const tasks = await this.taskModel.find({ todoId });

      return {
        ...todo.toObject(),
        tasks,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async addTask(userId: string, todoId: string, taskText: string) {
    try {
      if (!userId || !todoId || !taskText) {
        throw new BadRequestException('Missing required fields');
      }

      const todo = await this.todoModel.findOne({ _id: todoId, userId });
      if (!todo) {
        throw new NotFoundException('Todo not found or unauthorized');
      }

      const newTask = await this.taskModel.create({
        task: taskText,
        completed: false,
        todoId,
      });

      return newTask;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateTask(
    userId: string,
    todoId: string,
    taskId: string,
    completed: boolean,
  ) {
    try {
      if (!userId || !todoId || !taskId) {
        throw new BadRequestException('Missing required fields');
      }

      const todo = await this.todoModel.findOne({ _id: todoId, userId });
      if (!todo) {
        throw new NotFoundException('Todo not found or unauthorized');
      }

      const updatedTask = await this.taskModel.findOneAndUpdate(
        { _id: taskId, todoId },
        { completed },
        { new: true },
      );

      if (!updatedTask) {
        throw new NotFoundException('Task not found');
      }

      return updatedTask;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteTask(userId: string, todoId: string, taskId: string) {
    try {
      if (!userId || !todoId || !taskId) {
        throw new BadRequestException('Missing required fields');
      }

      const todo = await this.todoModel.findOne({ _id: todoId, userId });
      if (!todo) {
        throw new NotFoundException('Todo not found or unauthorized');
      }

      const deletedTask = await this.taskModel.findOneAndDelete({
        _id: taskId,
        todoId,
      });

      if (!deletedTask) {
        throw new NotFoundException('Task not found');
      }

      return deletedTask;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(userId: string, todoId: string) {
    try {
      if (!userId || !todoId) {
        throw new BadRequestException('User ID and Todo ID are required');
      }

      const deletedTodo = await this.todoModel.findOneAndDelete({
        _id: todoId,
        userId,
      });

      if (!deletedTodo) {
        throw new NotFoundException('Todo not found or unauthorized');
      }

      await this.taskModel.deleteMany({ todoId });

      return { message: 'Todo and all related tasks deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
