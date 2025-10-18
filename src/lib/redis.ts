import { createClient } from 'redis';
import { TaskStatus } from '../types/dto';

class RedisService {
  private client: any;
  private connected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.client.on('error', (err: any) => {
      console.error('Redis Client Error:', err);
    });
    
    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.connected = true;
    });
  }

  async connect() {
    if (!this.connected && !this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  async get(key: string) {
    try {
      await this.connect();
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl = 300) { 
    try {
      await this.connect();
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string) {
    try {
      await this.connect();
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async delPattern(pattern: string) {
    try {
      await this.connect();
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis DEL PATTERN error:', error);
      return false;
    }
  }

  generateTaskKey(status?: TaskStatus, sortBy?: string): string {
    const parts = ['tasks'];
    
    if (status) {
      parts.push(`status:${status}`);
    }
    
    if (sortBy) {
      parts.push(`sort:${sortBy}`);
    }
    
    return parts.join(':');
  }

  async invalidateTasksCache() {
    await this.delPattern('tasks:*');
  }

  async invalidateTaskCache(taskId: number) {
    await this.del(`task:${taskId}`);
    await this.invalidateTasksCache(); 
  }
}

export default new RedisService();