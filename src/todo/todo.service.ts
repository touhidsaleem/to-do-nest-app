import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async create(userId: string, title: string, tasks: { text: string }[]) {
    return this.todoModel.create({ userId, title, tasks });
  }

  async findAll(userId: string) {
    return this.todoModel.find({ userId });
  }

  async findOne(userId: string, todoId: string) {
    return this.todoModel.findOne({ _id: todoId, userId });
  }

  async addTask(userId: string, todoId: string, taskText: string) {
    return this.todoModel.findOneAndUpdate(
      { _id: todoId, userId },
      { $push: { tasks: { text: taskText, completed: false } } },
      { new: true },
    );
  }

  async updateTask(
    userId: string,
    todoId: string,
    taskId: string,
    completed: boolean,
  ) {
    return this.todoModel.findOneAndUpdate(
      { _id: todoId, userId, 'tasks._id': taskId },
      { $set: { 'tasks.$.completed': completed } },
      { new: true },
    );
  }

  async deleteTask(userId: string, todoId: string, taskId: string) {
    return this.todoModel.findOneAndUpdate(
      { _id: todoId, userId },
      { $pull: { tasks: { _id: taskId } } },
      { new: true },
    );
  }

  async delete(userId: string, todoId: string) {
    return this.todoModel.findOneAndDelete({ _id: todoId, userId });
  }
}
