import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import {
  UserModel,
  DraftModel,
  DraftVersionModel,
  FeedbackModel,
  OpportunityModel,
  SubmissionModel,
  NotificationModel,
  AchievementModel,
  UserAchievementModel,
  WritingSessionModel,
} from '../models';

/**
 * DEMO DATA SEED SCRIPT FOR WRITERS' PUB
 * 
 * This script generates a complete, realistic demo environment with:
 * - Multiple users with intelligent role assignment
 * - High-quality draft content with version history
 * - Feedback and ratings from editors/readers
 * - Opportunities and submissions
 * - Notifications and achievements
 * - Writing sessions and engagement data
 */

interface DemoUser {
  email: string;
  displayName: string;
  role: 'writer' | 'editor' | 'reader' | 'admin';
  bio: string;
  genres: string[];
  password: string;
}

interface CreatedUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  password: string;
}

// ============================================================================
// REALISTIC CONTENT LIBRARY
// ============================================================================

const SAMPLE_DRAFTS = {
  fantasy: {
    titles: [
      'The Obsidian Inkwell',
      'Shadow of the Forgotten Kingdom',
      'The Enchanted Cartography',
      'Whispers in the Crystal Caverns',
    ],
    contents: [
      `The ancient parchment crackled beneath Eleanor's trembling fingers. She had searched for decades through forgotten libraries and crumbling monasteries, chasing whispers of a magic long thought extinct. Now, as twilight painted the tower walls in shades of amber and violet, she finally held it—the Obsidian Inkwell, source of the world's first stories.

Legend spoke of a time when words themselves held power. When scribes dipped their quills into this ink, entire worlds crystallized into being. But the magic had a price: each story written consumed a piece of the author's soul, binding them eternally to their creation.

Eleanor had always wondered if it was worth it. As she opened the journal beside her and selected a quill from the ancient collection, she understood. Some stories demanded to be told, regardless of the cost.

She pressed the quill to the page, and the ink flowed like liquid starlight.`,
      `The castle of Morvain had stood for three thousand years, its obsidian towers piercing the clouds like the fangs of some slumbering beast. Now it lay dormant, its halls echoing with only the whisper of wind through abandoned corridors.

But shadows were stirring in the deep places beneath the castle. Something ancient was waking.

Kael had been warned not to come. The knights, the priests, even the old soothsayer who lived in the mountain huts—all had begged her to turn back. But her brother had disappeared within these walls six months ago, and she would not rest until she found him or learned the truth of his fate.

She pushed open the iron-bound doors. They swung soundlessly on hinges that should have screamed from centuries of rust. Whatever power held this place, it was far older and deeper than any natural magic.

In the shadows above the great hall, something smiled.`,
      `The map showed impossibilities. Continents that geography denied. Oceans that flowed in spirals. Forests that grew upside down from the sky.

Cartographer Marius had inherited it from his grandmother, a woman who claimed to have traveled the hidden places of the world—the spaces between reality where those who sought refuge could vanish from history.

Most would have dismissed her as mad. But the map was detailed with a precision that no hallucinating mind could achieve. Each marking, each annotation, each careful cross-hatching seemed to pulse with an inexplicable authenticity.

When Marius traced his finger across one particular valley and felt warmth bloom beneath his skin, he knew. The map was calling to him. And though he didn't understand why, he knew he had no choice but to answer.

By dawn, he had packed his belongings and prepared for a journey that might lead everywhere—or nowhere at all.`,
      `In the crystal caverns, the stones sang. Not with sound, but with meaning that bypassed language entirely—a pure transmission of emotion and memory and ancient knowledge directly into the consciousness of those who descended deep enough to listen.

The dwarven miners had stopped descending generations ago. They said the caverns had grown hungry, that something down there was consuming more than just stone—that it fed on certainty, on conviction, on the absolute belief in one's own existence.

Yet Sylvan descended anyway, drawn by a compulsion she couldn't name. With each step deeper into the labyrinth of luminescent stone, she felt herself growing lighter, less real, more like a dream that the caverns themselves were dreaming.

And in that dissolution, she heard it: a whisper that had been waiting in the darkness for someone like her—someone brave or foolish enough to listen.`,
    ],
  },
  mystery: {
    titles: [
      'The Last Letter',
      'Shadows at Midnight',
      'The Archivist\'s Secret',
      'Where The Light Fades',
    ],
    contents: [
      `The envelope had no return address, no stamp, no indication of how it had arrived in my mailbox. Inside was a single page, written in careful handwriting I recognized immediately—my father's, dead for twenty years.

"If you're reading this, then someone has finally come looking. Don't trust the authorities. Trust only the red door in the library basement."

I hadn't been back to my childhood home in a decade. My mother had sold it years ago and moved to California, eager to leave behind whatever ghosts haunted those rooms. But I still had the key. And now, standing in the dust-covered foyer, I realized I'd never really left at all.

The basement stairs creaked under my feet. And ahead, exactly as my father had promised, the red door waited.`,
      `Every night at midnight, the screaming would start. Not a living scream—something more geometric, more abstract. Like mathematics expressing itself in sound. The tenants had learned to sleep through it, or to leave. The landlord claimed nothing was wrong, that it was probably just the pipes.

But Detective Sarah Chen had studied the recordings for weeks, and she was certain: that wasn't plumbing. That was a cry of pure anguish, and it was coming from behind the walls themselves.

When she finally got permission to tear into the structure, she found them: journals, thousands of them, each filled with the same sentence repeated over and over in different handwriting. The same sentence that appeared in the missing persons files going back fifty years.

"I can't leave. It won't let me leave."`,
      `The library's restricted archive was supposed to contain the most valuable and dangerous books in existence. First editions that could be never be replaced. Forbidden texts. Dangerous knowledge.

But librarian Marcus had discovered something far stranger: an entire section of books written in a language that seemed to change every time he opened them. The letters rearranged themselves, the stories shifted, the messages transformed.

Only one book remained consistent: the Archivist's Log, which documented every person who had ever discovered this secret collection—and what happened to them.

All of their fates had been identical. All had disappeared exactly three days after finding the truth.

Marcus checked the date on his discovery. It had been three days yesterday.`,
      `In the forest where the light fades to nothing, there are no trails. Navigation is impossible because north becomes a meaningless concept, distance unravels, and time flows in directions that have no names.

The search party found the last hiker's trail there, following the breadcrumbs and ribbons she'd left. But midway through the darkened woods, the markers stopped. Ahead, there was only darkness—not the darkness of night or even a cave, but an absence so complete that light itself seemed to refuse to penetrate.

And there, at the very edge where the light gave up fighting, they found something that shouldn't exist: a wooden cabin, windows glowing warm from within, smoke curling from its chimney.

As they approached, they realized something impossible: they'd seen this cabin before. In a dream. In a story. In a nightmare they'd shared as children.

And they were all very afraid to knock.`,
    ],
  },
  romance: {
    titles: [
      'Letters Across Autumn',
      'The Lighthouse Keeper\'s Heart',
      'Against All Stars',
      'Second Chances',
    ],
    contents: [
      `Autumn had always been their season. The way the light caught in her hair as they walked through fallen leaves, the warmth of her hand in his pocket, the particular ache of knowing that winter would come and everything beautiful would fade.

This time, she'd sent letters. Three years after he'd left, three years of silence, they arrived in autumn like migrating birds returning to their home. Each envelope held a single page, a snapshot of memory, a question he'd never answered.

He sat in the coffee shop where they'd first met, trembling hands unfolding the final letter. Outside, leaves were turning. The world was beginning its slow descent into cold and dark. But inside the envelope was spring—not a memory of spring, but the promise of it.

"If you come back," it read, "I will still be here. I will always be here."

He stood up, gathered his coat, and walked out into the falling leaves.`,
      `The lighthouse had been abandoned for forty years when she first saw it—a white tower rising from black rocks, the lens still turning though no one lived to maintain it. It became her refuge, the place she would go when the world became too loud and demanding.

And then he appeared one morning, climbing up from the rocks below, salt-soaked and carrying a knapsack. He'd been living in the keeper's cottage for weeks before she discovered him. He could explain why: a broken heart, a need for solitude, a lighthouse that seemed to call to those who needed saving.

"The light keeps turning," he said one dawn as they stood in the lamp room and watched the beam sweep across dark water. "Even in emptiness. It still turns."

She understood then that both of them were lighthouses too—beautiful, isolated, continuing to shine even when they thought no one was watching.

He took her hand, and the light swept across their faces again and again and again.`,
      `The odds were astronomical. In a universe of billions, the probability of two people meeting at that exact moment, in that exact place, was so infinitesimally small that it seemed impossible—yet they had met.

Astrophysicist David had known all the math. He'd calculated the odds and they said they would never see each other again after that night in the observatory. Yet he kept finding reasons to return. He kept finding her there, as if drawn by an invisible force that ignored all probability.

"This is impossible," she whispered one night, and he'd looked up at the stars and smiled.

"Yes," he said. "That's exactly why I believe in it."

They had defied every calculation, every statistical certainty. Against all the stars that said they should have been strangers, they had chosen each other anyway. And in that choice, they'd found something more powerful than mathematics: faith.`,
      `Second chances were rare. They both knew this. The divorce papers had been finalized five years ago, and they'd built separate lives in separate cities, determined never to repeat their mistakes.

But then his daughter had gotten sick, and she'd been the first person he called. And she'd taken the first flight available, arriving at the hospital with coffee and that smile he'd thought he'd never see directed at him again.

They didn't promise anything. They didn't rekindle anything. They just sat together in those waiting rooms and remembered why they had loved each other in the first place—not why they'd failed, but why they'd tried.

The daughter recovered. And when she did, neither of them was sure how to say goodbye. So they didn't. Instead, they took it one coffee at a time, one conversation at a time, one chance at a time.

Some stories don't end. They just get revised. Second edition.`,
    ],
  },
};

