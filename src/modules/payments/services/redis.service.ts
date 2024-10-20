// src/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  // Initialize the Redis client
  onModuleInit() {
    this.client = new Redis({
      host: 'rydly-dev.redis.cache.windows.net', // Redis server hostname
      port: 6380,        // Redis server port
      password: process.env.password, 
    });
  }

  // Clean up the Redis client on module destroy
  onModuleDestroy() {
    this.client.quit();
  }

  // Method to store data in Redis
  async set(key: string, value: any): Promise<string> {
    return await this.client.set(key, JSON.stringify(value));
  }

  // Method to retrieve data from Redis
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null; // Parse JSON string back to object
  }

  // Method to delete data from Redis
  async delete(key: string): Promise<number> {
    return await this.client.del(key);
  }
}
