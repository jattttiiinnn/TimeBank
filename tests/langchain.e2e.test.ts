import { test, expect, describe, beforeAll } from '@jest/globals';
import { OpenAI } from 'openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

describe('LangChain Evaluation Tests', () => {
  let chatModel: ChatOpenAI;
  
  beforeAll(() => {
    // Initialize the chat model with test configuration
    chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo', // or your preferred model
      temperature: 0.7,
    });
  });

  test('should respond to a simple greeting', async () => {
    const messages = [
      new SystemMessage('You are a helpful assistant.'),
      new HumanMessage('Hello, how are you today?')
    ];
    
    const response = await chatModel.call(messages);
    
    expect(response).toBeDefined();
    expect(typeof response.content).toBe('string');
    expect(response.content.length).toBeGreaterThan(0);
  });

  test('should follow system instructions', async () => {
    const systemMessage = 'You are a helpful assistant that speaks like a pirate.';
    const humanMessage = 'Tell me about the ocean.';
    
    const messages = [
      new SystemMessage(systemMessage),
      new HumanMessage(humanMessage)
    ];
    
    const response = await chatModel.call(messages);
    
    expect(response.content.toLowerCase()).toContain('arrr');
    expect(response.content.length).toBeGreaterThan(20);
  });

  test('should handle chain of prompts', async () => {
    const template = 'What is the capital of {country}?';
    const prompt = new PromptTemplate({
      template,
      inputVariables: ['country'],
    });
    
    const chain = new LLMChain({
      llm: chatModel,
      prompt,
    });
    
    const response = await chain.call({ country: 'France' });
    
    expect(response).toBeDefined();
    expect(response.text.toLowerCase()).toContain('paris');
  });

  test('should handle context in conversation', async () => {
    const conversation = [
      new SystemMessage('You are a helpful assistant.'),
      new HumanMessage('My name is John.'),
      new HumanMessage('What is my name?')
    ];
    
    const response = await chatModel.call(conversation);
    
    expect(response.content.toLowerCase()).toContain('john');
  });

  test('should handle edge cases', async () => {
    const messages = [
      new SystemMessage('You are a helpful assistant.'),
      new HumanMessage('')
    ];
    
    const response = await chatModel.call(messages);
    
    expect(response.content).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
  });
});

describe('LangChain Performance Tests', () => {
  test('should respond within acceptable time', async () => {
    const chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
    });
    
    const startTime = Date.now();
    const response = await chatModel.call([
      new HumanMessage('Say "Hello, world!"')
    ]);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.content).toContain('Hello, world!');
    console.log(`Response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(5000); // 5 seconds max response time
  });
});
