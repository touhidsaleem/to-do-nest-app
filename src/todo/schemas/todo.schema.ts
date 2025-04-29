import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TodoDocument = Todo & Document;

class Task {
  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  completed: boolean;
}

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [{ text: String, completed: Boolean }] })
  tasks: Task[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
