import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Demo extends Document {
  @Prop()
  question: string;
  @Prop()
  answer: string;
  @Prop()
  embedding: number[];

  constructor(question: string, answer: string) {
    super();
    this.question = question;
    this.answer = answer;
  }
}

export const DemoSchema = SchemaFactory.createForClass(Demo);
