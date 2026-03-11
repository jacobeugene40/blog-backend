// Run once to add 6-char hex suffix to existing post slugs
// Usage: npx ts-node -e "$(cat src/migrate-slugs.ts)"
//    or: DATABASE_URL=... npx ts-node src/migrate-slugs.ts

import { DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config(); // load .env file

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  entities: [],
  synchronize: false,
});

async function migrate() {
  await AppDataSource.initialize();
  console.log('✓ Connected to database');

  const posts = await AppDataSource.query('SELECT id, slug FROM posts');
  console.log(`Found ${posts.length} posts\n`);

  for (const post of posts) {
    // Skip if already has a 6-char hex suffix
    if (/^.*-[a-f0-9]{6}$/.test(post.slug)) {
      console.log(`  skip  ${post.slug}`);
      continue;
    }
    const suffix  = randomBytes(3).toString('hex');
    const newSlug = `${post.slug}-${suffix}`;
    await AppDataSource.query(
      'UPDATE posts SET slug = $1 WHERE id = $2',
      [newSlug, post.id],
    );
    console.log(`  ✓  ${post.slug}  →  ${newSlug}`);
  }

  await AppDataSource.destroy();
  console.log('\nMigration complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});