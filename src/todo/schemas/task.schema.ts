import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  task: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ required: true, type: String })
  todoId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
