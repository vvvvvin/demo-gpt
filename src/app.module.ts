import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DemoController } from './demo/demo/demo.controller';
import { DemoService } from './demo/demo/demo.service';
import { DemoSchema } from './demo/demo/demo.entity';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        return {
          uri: 'mongodb://127.0.0.1:27017/?directConnection=true',
        };
      },
    }),
    MongooseModule.forFeature([{ name: 'Demo', schema: DemoSchema }]),
  ],
  controllers: [AppController, DemoController],
  providers: [AppService, DemoService],
})
export class AppModule {}
