# Writers' Pub - Demo Data Implementation Guide

## 🎯 System Architecture

### Data Generation Pipeline

```
seedDemoData.ts Script
    ↓
[DATABASE CLEAR] (Optional)
    ↓
[USER CREATION] → 5 users with roles
    ↓
[DRAFT GENERATION] → 9 drafts (3 per writer)
    ↓
[VERSION HISTORY] → 1-2 versions per draft
    ↓
[FEEDBACK CREATION] → 2-4 reviewers per draft
    ↓
[NOTIFICATIONS] → Auto-generated for feedback
    ↓
[OPPORTUNITIES] → 5 publishing opportunities
    ↓
[SUBMISSIONS] → 1-2 submissions per draft
    ↓
[NOTIFICATIONS] → Auto-generated for submissions
    ↓
[ACHIEVEMENTS] → 6 achievement types defined
    ↓
[USER ACHIEVEMENTS] → Random distribution
    ↓
[WRITING SESSIONS] → 5-10 sessions per writer
    ↓
[OUTPUT CREDENTIALS] → Display login info
```

---

## 🗂️ Data Model Relationships

```
User
├── Role: writer, editor, reader, admin
├── Genres: [string]
├── Trust Score: number
├── Is Verified: boolean
└── Relationships:
    ├── → Many Drafts (as author_id)
    ├── → Many Feedback (as reviewer_id)
    ├── → Many Opportunities (as publisher_id)
    ├── → Many Submissions (as submitter_id)
    ├── → Many Notifications (as user_id)
    ├── → Many UserAchievements (as user_id)
    └── → Many WritingSessions (as user_id)

Draft
├── Author ID: ObjectId (ref: User)
├── Title: string
├── Content: RichText | Text
├── Genre: string
├── Status: draft|shared|under_review|accepted|published
├── Visibility: private|editors_only|public
├── Version: number
├── Word Count: number
├── Tags: [string]
└── Relationships:
    ├── → Many DraftVersions
    ├── → Many Feedback
    ├── → Many InlineComments
    ├── → Many Submissions
    └── → Many WritingSessions

DraftVersion
├── Draft ID: ObjectId (ref: Draft)
├── Content: RichText | Text
├── Word Count: number
├── Version Number: number
└── Tracks: Edit history and changes

Feedback
├── Draft ID: ObjectId (ref: Draft)
├── Reviewer ID: ObjectId (ref: User)
├── Scores:
│   ├── Plot: 1-10
│   ├── Pacing: 1-10
│   └── Character: 1-10
├── Written Feedback: string
├── Helpfulness Score: number
└── Is Anonymous: boolean

Opportunity
├── Publisher ID: ObjectId (ref: User)
├── Title: string
├── Description: string
├── Genres: [string]
├── Deadline: Date
├── Word Limit Max: number
├── Is Paid: boolean
├── Is Featured: boolean
├── Is Active: boolean
└── Relationships:
    └── → Many Submissions

Submission
├── Draft ID: ObjectId (ref: Draft)
├── Opportunity ID: ObjectId (ref: Opportunity)
├── Submitter ID: ObjectId (ref: User)
├── Status: submitted|under_review|shortlisted|accepted|rejected
├── Editor Feedback: string
└── Reviewed At: Date

Notification
├── User ID: ObjectId (ref: User)
├── Type: feedback_received|submission_update|achievement_unlocked|system
├── Title: string
├── Message: string
├── Metadata: object
└── Is Read: boolean

Achievement
├── Key: string (unique)
├── Title: string
├── Description: string
├── Icon: emoji
└── Requirement Value: number

UserAchievement
├── User ID: ObjectId (ref: User)
├── Achievement ID: ObjectId (ref: Achievement)
├── Progress: number
├── Earned: boolean
└── Earned At: Date (nullable)

WritingSession
├── User ID: ObjectId (ref: User)
├── Draft ID: ObjectId (ref: Draft)
├── Started At: Date
├── Ended At: Date
└── Words Written: number
```

---

## 📋 Content Generation Strategy

### User Distribution
```
5 Users Total
├── 3 Writers (60%)
│   ├── Eleanor Blackwood (Fantasy)
│   ├── Sophie Mitchell (Mystery)
│   └── Aisha Patel (Romance)
├── 1 Editor (20%)
│   └── James Chen
└── 1 Reader (20%)
    └── Marcus Reader
```

