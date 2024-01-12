import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConversationDTO } from './conversationDTO';
import { Demo } from './demo.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DemoService {
  constructor(@InjectModel('Demo') private demoModel: Model<Demo>) {}

  private openai = new OpenAI({
    apiKey: 'sk-y0uB3t73rN0tS73AlTh1sXXXslatt',
  });
  private temperature: number = 1;
  private language: string = 'italian';

  private formatting = `
	    You will be provided with a text, and your task is to return the generated-response in the ${this.language} language following parsable JSON format:
	    {
	        "Q": "here you put the exact user submitted prompt, no changes",
	        "A": "here you insert the generated response"
	    }
	    Note that this is EXTREMELY important, so do it good.
    `;

  async generateDemoResponse() {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: this.formatting,
        },
        {
          role: 'user',
          content: 'generate a joke about a southern italy guy',
        },
      ],
      model: 'gpt-3.5-turbo',
      temperature: this.temperature,
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
  }
  async generateResponse(prompt: string, temperature: number) {
    const history = await this.getHistoryBySimilarity(prompt);

    const chatCompletion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: this.formatting,
        },
        {
          role: 'system',
          content: 'Based on this context: ' + JSON.stringify(history),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'gpt-3.5-turbo',
      temperature: temperature | this.temperature,
    });
    const parsedResponse = JSON.parse(
      chatCompletion.choices[0].message.content,
    );
    await this.saveResponse(parsedResponse);
    return parsedResponse;
  }

  async saveResponse(response: ConversationDTO) {
    try {
      const demoToSave: Demo = new this.demoModel();
      demoToSave.question = response.Q;
      demoToSave.answer = response.A;
      demoToSave.embedding = await this.createEmbedding(
        response.Q + ' ' + response.A,
      );
      return await demoToSave.save();
    } catch (err) {
      throw err;
    }
  }

  async getHistoryBySimilarity(stringToMatch: string) {
    try {
      const embeddedString = await this.createEmbedding(stringToMatch);
      return await this.demoModel.aggregate([
        {
          $search: {
            knnBeta: {
              vector: embeddedString,
              path: 'embedding',
              k: 5,
            },
          },
        },
        {
          $project: {
            question: 1,
            answer: 1,
            score: { $meta: 'searchScore' },
          },
        },
      ]);
    } catch (err) {
      throw err;
    }
  }

  async createEmbedding(text: string) {
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const [{ embedding }] = embeddingResponse.data;
    return embedding;
  }
}
