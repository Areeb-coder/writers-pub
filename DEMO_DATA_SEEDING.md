# Writers' Pub Demo Data Seeding System

## 🎯 Overview

This document describes the **complete automated demo data generation system** for Writers' Pub. The system creates realistic, production-ready test data that makes the platform feel like an active writing community immediately after deployment.

## 📦 What Gets Generated

### Users (5 Total)
- **2 Writers**: Content creators with completed drafts
- **1 Editor**: Publisher who creates opportunities and reviews work
- **1 Reader**: Community member who provides feedback
- **1 Additional Writer**: Extra content contributor for community diversity

**Total Generated Data:**
- ✅ 9 drafts (3 per writer)
- ✅ 12+ feedback items with meaningful critiques
- ✅ 5 publishing opportunities
- ✅ 8+ draft submissions
- ✅ 15+ notifications
- ✅ 6 achievement types
- ✅ 40+ writing sessions
- ✅ User achievement progress tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas URI configured in `.env`
- All dependencies installed: `npm install`

### Running the Seed

```bash
# Navigate to server directory
cd server

# Run the demo data seed
npm run seed:demo
```

**Expected Output:**
```
🌱 Starting Writers' Pub Demo Data Seed...

🗑️ Clearing existing demo data...
👥 Creating users with intelligent role assignment...

  ✅ Eleanor Blackwood (writer)
  ✅ Marcus Reader (reader)
  ✅ Sophie Mitchell (writer)
  ✅ James Chen (editor)
  ✅ Aisha Patel (writer)

✅ Created 5 users

📝 Creating drafts with version history...
  ✅ "The Obsidian Inkwell (Draft)" by Eleanor Blackwood
  ✅ "Shadow of the Forgotten Kingdom (Draft)" by Eleanor Blackwood
  ... [and more]

[... full seeding output ...]

✅ DEMO DATA SEEDING COMPLETED SUCCESSFULLY

📋 CREATED USER CREDENTIALS:
To log in to the demo environment, use these credentials:

Email:    eleanor.blackwood@writers.pub
Password: x7kL#mP2@qR9nT4
Role:     writer
---
Email:    marcus.reader@writers.pub
Password: a8vJ$bK5!cL3fX6
Role:     reader
---
[... more credentials ...]
```

---

## 👥 Created Users

| Name | Email | Role | Bio | Genres |
|------|-------|------|-----|--------|
| Eleanor Blackwood | eleanor.blackwood@writers.pub | Writer | Fantasy enthusiast and emerging novelist | Fantasy, Adventure |
| Marcus Reader | marcus.reader@writers.pub | Reader | Avid reader and literature enthusiast | Mystery, Romance, Thriller |
| Sophie Mitchell | sophie.writer@writers.pub | Writer | Mystery writer exploring crime psychology | Mystery, Psychological Fiction |
| James Chen | james.editor@writers.pub | Editor | Senior editor with 15 years experience | Fiction, Fantasy, Mystery |
| Aisha Patel | aisha.contributor@writers.pub | Writer | Romance writer exploring contemporary relationships | Romance, Contemporary Fiction |

---

## 📝 Generated Content

### Drafts
Each writer receives 3 high-quality drafts:
- **Status variety**: draft, shared, under_review, accepted, published
- **Visibility settings**: private, editors_only, public
- **Real content**: Multi-paragraph literary content (not placeholder text)
- **Genres**: Fantasy, Mystery, Romance
- **Word counts**: 500-2000 words per draft
- **Version history**: 1-2 previous versions per draft

### Draft Content Examples

#### Fantasy: "The Obsidian Inkwell"
*Multi-paragraph story about discovering an ancient artifact with magical writing powers.*

#### Mystery: "Where The Light Fades"
*Story about a forest where light refuses to penetrate, with unsettling discoveries.*

#### Romance: "Letters Across Autumn"
*Story about reconnection and second chances through correspondence.*

---

## 💬 Feedback System

### Generated Feedback
- **Reviewers**: Mix of editors and readers (2-4 per draft)
- **Scores**: 6-9 ratings on plot, pacing, and character development
- **Written Feedback**: Meaningful, constructive comments (not lorem ipsum)
- **Anonymity**: Some feedback marked as anonymous
- **Helpfulness Score**: 1-20 helpfulness rating