### Content Distribution by Genre
```
9 Drafts Total
├── 3 Fantasy (33%)
│   ├── "The Obsidian Inkwell"
│   ├── "Shadow of the Forgotten Kingdom"
│   └── "The Enchanted Cartography"
├── 3 Mystery (33%)
│   ├── "The Last Letter"
│   ├── "Shadows at Midnight"
│   └── "The Archivist's Secret"
└── 3 Romance (33%)
    ├── "Letters Across Autumn"
    ├── "The Lighthouse Keeper's Heart"
    └── "Against All Stars"
```

### Feedback Distribution
```
Per Draft: 2-4 Reviewers
├── Plot Rating: 6-9
├── Pacing Rating: 6-9
├── Character Rating: 6-9
└── Written Feedback: [High-quality comments]

Total Feedback: 12+
├── Anonymous: ~30%
├── Attributed: ~70%
└── Helpfulness: 1-20 range
```

### Submission Pipeline
```
8+ Total Submissions
├── Status Distribution:
│   ├── Submitted: 40%
│   ├── Under Review: 25%
│   ├── Shortlisted: 12.5%
│   ├── Accepted: 12.5%
│   └── Rejected: 12.5%
└── Features:
    ├── Genre matching with opportunities
    ├── Word limit validation
    ├── Deadline tracking
    └── Editor feedback on some
```

---

## 🔐 Security Considerations

### Password Hashing
```typescript
const passwordHash = await bcrypt.hash(password, 12);
// Salt rounds: 12 (OWASP recommended)
// Execution time: ~100-150ms per hash
// Prevents rainbow table attacks
// Unique per user (different salt)
```

### Password Generation
```typescript
function generatePassword(): string {
  // 12-character random password
  // Includes: A-Z, a-z, 0-9, !@#$%
  // Entropy: ~84 bits (2^84 combinations)
  // Very strong for demonstration
}
```

### No Plain Text Passwords
- ✅ Passwords hashed immediately
- ✅ Original passwords displayed once (in seed output)
- ✅ Stored only as bcrypt hashes in database
- ✅ Cannot be recovered (one-way hash)

---

## 📊 Performance Characteristics

### Seed Execution Time
```
Clear Collections:    ~1-2 seconds
User Creation:        ~3-5 seconds (bcrypt hashing)
Draft Generation:     ~2-3 seconds
Feedback Creation:    ~3-4 seconds
Opportunities:        ~1 second
Submissions:          ~2-3 seconds
Achievements:         ~1-2 seconds
User Achievements:    ~2-3 seconds
Writing Sessions:     ~2-3 seconds
─────────────────────────────────
Total:               ~20-30 seconds

(Time varies with MongoDB latency)
```

### Database Size Impact
```
Users:                ~15 KB
Drafts:               ~450 KB
DraftVersions:        ~200 KB
Feedback:             ~180 KB
Opportunities:        ~30 KB
Submissions:          ~80 KB
Notifications:        ~120 KB
Achievements:         ~10 KB
UserAchievements:     ~50 KB
WritingSessions:      ~120 KB
─────────────────────────────────
Total:               ~1.25 MB (indexes may add 2-3x more)
```

### Query Performance
```
Find all drafts by user:     O(1) - indexed on author_id
Find feedback for draft:     O(n) - indexed on draft_id
Find user submissions:       O(n) - indexed on submitter_id
List opportunities:          O(n) - indexed on is_active
Get user notifications:      O(n) - indexed on user_id
```

---

## 🛠️ Implementation Checklist

### Prerequisites
- [ ] Node.js 16+ installed
- [ ] MongoDB Atlas account and cluster
- [ ] `.env` file with `MONGO_URI`
- [ ] `npm install` run in server directory
- [ ] All TypeScript dependencies installed

### Setup Steps
- [ ] Copy seed script to `server/src/db/seedDemoData.ts`
- [ ] Update `server/package.json` with seed:demo script
- [ ] Verify database connection
- [ ] Create backup of existing data (if any)
- [ ] Run: `npm run seed:demo`

