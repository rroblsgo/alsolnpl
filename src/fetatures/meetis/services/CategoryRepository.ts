import { db } from '@/src/db';
import { SelectCategory } from '../types/meeti.types';
import { category } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export interface ICategoryRepository {
  findAll(): Promise<SelectCategory[]>;
  findById(categoryId: string): Promise<SelectCategory>;
}

class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<SelectCategory[]> {
    const result = await db.select().from(category);
    return result;
  }

  async findById(categoryId: string): Promise<SelectCategory> {
    const [result] = await db
      .select()
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1);
    return result;
  }
}

export const categoryRepository = new CategoryRepository();
