import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { DraftModel, OpportunityModel, UserModel } from '../models';

async function seed() {
  console.log('[Seed] Starting MongoDB seed...');

  const connected = await connectDatabase();
  if (!connected) {
    console.error('[Seed] Cannot connect to MongoDB. Aborting.');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash('password123', 12);

  const users = [
    { email: 'eleanor@writerspub.com', display_name: 'Eleanor Blackwood', role: 'writer' },
    { email: 'editor@writerspub.com', display_name: 'Marcus Editor', role: 'editor' },
  ];

  const userDocs: any[] = [];
  for (const u of users) {
    const doc = await UserModel.findOneAndUpdate(
      { email: u.email },
      { $setOnInsert: { ...u, password_hash, genres: ['Fiction'], trust_score: 700 } },
      { upsert: true, new: true }
    );
    userDocs.push(doc);
  }

  const writer = userDocs.find((u) => u?.role === 'writer');
  const editor = userDocs.find((u) => u?.role === 'editor');

  if (writer) {
    await DraftModel.findOneAndUpdate(
      { author_id: writer._id, title: 'The Obsidian Inkwell' },
      {
        $setOnInsert: {
          content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Opening line...' }] }] },
          content_text: 'The parchment felt warm beneath my fingertips.',
          genre: 'Fantasy',
          status: 'shared',
          visibility: 'public',
          word_count: 320,
          progress: 20,
        },
      },
      { upsert: true }
    );
  }

  if (editor) {
    await OpportunityModel.findOneAndUpdate(
      { publisher_id: editor._id, title: 'Flash Fiction Call' },
      {
        $setOnInsert: {
          description: 'Submit your strongest short fiction.',
          genres: ['Fiction', 'Fantasy'],
          is_active: true,
          is_featured: true,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          word_limit_max: 3000,
        },
      },
      { upsert: true }
    );
  }

  console.log('[Seed] Seed completed.');
  process.exit(0);
}

seed();