const FEEDBACK_TEMPLATES = [
  {
    score: 9,
    text: `Absolutely captivating! The world-building is intricate and the prose flows beautifully. I was completely immersed from the first paragraph. Your character development is exceptional—each protagonist feels real and their motivations ring true. The pacing kept me turning pages, and the ending left me wanting more. This is powerful writing. Keep going with this story.`,
  },
  {
    score: 8,
    text: `Strong piece with excellent atmosphere and voice. The plot moves well and the descriptive passages are evocative. I would suggest tightening some of the middle sections slightly, and perhaps developing the secondary characters a bit more. But overall, this is solid work that shows real promise. The emotional resonance is particularly effective.`,
  },
  {
    score: 7,
    text: `Good work here. The core concept is interesting and your execution shows genuine skill. The dialogue feels natural and the conflict is compelling. I did notice a few pacing issues in the second act, and some descriptions could be trimmed. But these are minor concerns. The bones of this story are strong and it deserves further development.`,
  },
  {
    score: 8,
    text: `I really enjoyed this. Your storytelling instinct is sharp—you know when to reveal information and when to hold back. The emotional stakes feel genuine. Some sections are brilliant, others could use tightening. But the voice is distinctive and engaging. I'd love to see where you take this.`,
  },
  {
    score: 9,
    text: `Masterful. This piece demonstrates real craft. The way you weave together multiple threads into a cohesive narrative is impressive. Your prose is elegant without being purple, and every sentence feels purposeful. The characters are complex and their arcs are satisfying. This is work that should be widely read.`,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function getDisplayNameFromEmail(email: string): string {
  const [name] = email.split('@');
  return name
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getRandomScore(): number {
  return Math.floor(Math.random() * 4) + 6; // 6-9 score
}

function getGenreContent(genre: 'fantasy' | 'mystery' | 'romance'): {
  title: string;
  content: string;
} {
  const titles = SAMPLE_DRAFTS[genre].titles;
  const contents = SAMPLE_DRAFTS[genre].contents;
  const index = Math.floor(Math.random() * titles.length);
  return {
    title: titles[index],
    content: contents[index],
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedDemoData() {
  console.log('🌱 Starting Writers\' Pub Demo Data Seed...\n');

  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ Cannot connect to MongoDB. Aborting.');
    process.exit(1);
  }

  try {
    // Clear existing data (optional - comment out to preserve data)
    console.log('🗑️  Clearing existing demo data...');
    await UserModel.deleteMany({});
    await DraftModel.deleteMany({});
    await DraftVersionModel.deleteMany({});
    await FeedbackModel.deleteMany({});
    await OpportunityModel.deleteMany({});
    await SubmissionModel.deleteMany({});
    await NotificationModel.deleteMany({});
    await UserAchievementModel.deleteMany({});
    await WritingSessionModel.deleteMany({});

    const createdUsers: CreatedUser[] = [];
    const userDocuments: any[] = [];

    // ========================================================================
    // 1. CREATE USERS WITH INTELLIGENT ROLE ASSIGNMENT
    // ========================================================================
    console.log('👥 Creating users with intelligent role assignment...\n');

    const demoEmails = [
      'eleanor.blackwood@writers.pub',
      'marcus.reader@writers.pub',
      'sophie.writer@writers.pub',
      'james.editor@writers.pub',
      'aisha.contributor@writers.pub',
    ];

    const userDefinitions: DemoUser[] = [
      {
        email: demoEmails[0],
        displayName: 'Eleanor Blackwood',
        role: 'writer',
        bio: 'Fantasy enthusiast and emerging novelist. Passionate about world-building and character development.',
        genres: ['Fantasy', 'Adventure'],
        password: generatePassword(),
      },
      {
        email: demoEmails[1],
        displayName: 'Marcus Reader',
        role: 'reader',
        bio: 'Avid reader and literature enthusiast. Love discovering new voices and supporting emerging writers.',
        genres: ['Mystery', 'Romance', 'Thriller'],
        password: generatePassword(),
      },
      {
        email: demoEmails[2],
        displayName: 'Sophie Mitchell',
        role: 'writer',
        bio: 'Mystery writer exploring the psychology of crime. Published in several online magazines.',
        genres: ['Mystery', 'Psychological Fiction'],
        password: generatePassword(),
      },
      {
        email: demoEmails[3],
        displayName: 'James Chen',
        role: 'editor',
        bio: 'Senior editor with 15 years of publishing experience. Focused on developing new talent.',
        genres: ['Fiction', 'Fantasy', 'Mystery'],
        password: generatePassword(),
      },
      {
        email: demoEmails[4],
        displayName: 'Aisha Patel',
        role: 'writer',
        bio: 'Romance writer exploring contemporary relationships and second chances.',
        genres: ['Romance', 'Contemporary Fiction'],
        password: generatePassword(),
      },
    ];

    for (const userDef of userDefinitions) {
      const passwordHash = await bcrypt.hash(userDef.password, 12);

      const user = await UserModel.create({
        email: userDef.email,
        password_hash: passwordHash,
        display_name: userDef.displayName,
        role: userDef.role,
        bio: userDef.bio,
        genres: userDef.genres,
        trust_score: Math.floor(Math.random() * 400) + 300,
        is_verified: true,
      });

      userDocuments.push(user);
      createdUsers.push({
        id: user._id.toString(),
        email: userDef.email,
        displayName: userDef.displayName,
        role: userDef.role,
        password: userDef.password,
      });

      console.log(`  ✅ ${userDef.displayName} (${userDef.role})`);
    }

    const writers = userDocuments.filter((u) => u.role === 'writer');
    const editors = userDocuments.filter((u) => u.role === 'editor');
    const readers = userDocuments.filter((u) => u.role === 'reader');

    console.log(`\n✅ Created ${userDocuments.length} users\n`);

    // ========================================================================
    // 2. CREATE DRAFTS WITH VERSION HISTORY
    // ========================================================================
    console.log('📝 Creating drafts with version history...\n');

    const drafts: any[] = [];
    const genres = ['fantasy', 'mystery', 'romance'] as const;

    for (const writer of writers) {
      // Each writer gets 3 drafts
      for (let i = 0; i < 3; i++) {
        const genre = genres[i % genres.length];
        const { title, content } = getGenreContent(genre);
        const wordCount = countWords(content);

        const draft = await DraftModel.create({
          author_id: writer._id,
          title: `${title} (Draft)`,
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: content }],
              },
            ],
          },
          content_text: content,
          genre: genre.charAt(0).toUpperCase() + genre.slice(1),
          status: i === 0 ? 'shared' : i === 1 ? 'under_review' : 'draft',
          visibility: i === 0 ? 'public' : 'editors_only',
          word_count: wordCount,
          progress: Math.floor(Math.random() * 80) + 20,
          version: 1,
          tags: [genre, 'demo', 'featured'].slice(0, 2),
        });

        drafts.push(draft);

        // Create 1-2 versions for each draft
        for (let v = 1; v <= Math.floor(Math.random() * 2) + 1; v++) {
          const editedContent = content + `\n\n[Edit v${v + 1}] Refined narrative and improved pacing in this section.`;
          const editedWordCount = countWords(editedContent);

          await DraftVersionModel.create({
            draft_id: draft._id,
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: editedContent }],
                },
              ],
            },
            content_text: editedContent,
            word_count: editedWordCount,
            version_number: v + 1,
          });
        }

        console.log(`  ✅ "${draft.title}" by ${writer.display_name}`);
      }
    }

    console.log(`\n✅ Created ${drafts.length} drafts with versions\n`);

    // ========================================================================
    // 3. CREATE FEEDBACK
    // ========================================================================
    console.log('💬 Creating feedback and ratings...\n');

    let feedbackCount = 0;

    for (const draft of drafts) {
      // Get 2-4 reviewers (mix of editors and readers)
      const reviewerPool = [...editors, ...readers];
      const reviewers = getRandomElements(reviewerPool, Math.floor(Math.random() * 3) + 2);

      for (const reviewer of reviewers) {
        // Skip if reviewer is the author
        if (reviewer._id.toString() === draft.author_id.toString()) continue;

        const feedbackTemplate = getRandomElement(FEEDBACK_TEMPLATES);

        const feedback = await FeedbackModel.create({
          draft_id: draft._id,
          reviewer_id: reviewer._id,
          scores: {
            plot: getRandomScore(),
            pacing: getRandomScore(),
            character: getRandomScore(),
          },
          written_feedback: feedbackTemplate.text,
          helpfulness_score: Math.floor(Math.random() * 20) + 1,
          is_anonymous: Math.random() > 0.7,
        });

        feedbackCount++;

        // Create notification for feedback
        await NotificationModel.create({
          user_id: draft.author_id,
          type: 'feedback_received',
          title: 'New Feedback Received',
          message: `${reviewer.display_name} left feedback on "${draft.title}"`,
          metadata: {
            draft_id: draft._id.toString(),
            feedback_id: feedback._id.toString(),
            reviewer_name: reviewer.display_name,
          },
          is_read: Math.random() > 0.3,
        });
      }
    }

    console.log(`  ✅ Created ${feedbackCount} feedback entries with notifications\n`);

    // ========================================================================
    // 4. CREATE OPPORTUNITIES
    // ========================================================================
    console.log('🎯 Creating opportunities (contests & submissions)...\n');

    const opportunities = [];

    const opportunityDefinitions = [
      {
        title: 'Flash Fiction Challenge 2026',
        description:
          'Submit your best flash fiction (under 2000 words) exploring themes of identity and belonging. Winners will be featured in our quarterly anthology and receive $500 prize money.',
        genres: ['Fiction', 'Fantasy', 'Mystery'],
        isPaid: true,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        wordLimit: 2000,
      },
      {
        title: 'Romance Magazine Submission Call',
        description:
          'Looking for contemporary romance stories (5,000-10,000 words) with strong emotional arcs. Perfect opportunity for emerging writers. Payment: $0.05 per word.',
        genres: ['Romance'],
        isPaid: true,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        wordLimit: 10000,
      },
      {
        title: 'Speculative Fiction Anthology',
        description:
          'We\'re curating an anthology of speculative fiction (science fiction, fantasy, paranormal). Stories can be standalone or series-related. All contributors receive complimentary copies.',
        genres: ['Fantasy', 'Science Fiction'],
        isPaid: false,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        wordLimit: 15000,
      },
      {
        title: "Mystery Writers' Competition",
        description:
          'Annual competition for mystery and thriller writers. Grand prize: $2,000 and publication guarantee. Top 10 finalists featured on our website.',
        genres: ['Mystery', 'Thriller'],
        isPaid: true,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        wordLimit: 12000,
      },
      {
        title: 'Emerging Voices Literary Journal',
        description:
          'We champion fresh voices in fiction. Submit any genre story (your first publication welcome). Review period: 8-12 weeks.',
        genres: ['Fiction', 'Romance', 'Mystery', 'Fantasy'],
        isPaid: false,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        wordLimit: 8000,
      },
    ];

    for (const oppDef of opportunityDefinitions) {
      const opp = await OpportunityModel.create({
        publisher_id: getRandomElement(editors)._id,
        title: oppDef.title,
        description: oppDef.description,
        genres: oppDef.genres,
        deadline: oppDef.deadline,
        word_limit_max: oppDef.wordLimit,
        is_paid: oppDef.isPaid,
        payment_details: oppDef.isPaid ? 'Prize pool or per-word payment' : null,
        is_featured: Math.random() > 0.4,
        is_active: true,
      });

      opportunities.push(opp);
      console.log(`  ✅ "${opp.title}"`);
    }

    console.log(`\n✅ Created ${opportunities.length} opportunities\n`);

    // ========================================================================
    // 5. CREATE SUBMISSIONS
    // ========================================================================
    console.log('📤 Creating submissions to opportunities...\n');

    let submissionCount = 0;

    for (const draft of drafts) {
      // Each draft gets submitted to 1-2 opportunities
      const submittedToCount = Math.floor(Math.random() * 2) + 1;
      const oppSubset = getRandomElements(opportunities, submittedToCount);

      for (const opp of oppSubset) {
        // Check if word count is within limits
        if (draft.word_count > opp.word_limit_max) continue;

        const submission = await SubmissionModel.create({
          draft_id: draft._id,
          opportunity_id: opp._id,
          submitter_id: draft.author_id,
          status: getRandomElement([
            'submitted',
            'under_review',
            'shortlisted',
            'accepted',
            'rejected',
          ]),
          editor_feedback:
            Math.random() > 0.5
              ? 'Great potential! Consider revising section 2 for better pacing.'
              : null,
          reviewed_at: Math.random() > 0.6 ? new Date() : null,
        });

        submissionCount++;

        // Create notification
        await NotificationModel.create({
          user_id: draft.author_id,
          type: 'submission_update',
          title: 'Submission Status Update',
          message: `Your submission to "${opp.title}" is now ${submission.status}`,
          metadata: {
            submission_id: submission._id.toString(),
            opportunity_id: opp._id.toString(),
            status: submission.status,
          },
          is_read: Math.random() > 0.4,
        });
      }
    }

    console.log(`  ✅ Created ${submissionCount} submissions with notifications\n`);

    // ========================================================================
    // 6. CREATE ACHIEVEMENTS
    // ========================================================================
    console.log('🏆 Setting up achievements...\n');

    const achievements = await AchievementModel.insertMany([
      {
        key: 'first_draft',
        title: 'First Words',
        description: 'Published your first draft',
        icon: '✍️',
        requirement_value: 1,
      },
      {
        key: 'first_feedback',
        title: 'First Critique',
        description: 'Received your first piece of feedback',
        icon: '💬',
        requirement_value: 1,
      },
      {
        key: 'prolific_writer',
        title: 'Prolific Writer',
        description: 'Published 5 drafts',
        icon: '📚',
        requirement_value: 5,
      },
      {
        key: 'feedback_giver',
        title: 'Constructive Critic',
        description: 'Provided 10 pieces of feedback',
        icon: '👁️',
        requirement_value: 10,
      },
      {
        key: 'high_rated',
        title: 'Rising Star',
        description: 'Received average rating of 8+',
        icon: '⭐',
        requirement_value: 8,
      },
      {
        key: 'consistent_writer',
        title: 'Consistent Creator',
        description: '7-day writing streak',
        icon: '🔥',
        requirement_value: 7,
      },
    ]);

    // Assign achievements to users
    for (const writer of writers) {
      // Assign random achievements
      const achievementsToAssign = getRandomElements(
        achievements,
        Math.floor(Math.random() * achievements.length - 1) + 1
      );

      for (const achievement of achievementsToAssign) {
        await UserAchievementModel.create({
          user_id: writer._id,
          achievement_id: achievement._id,
          progress: Math.floor(Math.random() * achievement.requirement_value) + 1,
          earned: Math.random() > 0.5,
          earned_at: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        });
      }
    }

    console.log(`  ✅ Created ${achievements.length} achievement types\n`);

    // ========================================================================
    // 7. CREATE WRITING SESSIONS
    // ========================================================================
    console.log('📊 Creating writing sessions...\n');

    let sessionCount = 0;

    for (const writer of writers) {
      // Create 5-10 writing sessions per writer
      for (let i = 0; i < Math.floor(Math.random() * 6) + 5; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const sessionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const duration = Math.floor(Math.random() * 180) + 30; // 30-210 minutes

        const session = await WritingSessionModel.create({
          user_id: writer._id,
          draft_id: getRandomElement(drafts.filter((d) => d.author_id.toString() === writer._id.toString()))._id,
          started_at: sessionDate,
          ended_at: new Date(sessionDate.getTime() + duration * 60 * 1000),
          words_written: Math.floor(Math.random() * 2000) + 500,
        });

        sessionCount++;
      }
    }

    console.log(`  ✅ Created ${sessionCount} writing sessions\n`);

    // ========================================================================
    // 8. OUTPUT RESULTS
    // ========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('✅ DEMO DATA SEEDING COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80) + '\n');

    console.log('📋 CREATED USER CREDENTIALS:\n');
    console.log('To log in to the demo environment, use these credentials:\n');

    for (const user of createdUsers) {
      console.log(`Email:    ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role:     ${user.role}`);
      console.log('---');
    }

    console.log('\n📊 DEMO DATA SUMMARY:\n');
    console.log(`  • Users Created:              ${userDocuments.length}`);
    console.log(`  • Writers:                    ${writers.length}`);
    console.log(`  • Editors:                    ${editors.length}`);
    console.log(`  • Readers:                    ${readers.length}`);
    console.log(`  • Drafts Created:             ${drafts.length}`);
    console.log(`  • Total Feedback Items:       ${feedbackCount}`);
    console.log(`  • Opportunities Created:      ${opportunities.length}`);
    console.log(`  • Submissions:                ${submissionCount}`);
    console.log(`  • Achievement Types:          ${achievements.length}`);
    console.log(`  • Writing Sessions:           ${sessionCount}`);

    console.log('\n🎯 NEXT STEPS:\n');
    console.log('  1. Start the server: npm run dev');
    console.log('  2. Open the web app: http://localhost:3000');
    console.log('  3. Log in with any of the credentials above');
    console.log('  4. Explore drafts, feedback, and opportunities');
    console.log('  5. Check your notifications and achievements');

    console.log('\n💡 WHAT YOU\'LL SEE:\n');
    console.log('  ✓ Active user profiles with bios and interests');
    console.log('  ✓ Multiple high-quality drafts ready for review');
    console.log('  ✓ Professional feedback with ratings and comments');
    console.log('  ✓ Real publishing opportunities to submit to');
    console.log('  ✓ Active submission pipeline');
    console.log('  ✓ Notification feed showing activity');
    console.log('  ✓ Achievement badges and progress tracking');
    console.log('  ✓ Writing activity and engagement metrics');

    console.log('\n' + '='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed
seedDemoData();
