import { Body, Controller, Get, Post } from "@nestjs/common";
import { DemoService } from './demo.service';
import { PromptDTO } from './promptDTO';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get()
  getExample() {
    return this.demoService.generateDemoResponse();
  }

  @Post()
  customPrompt(@Body() prompt: PromptDTO) {
    return this.demoService.generateResponse(prompt.prompt, prompt.temperature);
  }
}