### Feedback Examples
```
"Absolutely captivating! The world-building is intricate and the prose flows 
beautifully. I was completely immersed from the first paragraph. Your character 
development is exceptional. The pacing kept me turning pages."

"Strong piece with excellent atmosphere and voice. The plot moves well and the 
descriptive passages are evocative. I would suggest tightening some of the middle 
sections slightly."
```

---

## 🎯 Publishing Opportunities

### Created Opportunities (5 Total)

| Title | Genre | Deadline | Word Limit | Paid |
|-------|-------|----------|-----------|------|
| Flash Fiction Challenge 2026 | Fiction, Fantasy, Mystery | +30 days | 2,000 | Yes |
| Romance Magazine Submission | Romance | +45 days | 10,000 | Yes |
| Speculative Fiction Anthology | Fantasy, Sci-Fi | +60 days | 15,000 | No |
| Mystery Writers' Competition | Mystery, Thriller | +20 days | 12,000 | Yes |
| Emerging Voices Literary Journal | All Genres | +90 days | 8,000 | No |

### Submissions
- Each draft submitted to 1-2 matching opportunities
- **Submission statuses**: submitted, under_review, shortlisted, accepted, rejected
- **Editor feedback**: Some submissions include reviewer comments
- **Notifications**: Automatic updates for submission status changes

---

## 🏆 Achievements

### Achievement Types (6 Total)

| Achievement | Icon | Description | Unlock Condition |
|-------------|------|-------------|-----------------|
| First Words | ✍️ | Published your first draft | 1 draft |
| First Critique | 💬 | Received feedback | 1 feedback item |
| Prolific Writer | 📚 | Published 5 drafts | 5 drafts |
| Constructive Critic | 👁️ | Provided feedback | 10 feedback items |
| Rising Star | ⭐ | High average ratings | 8+ avg score |
| Consistent Creator | 🔥 | Writing streak | 7-day streak |

### User Achievement Progress
- Random achievements assigned to writers
- Progress tracking toward unlocking each achievement
- Completion dates for earned achievements
- Mix of earned and in-progress achievements

---

## 📊 Writing Sessions

### Activity Tracking
- **5-10 sessions per writer** (distributed over 30 days)
- **Duration**: 30-210 minutes per session
- **Words written**: 500-2000 words per session
- **Draft association**: Each session linked to a draft
- **Dates**: Realistic distribution across past 30 days

**Total Sessions**: 40+ for realistic engagement metrics

---

## 🔔 Notifications

### Notification Types
1. **Feedback Received** (auto-created when feedback is posted)
   - Shows reviewer name and draft title
   - Links to feedback details

2. **Submission Updates** (auto-created for each submission status)
   - Shows opportunity name and new status
   - Indicates review progress

3. **Achievement Unlocked** (when achievements are earned)
4. **System Notifications** (platform announcements)

### Notification Status
- Mix of read and unread
- Metadata includes relevant IDs for linking

---

## 🔐 Authentication

### Credentials Display
After seeding completes, all user credentials are displayed:

```
Email:    eleanor.blackwood@writers.pub
Password: x7kL#mP2@qR9nT4
Role:     writer
```

**Features:**
- ✅ Passwords are securely hashed with bcrypt (salt rounds: 12)
- ✅ Each user has a unique, 12-character password
- ✅ Passwords include uppercase, lowercase, numbers, and special characters
- ✅ All credentials are immediately functional for login

---

## ✅ Validation Checklist

After running the seed, verify:

- [ ] **5 users created** with appropriate roles
- [ ] **9 drafts visible** in respective user dashboards
- [ ] **Draft versions** show edit history (2+ versions per draft)
- [ ] **Feedback visible** on each draft (mix of ratings and comments)
- [ ] **Feedback appears in notifications** for draft authors
- [ ] **5 opportunities** visible in discover/marketplace
- [ ] **Submissions appear** in user profiles and opportunity pages
- [ ] **Submission status updates** create notifications
- [ ] **Achievement types** are visible in profile/achievement sections
- [ ] **User progress toward achievements** is tracked
- [ ] **Writing sessions** appear in activity/engagement sections
- [ ] **All users can log in** with provided credentials
- [ ] **User profiles** show complete bios, genres, and stats

---

## 🛠️ Advanced Usage

### Modifying Seed Data

#### Change Number of Drafts Per Writer
In `seedDemoData.ts`, line ~285:
```typescript
for (let i = 0; i < 3; i++) {  // Change 3 to desired number
```

