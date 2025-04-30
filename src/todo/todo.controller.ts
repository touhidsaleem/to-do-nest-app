import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Req() req, @Body() body) {
    return this.todoService.create(req.user.sub, body.title, body.tasks);
  }

  @Get()
  findAll(@Req() req) {
    return this.todoService.findAll(req.user.sub);
  }

  @Get('todoId/:todoId')
  findOne(@Req() req, @Param('todoId') todoId: string) {
    return this.todoService.findOne(req.user.sub, todoId);
  }

  @Post('addTask/todoId/:todoId')
  addTask(@Req() req, @Param('todoId') todoId: string, @Body() body) {
    return this.todoService.addTask(req.user.sub, todoId, body.text);
  }

  @Patch('updateTask/todoId/:todoId/taskId/:taskId')
  updateTask(
    @Req() req,
    @Param('todoId') todoId: string,
    @Param('taskId') taskId: string,
    @Body() body,
  ) {
    return this.todoService.updateTask(
      req.user.sub,
      todoId,
      taskId,
      body.completed,
    );
  }

  @Delete('deleteTask/todoId/:todoId/taskId/:taskId')
  deleteTask(
    @Req() req,
    @Param('todoId') todoId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.todoService.deleteTask(req.user.sub, todoId, taskId);
  }

  @Delete('delete/todoId/:todoId')
  delete(@Req() req, @Param('todoId') todoId: string) {
    return this.todoService.delete(req.user.sub, todoId);
  }
}
