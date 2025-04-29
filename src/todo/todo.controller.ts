import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
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

  @Get('one')
  findOne(@Req() req, @Query('todoId') todoId: string) {
    return this.todoService.findOne(req.user.sub, todoId);
  }

  @Post('add-task')
  addTask(@Req() req, @Query('todoId') todoId: string, @Body() body) {
    return this.todoService.addTask(req.user.sub, todoId, body.text);
  }

  @Patch('update-task')
  updateTask(
    @Req() req,
    @Query('todoId') todoId: string,
    @Query('taskId') taskId: string,
    @Body() body,
  ) {
    return this.todoService.updateTask(
      req.user.sub,
      todoId,
      taskId,
      body.completed,
    );
  }

  @Delete('delete-task')
  deleteTask(
    @Req() req,
    @Query('todoId') todoId: string,
    @Query('taskId') taskId: string,
  ) {
    return this.todoService.deleteTask(req.user.sub, todoId, taskId);
  }

  @Delete('delete')
  delete(@Req() req, @Query('todoId') todoId: string) {
    return this.todoService.delete(req.user.sub, todoId);
  }
}