#### Add More Sample Content
Add to `SAMPLE_DRAFTS` object (lines 47-175):
```typescript
const SAMPLE_DRAFTS = {
  horror: {
    titles: ['Your Title Here'],
    contents: ['Your multi-paragraph content here...'],
  },
  // ... more genres
};
```

#### Adjust Reviewer Count Per Draft
In `seedDemoData.ts`, line ~337:
```typescript
const reviewers = getRandomElements(reviewerPool, Math.floor(Math.random() * 3) + 2);
// Change: +2 to +3 for more reviewers, etc.
```

#### Preserve Existing Data
Comment out line 93 to keep existing data:
```typescript
// await UserModel.deleteMany({});
// await DraftModel.deleteMany({});
// ... (comment all deleteMany calls)
```

---

## 📋 Database Schema Reference

### User Document
```typescript
{
  email: "eleanor.blackwood@writers.pub",
  password_hash: "bcrypt_hash",
  display_name: "Eleanor Blackwood",
  role: "writer",
  bio: "Fantasy enthusiast...",
  genres: ["Fantasy", "Adventure"],
  trust_score: 350,
  is_verified: true,
  // ... timestamps
}
```

### Draft Document
```typescript
{
  author_id: ObjectId,
  title: "The Obsidian Inkwell (Draft)",
  content: { type: "doc", content: [...] },
  content_text: "Full text content...",
  genre: "Fantasy",
  status: "shared",
  visibility: "public",
  word_count: 1450,
  version: 1,
  tags: ["fantasy", "demo"],
  // ... timestamps
}
```

### Feedback Document
```typescript
{
  draft_id: ObjectId,
  reviewer_id: ObjectId,
  scores: { plot: 8, pacing: 9, character: 7 },
  written_feedback: "Excellent work...",
  helpfulness_score: 12,
  is_anonymous: false,
  // ... timestamps
}
```

---

## 🔄 Clearing Demo Data

To clear only demo data while preserving other records:

```bash
# Clear all collections (full reset)
npm run seed:demo

# Or manually in MongoDB:
db.users.deleteMany({ email: /writers\.pub/ })
db.drafts.deleteMany({ tags: "demo" })
```

---

## 📊 Performance Notes

- **Execution time**: ~10-30 seconds depending on MongoDB latency
- **Database size**: ~5MB added by demo data
- **Memory usage**: Low (stream operations preferred)
- **Network**: Multiple database operations (optimized with bulk operations where possible)

---

## 🐛 Troubleshooting

### Connection Failed Error
```
Error: Cannot connect to MongoDB. Aborting.
```
**Solution**: Verify `MONGO_URI` in `.env` file:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/writers_pub?retryWrites=true&w=majority
```

### Type Errors
```
Error: Cannot read property '_id' of undefined
```
**Solution**: Ensure MongoDB connection is successful before running seed.

### Duplicate Key Error
```
E11000 duplicate key error
```
**Solution**: Run `npm run seed:demo` again (it clears data first), or:
```bash
npm run seed:demo -- --fresh
```

---

## 📚 Related Scripts

- `npm run migrate` - Run database migrations
- `npm run seed` - Run basic seed (minimal data)
- `npm run seed:demo` - Run demo data seed (this one)
- `npm run build` - Build TypeScript
- `npm run dev` - Start development server

---

## 🎓 What You Can Do With This Data

### For Testing
- ✅ Test user authentication with real credentials
- ✅ Test feedback submission and visibility
- ✅ Test opportunity submission workflow
- ✅ Test notification system
- ✅ Test achievement unlock logic

### For Demos
- ✅ Show stakeholders an active platform
- ✅ Demonstrate user workflows end-to-end
- ✅ Showcase community engagement features
- ✅ Test UI with realistic content lengths

### For Development
- ✅ Frontend development without manual data entry
- ✅ Query optimization with realistic dataset sizes
- ✅ Performance testing with multiple users
- ✅ Feature development iteration

---

## 📝 Notes

- All generated content is fictional and created for demonstration purposes
- Names and emails are randomized and don't represent real people
- Timestamps are realistic but created at seed time
- Data relationships are maintained correctly for all foreign keys
- The seed script is idempotent (running it multiple times is safe)

---

## 🤝 Support

For issues or questions about the seeding system:

1. Check this documentation for troubleshooting steps
2. Review the seed script comments for implementation details
3. Check MongoDB connection and database state
4. Verify all required dependencies are installed

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