### Verification Steps
- [ ] Check console output for success messages
- [ ] Verify all 5 users created
- [ ] Verify credentials displayed
- [ ] Check MongoDB for data:
  ```javascript
  // In MongoDB Shell:
  db.users.countDocuments()      // Should be 5
  db.drafts.countDocuments()     // Should be 9
  db.feedbacks.countDocuments()  // Should be 12+
  db.opportunities.countDocuments() // Should be 5
  ```
- [ ] Test login with each user
- [ ] Verify data visibility

### Post-Seed Steps
- [ ] Start backend: `npm run dev`
- [ ] Start frontend: `cd ../web && npm run dev`
- [ ] Open http://localhost:3000
- [ ] Login and explore
- [ ] Run validation checklist

---

## 🔍 Debugging

### Enable Verbose Logging
```typescript
// Add to seedDemoData.ts before main loop:
console.log('DEBUG: User pool:', {
  writers: writers.length,
  editors: editors.length,
  readers: readers.length
});
```

### Database Verification
```javascript
// MongoDB Shell commands:

// Check users
db.users.find().pretty()

// Check drafts
db.drafts.find({ author_id: ObjectId("...") }).pretty()

// Check feedback
db.feedbacks.countDocuments({ draft_id: ObjectId("...") })

// Check submissions
db.submissions.find({ status: "accepted" }).pretty()

// Check notifications
db.notifications.countDocuments({ is_read: false })
```

### Common Issues Log

| Error | Cause | Solution |
|-------|-------|----------|
| Cannot connect to MongoDB | Invalid MONGO_URI | Check `.env` file |
| E11000 duplicate key | Data already exists | Clear collections or run again |
| ObjectId is not defined | Import issue | Check imports at top of file |
| bcrypt hash timeout | Slow system | Increase salt rounds gradually |
| Memory exceeded | Too much data | Reduce draft content size |
| Timeout error | Network issue | Check MongoDB connection |

---

## 📈 Scaling the Demo

### For Larger Demos (100+ users)
```typescript
// Modify user generation loop
for (let i = 0; i < 100; i++) {
  const email = `user${i}@writers.pub`;
  // ... create user
}

// Create 3-5 drafts per writer
for (let i = 0; i < 5; i++) {
  // ... create draft
}

// Expected time: 5-10 minutes
// Expected size: 50-100 MB
```

### For Production Use
- [ ] Seed only once at deployment
- [ ] Archive credentials securely
- [ ] Use environment-specific data
- [ ] Implement data retention policies
- [ ] Monitor database growth
- [ ] Plan for data cleanup

---

## 🎓 Learning Resources

### Understanding the Code

**Key Functions:**
- `generatePassword()`: Creates secure random passwords
- `getGenreContent()`: Selects realistic content
- `countWords()`: Calculates word counts
- `getRandomElement()`: Selects random items
- `getRandomElements()`: Selects multiple random items

**Key Loops:**
- User creation: Creates users with roles
- Draft generation: Creates 3 drafts per writer
- Feedback creation: Assigns 2-4 reviewers per draft
- Submission creation: Matches drafts to opportunities

**Key Models:**
- User: Platform member
- Draft: Written content
- Feedback: Review and ratings
- Opportunity: Publishing venue
- Submission: Draft → Opportunity link
- Notification: User alerts
- Achievement: Gamification
- WritingSession: Activity tracking

---

## 🚀 Next Steps

1. **Run the Seed**
   ```bash
   cd server && npm run seed:demo
   ```

2. **Save Credentials**
   ```bash
   # Copy credentials to safe location
   # Keep CREDENTIALS.md handy
   ```

3. **Start Development**
   ```bash
   npm run dev
   cd ../web && npm run dev
   ```

4. **Explore Features**
   - Login as writer → View drafts and feedback
   - Login as editor → Manage opportunities
   - Login as reader → Browse and rate content

5. **Test Workflows**
   - Submit draft to opportunity
   - Leave feedback on draft
   - Check notifications
   - View achievements
   - Browse discovery

6. **Share Demo**
   - Use credentials for stakeholder demos
   - Showcase active community
   - Demonstrate full feature set
   - Get feedback on UX

---

**Status**: ✅ Ready for Implementation  
**Last Updated**: April 21, 2026  
**Version**: 1.0.0
