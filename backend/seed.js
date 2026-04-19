import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import User     from './models/User.js';
import Progress from './models/Progress.js';
import Sheet    from './models/Sheet.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('✅  MongoDB connected\n');

// ─── Wipe existing demo data ──────────────────────────────────────────────────
await User.deleteMany({ email: { $regex: /@dsademo\.com$/ } });
console.log('🗑   Cleared old demo data');

const demoEmails = await User.find({ email: { $regex: /@dsademo\.com$/ } });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hash = (pw) => bcrypt.hash(pw, 12);

const daysAgo = (n) => Math.floor((Date.now() - n * 86400000) / 1000);

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Build realistic recent submissions for the last N days
const buildSubmissions = (problems, activeDays = 30, perDay = 2) => {
  const submissions = [];
  for (let d = activeDays; d >= 0; d--) {
    // Skip some days to make the heatmap look natural (not every day active)
    if (Math.random() < 0.3) continue;
    const count = randomBetween(1, perDay);
    for (let i = 0; i < count; i++) {
      const prob = problems[randomBetween(0, problems.length - 1)];
      submissions.push({
        title:     prob.title,
        titleSlug: prob.titleSlug,
        timestamp: daysAgo(d) - randomBetween(0, 3600),
        status:    'Accepted',
        lang:      ['python3', 'cpp', 'java', 'javascript'][randomBetween(0, 3)],
      });
    }
  }
  return submissions.slice(-20); // keep last 20
};

// ─── Problem pool (real LeetCode problems) ────────────────────────────────────
const PROBLEMS = [
  { title: 'Two Sum',                         titleSlug: 'two-sum',                          difficulty: 'Easy',   topic: 'Arrays'              },
  { title: 'Best Time to Buy and Sell Stock', titleSlug: 'best-time-to-buy-and-sell-stock',  difficulty: 'Easy',   topic: 'Arrays'              },
  { title: 'Contains Duplicate',              titleSlug: 'contains-duplicate',                difficulty: 'Easy',   topic: 'Arrays'              },
  { title: 'Maximum Subarray',                titleSlug: 'maximum-subarray',                  difficulty: 'Medium', topic: 'Arrays'              },
  { title: 'Product of Array Except Self',    titleSlug: 'product-of-array-except-self',      difficulty: 'Medium', topic: 'Arrays'              },
  { title: 'Valid Anagram',                   titleSlug: 'valid-anagram',                     difficulty: 'Easy',   topic: 'Strings'             },
  { title: 'Longest Substring Without Repeating Characters', titleSlug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', topic: 'Strings' },
  { title: 'Group Anagrams',                  titleSlug: 'group-anagrams',                    difficulty: 'Medium', topic: 'Strings'             },
  { title: 'Reverse Linked List',             titleSlug: 'reverse-linked-list',               difficulty: 'Easy',   topic: 'Linked Lists'        },
  { title: 'Merge Two Sorted Lists',          titleSlug: 'merge-two-sorted-lists',            difficulty: 'Easy',   topic: 'Linked Lists'        },
  { title: 'Linked List Cycle',               titleSlug: 'linked-list-cycle',                 difficulty: 'Easy',   topic: 'Linked Lists'        },
  { title: 'Reorder List',                    titleSlug: 'reorder-list',                      difficulty: 'Medium', topic: 'Linked Lists'        },
  { title: 'Invert Binary Tree',              titleSlug: 'invert-binary-tree',                difficulty: 'Easy',   topic: 'Trees'               },
  { title: 'Maximum Depth of Binary Tree',    titleSlug: 'maximum-depth-of-binary-tree',      difficulty: 'Easy',   topic: 'Trees'               },
  { title: 'Binary Tree Level Order Traversal', titleSlug: 'binary-tree-level-order-traversal', difficulty: 'Medium', topic: 'Trees'             },
  { title: 'Validate Binary Search Tree',     titleSlug: 'validate-binary-search-tree',       difficulty: 'Medium', topic: 'Trees'               },
  { title: 'Binary Tree Right Side View',     titleSlug: 'binary-tree-right-side-view',       difficulty: 'Medium', topic: 'Trees'               },
  { title: 'Serialize and Deserialize Binary Tree', titleSlug: 'serialize-and-deserialize-binary-tree', difficulty: 'Hard', topic: 'Trees'       },
  { title: 'Climbing Stairs',                 titleSlug: 'climbing-stairs',                   difficulty: 'Easy',   topic: 'Dynamic Programming' },
  { title: 'House Robber',                    titleSlug: 'house-robber',                      difficulty: 'Medium', topic: 'Dynamic Programming' },
  { title: 'Coin Change',                     titleSlug: 'coin-change',                       difficulty: 'Medium', topic: 'Dynamic Programming' },
  { title: 'Longest Common Subsequence',      titleSlug: 'longest-common-subsequence',        difficulty: 'Medium', topic: 'Dynamic Programming' },
  { title: 'Word Break',                      titleSlug: 'word-break',                        difficulty: 'Medium', topic: 'Dynamic Programming' },
  { title: 'Longest Increasing Subsequence',  titleSlug: 'longest-increasing-subsequence',    difficulty: 'Medium', topic: 'Dynamic Programming' },
  { title: 'Edit Distance',                   titleSlug: 'edit-distance',                     difficulty: 'Hard',   topic: 'Dynamic Programming' },
  { title: 'Binary Search',                   titleSlug: 'binary-search',                     difficulty: 'Easy',   topic: 'Binary Search'       },
  { title: 'Search in Rotated Sorted Array',  titleSlug: 'search-in-rotated-sorted-array',    difficulty: 'Medium', topic: 'Binary Search'       },
  { title: 'Find Minimum in Rotated Sorted Array', titleSlug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium', topic: 'Binary Search' },
  { title: 'Number of Islands',               titleSlug: 'number-of-islands',                 difficulty: 'Medium', topic: 'Graphs'              },
  { title: 'Clone Graph',                     titleSlug: 'clone-graph',                       difficulty: 'Medium', topic: 'Graphs'              },
  { title: 'Pacific Atlantic Water Flow',     titleSlug: 'pacific-atlantic-water-flow',        difficulty: 'Medium', topic: 'Graphs'              },
  { title: 'Course Schedule',                 titleSlug: 'course-schedule',                   difficulty: 'Medium', topic: 'Graphs'              },
  { title: 'Word Ladder',                     titleSlug: 'word-ladder',                       difficulty: 'Hard',   topic: 'Graphs'              },
  { title: 'Valid Parentheses',               titleSlug: 'valid-parentheses',                 difficulty: 'Easy',   topic: 'Stacks & Queues'     },
  { title: 'Min Stack',                       titleSlug: 'min-stack',                         difficulty: 'Medium', topic: 'Stacks & Queues'     },
  { title: 'Daily Temperatures',              titleSlug: 'daily-temperatures',                difficulty: 'Medium', topic: 'Stacks & Queues'     },
  { title: 'Kth Largest Element in an Array', titleSlug: 'kth-largest-element-in-an-array',   difficulty: 'Medium', topic: 'Heaps'               },
  { title: 'Find Median from Data Stream',    titleSlug: 'find-median-from-data-stream',       difficulty: 'Hard',   topic: 'Heaps'               },
  { title: 'Merge K Sorted Lists',            titleSlug: 'merge-k-sorted-lists',              difficulty: 'Hard',   topic: 'Heaps'               },
  { title: 'Combination Sum',                 titleSlug: 'combination-sum',                   difficulty: 'Medium', topic: 'Backtracking'        },
  { title: 'Permutations',                    titleSlug: 'permutations',                       difficulty: 'Medium', topic: 'Backtracking'        },
  { title: 'Subsets',                         titleSlug: 'subsets',                           difficulty: 'Medium', topic: 'Backtracking'        },
  { title: 'N-Queens',                        titleSlug: 'n-queens',                          difficulty: 'Hard',   topic: 'Backtracking'        },
  { title: 'Move Zeroes',                     titleSlug: 'move-zeroes',                       difficulty: 'Easy',   topic: 'Two Pointers'        },
  { title: '3Sum',                            titleSlug: '3sum',                              difficulty: 'Medium', topic: 'Two Pointers'        },
  { title: 'Container With Most Water',       titleSlug: 'container-with-most-water',          difficulty: 'Medium', topic: 'Two Pointers'        },
  { title: 'Sliding Window Maximum',          titleSlug: 'sliding-window-maximum',             difficulty: 'Hard',   topic: 'Sliding Window'      },
  { title: 'Minimum Window Substring',        titleSlug: 'minimum-window-substring',           difficulty: 'Hard',   topic: 'Sliding Window'      },
  { title: 'Implement Trie',                  titleSlug: 'implement-trie-prefix-tree',         difficulty: 'Medium', topic: 'Tries'               },
  { title: 'Word Search II',                  titleSlug: 'word-search-ii',                    difficulty: 'Hard',   topic: 'Tries'               },
  { title: 'Sort Colors',                     titleSlug: 'sort-colors',                       difficulty: 'Medium', topic: 'Sorting'             },
  { title: 'Median of Two Sorted Arrays',     titleSlug: 'median-of-two-sorted-arrays',        difficulty: 'Hard',   topic: 'Binary Search'       },
  { title: 'Trapping Rain Water',             titleSlug: 'trapping-rain-water',               difficulty: 'Hard',   topic: 'Two Pointers'        },
];

// Build topicStats from a solved list
const buildTopicStats = (solvedList) => {
  const map = {};
  solvedList.forEach((p) => {
    map[p.topic] = (map[p.topic] || 0) + 1;
  });
  return map;
};

// ─── Teacher ─────────────────────────────────────────────────────────────────
const CLASS_CODE = 'CS2025AB';

const teacher = await User.create({
  name:        'Dr. Priya Sharma',
  email:       'teacher@dsademo.com',
  password:    await hash('demo1234'),
  role:        'teacher',
  myClassCode: CLASS_CODE,
  avatar:      'https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=b6e3f4',
});
await Progress.create({ student: teacher._id });
console.log(`👩‍🏫  Teacher created: teacher@dsademo.com / demo1234`);

// ─── Students config ──────────────────────────────────────────────────────────
// Each student has a different skill level so all charts look varied & realistic
const STUDENTS = [
  {
    name:             'Arjun Mehta',
    email:            'arjun@dsademo.com',
    leetcodeUsername: 'arjun_codes',
    avatar:           'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun&backgroundColor=c0aede',
    // Legend tier — 350+ solved
    easy: 120, medium: 180, hard: 62,
    acceptanceRate: 68.4, ranking: 12430,
    activeDays: 35, perDay: 3,
  },
  {
    name:             'Sneha Patel',
    email:            'sneha@dsademo.com',
    leetcodeUsername: 'sneha_dsa',
    avatar:           'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha&backgroundColor=ffd5dc',
    // Expert tier — 280 solved
    easy: 95, medium: 145, hard: 40,
    acceptanceRate: 61.2, ranking: 28750,
    activeDays: 30, perDay: 2,
  },
  {
    name:             'Rohan Verma',
    email:            'rohan@dsademo.com',
    leetcodeUsername: 'rohan_v',
    avatar:           'https://api.dicebear.com/7.x/avataaars/svg?seed=rohan&backgroundColor=b6e3f4',
    // Coder tier — 180 solved
    easy: 70, medium: 90, hard: 20,
    acceptanceRate: 55.8, ranking: 67200,
    activeDays: 25, perDay: 2,
  },
  {
    name:             'Ananya Singh',
    email:            'ananya@dsademo.com',
    leetcodeUsername: 'ananya_singh',
    avatar:           'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya&backgroundColor=d1d4f9',
    // Coder tier — 160 solved
    easy: 65, medium: 80, hard: 15,
    acceptanceRate: 58.1, ranking: 82100,
    activeDays: 22, perDay: 2,
  },
  {
    name:             'Karan Joshi',
    email:            'karan@dsademo.com',
    leetcodeUsername: 'karan_joshi99',
    avatar:           'https://api.dicebear.com/7.x/avataaars/svg?seed=karan&backgroundColor=c1f4c5',
    // Grinder tier — 90 solved
    easy: 45, medium: 38, hard: 7,
    acceptanceRate: 49.3, ranking: 145000,
    activeDays: 18, perDay: 1,
  },
  {
    name:             'Meera Nair',
    email:            'meera@dsademo.com',
    leetcodeUsername: 'meera_nair',
    avatar:           'https://api.dicebear.com/7.x/avataaars/svg?seed=meera&backgroundColor=ffdfbf',
    // Grinder tier — 70 solved
    easy: 38, medium: 28, hard: 4,
    acceptanceRate: 44.7, ranking: 198000,
    activeDays: 14, perDay: 1,
  },
  {
    name:             'Dev Kapoor',
    email:            'dev@dsademo.com',
    leetcodeUsername: 'dev_kapoor',
    avatar:           'https://api.dicebear.com/7.x/avataaars/svg?seed=dev&backgroundColor=ffd5dc',
    // Rookie tier — 35 solved
    easy: 22, medium: 11, hard: 2,
    acceptanceRate: 38.5, ranking: 310000,
    activeDays: 10, perDay: 1,
  },
];

// ─── Create students + their LeetCode progress ────────────────────────────────
const createdStudents = [];

for (const s of STUDENTS) {
  const user = await User.create({
    name:             s.name,
    email:            s.email,
    password:         await hash('demo1234'),
    role:             'student',
    classCode:        CLASS_CODE,
    leetcodeUsername: s.leetcodeUsername,
    avatar:           s.avatar,
  });

  const totalSolved = s.easy + s.medium + s.hard;

  // Pick a realistic solved subset from the problem pool
  const shuffled = [...PROBLEMS].sort(() => Math.random() - 0.5);
  const solvedProblems = shuffled.slice(0, Math.min(totalSolved, PROBLEMS.length));
  const topicStats     = buildTopicStats(solvedProblems);
  const recentSubs     = buildSubmissions(solvedProblems, s.activeDays, s.perDay);

  await Progress.create({
    student: user._id,
    leetcode: {
      totalSolved,
      easySolved:       s.easy,
      mediumSolved:     s.medium,
      hardSolved:       s.hard,
      totalSubmissions: Math.floor(totalSolved / (s.acceptanceRate / 100)),
      acceptanceRate:   s.acceptanceRate,
      ranking:          s.ranking,
      topicStats,
      recentSubmissions: recentSubs,
      lastSynced:        new Date(),
    },
    sheetProgress: [], // filled after sheets are created
  });

  createdStudents.push(user);
  console.log(
    `👤  Student: ${s.email} / demo1234  (${totalSolved} solved, ${s.leetcodeUsername})`
  );
}

// ─── Problem Sheets ───────────────────────────────────────────────────────────
const SHEETS = [
  {
    title:       'Week 1 — Arrays & Hashing Foundation',
    description: 'Master the core building blocks. Focus on O(n) time solutions using hash maps.',
    isPublished: true,
    dueDate:     new Date(Date.now() + 3 * 86400000), // due in 3 days
    problems: [
      { title: 'Two Sum',                         url: 'https://leetcode.com/problems/two-sum',                         difficulty: 'Easy',   topic: 'Arrays',   notes: 'Classic hash map problem. Aim for O(n).' },
      { title: 'Contains Duplicate',              url: 'https://leetcode.com/problems/contains-duplicate',              difficulty: 'Easy',   topic: 'Arrays',   notes: 'Use a set for O(n) solution.' },
      { title: 'Valid Anagram',                   url: 'https://leetcode.com/problems/valid-anagram',                   difficulty: 'Easy',   topic: 'Strings',  notes: 'Count character frequencies.' },
      { title: 'Group Anagrams',                  url: 'https://leetcode.com/problems/group-anagrams',                  difficulty: 'Medium', topic: 'Strings',  notes: 'Sort each word as a key for grouping.' },
      { title: 'Product of Array Except Self',    url: 'https://leetcode.com/problems/product-of-array-except-self',    difficulty: 'Medium', topic: 'Arrays',   notes: 'Try prefix and suffix products without division.' },
      { title: 'Maximum Subarray',                url: 'https://leetcode.com/problems/maximum-subarray',                difficulty: 'Medium', topic: 'Arrays',   notes: "Kadane's algorithm — track current and global max." },
    ],
  },
  {
    title:       'Week 2 — Trees & Binary Search',
    description: 'Recursive thinking is key here. Draw the recursion tree before coding.',
    isPublished: true,
    dueDate:     new Date(Date.now() + 7 * 86400000), // due in 7 days
    problems: [
      { title: 'Invert Binary Tree',                    url: 'https://leetcode.com/problems/invert-binary-tree',                    difficulty: 'Easy',   topic: 'Trees',        notes: 'Simple recursion. Swap left and right.' },
      { title: 'Maximum Depth of Binary Tree',          url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree',          difficulty: 'Easy',   topic: 'Trees',        notes: 'DFS or BFS both work well.' },
      { title: 'Validate Binary Search Tree',           url: 'https://leetcode.com/problems/validate-binary-search-tree',           difficulty: 'Medium', topic: 'Trees',        notes: 'Pass min/max bounds through recursion.' },
      { title: 'Binary Tree Level Order Traversal',     url: 'https://leetcode.com/problems/binary-tree-level-order-traversal',     difficulty: 'Medium', topic: 'Trees',        notes: 'BFS with a queue. Track level boundaries.' },
      { title: 'Binary Search',                         url: 'https://leetcode.com/problems/binary-search',                         difficulty: 'Easy',   topic: 'Binary Search',notes: 'Get the template right — lo, hi, mid.' },
      { title: 'Search in Rotated Sorted Array',        url: 'https://leetcode.com/problems/search-in-rotated-sorted-array',        difficulty: 'Medium', topic: 'Binary Search',notes: 'Identify which half is sorted first.' },
      { title: 'Find Minimum in Rotated Sorted Array',  url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array',  difficulty: 'Medium', topic: 'Binary Search',notes: 'Classic binary search variant.' },
    ],
  },
  {
    title:       'Week 3 — Dynamic Programming Sprint',
    description: 'DP is the most asked topic in interviews. Nail the patterns here.',
    isPublished: true,
    dueDate:     new Date(Date.now() + 14 * 86400000), // due in 14 days
    problems: [
      { title: 'Climbing Stairs',                   url: 'https://leetcode.com/problems/climbing-stairs',                   difficulty: 'Easy',   topic: 'Dynamic Programming', notes: 'Fibonacci pattern. Bottom-up is cleanest.' },
      { title: 'House Robber',                      url: 'https://leetcode.com/problems/house-robber',                      difficulty: 'Medium', topic: 'Dynamic Programming', notes: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])' },
      { title: 'Coin Change',                       url: 'https://leetcode.com/problems/coin-change',                       difficulty: 'Medium', topic: 'Dynamic Programming', notes: 'Unbounded knapsack pattern. Fill dp bottom-up.' },
      { title: 'Longest Common Subsequence',        url: 'https://leetcode.com/problems/longest-common-subsequence',        difficulty: 'Medium', topic: 'Dynamic Programming', notes: 'Classic 2D DP. Draw the table on paper first.' },
      { title: 'Word Break',                        url: 'https://leetcode.com/problems/word-break',                        difficulty: 'Medium', topic: 'Dynamic Programming', notes: 'dp[i] = can we form word[0..i] from dictionary.' },
      { title: 'Longest Increasing Subsequence',    url: 'https://leetcode.com/problems/longest-increasing-subsequence',    difficulty: 'Medium', topic: 'Dynamic Programming', notes: 'O(n log n) with patience sort is impressive.' },
      { title: 'Edit Distance',                     url: 'https://leetcode.com/problems/edit-distance',                     difficulty: 'Hard',   topic: 'Dynamic Programming', notes: 'Build the 2D DP table step by step.' },
    ],
  },
  {
    title:       'Bonus — Graphs & Hard Problems',
    description: 'For students targeting top product companies. Only attempt after completing Weeks 1–3.',
    isPublished: true,
    dueDate:     new Date(Date.now() + 21 * 86400000), // due in 21 days
    problems: [
      { title: 'Number of Islands',           url: 'https://leetcode.com/problems/number-of-islands',           difficulty: 'Medium', topic: 'Graphs',          notes: 'DFS flood-fill on a grid.' },
      { title: 'Course Schedule',             url: 'https://leetcode.com/problems/course-schedule',             difficulty: 'Medium', topic: 'Graphs',          notes: 'Detect cycle in directed graph — topological sort.' },
      { title: 'Pacific Atlantic Water Flow', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow', difficulty: 'Medium', topic: 'Graphs',          notes: 'Reverse BFS from both oceans inward.' },
      { title: 'Trapping Rain Water',         url: 'https://leetcode.com/problems/trapping-rain-water',         difficulty: 'Hard',   topic: 'Two Pointers',    notes: 'Two-pointer O(n) is the elegant approach.' },
      { title: 'Merge K Sorted Lists',        url: 'https://leetcode.com/problems/merge-k-sorted-lists',        difficulty: 'Hard',   topic: 'Heaps',           notes: 'Min-heap of size k. Classic priority queue problem.' },
      { title: 'Find Median from Data Stream',url: 'https://leetcode.com/problems/find-median-from-data-stream',difficulty: 'Hard',   topic: 'Heaps',           notes: 'Two heaps: max-heap for lower half, min-heap for upper.' },
      { title: 'Word Ladder',                 url: 'https://leetcode.com/problems/word-ladder',                  difficulty: 'Hard',   topic: 'Graphs',          notes: 'BFS shortest path in word graph. Pre-build adjacency list.' },
      { title: 'N-Queens',                    url: 'https://leetcode.com/problems/n-queens',                    difficulty: 'Hard',   topic: 'Backtracking',    notes: 'Backtrack with row, col, and diagonal sets.' },
    ],
  },
];

const createdSheets = [];
for (const sheetData of SHEETS) {
  const sheet = await Sheet.create({
    ...sheetData,
    createdBy: teacher._id,
    classCode: CLASS_CODE,
  });
  createdSheets.push(sheet);
  console.log(`📋  Sheet created: "${sheet.title}" (${sheet.problems.length} problems)`);
}

// ─── Add realistic sheet progress for each student ────────────────────────────
// Top students have completed more problems; beginners have done fewer

const completionProfiles = [
  // arjun — top student, nearly done everything
  [
    { sheetIdx: 0, done: [0,1,2,3,4,5]     }, // all 6
    { sheetIdx: 1, done: [0,1,2,3,4,5,6]   }, // all 7
    { sheetIdx: 2, done: [0,1,2,3,4,5]     }, // 6 of 7
    { sheetIdx: 3, done: [0,1,2,3,4]       }, // 5 of 8
  ],
  // sneha — strong student
  [
    { sheetIdx: 0, done: [0,1,2,3,4,5]     }, // all
    { sheetIdx: 1, done: [0,1,2,3,4,5]     }, // 6 of 7
    { sheetIdx: 2, done: [0,1,2,3,4]       }, // 5 of 7
    { sheetIdx: 3, done: [0,1,2]           }, // 3 of 8
  ],
  // rohan — mid-tier
  [
    { sheetIdx: 0, done: [0,1,2,3,4]       }, // 5 of 6
    { sheetIdx: 1, done: [0,1,2,3]         }, // 4 of 7
    { sheetIdx: 2, done: [0,1,2]           }, // 3 of 7
    { sheetIdx: 3, done: []                }, // none
  ],
  // ananya — mid-tier
  [
    { sheetIdx: 0, done: [0,1,2,3]         }, // 4 of 6
    { sheetIdx: 1, done: [0,1,2,3]         }, // 4 of 7
    { sheetIdx: 2, done: [0,1]             }, // 2 of 7
    { sheetIdx: 3, done: []                }, // none
  ],
  // karan — beginner-mid
  [
    { sheetIdx: 0, done: [0,1,2]           }, // 3 of 6
    { sheetIdx: 1, done: [0,1,2]           }, // 3 of 7
    { sheetIdx: 2, done: [0]               }, // 1 of 7
    { sheetIdx: 3, done: []                }, // none
  ],
  // meera — beginner
  [
    { sheetIdx: 0, done: [0,1]             }, // 2 of 6
    { sheetIdx: 1, done: [0,1]             }, // 2 of 7
    { sheetIdx: 2, done: []                }, // none
    { sheetIdx: 3, done: []                }, // none
  ],
  // dev — just started
  [
    { sheetIdx: 0, done: [0]               }, // 1 of 6
    { sheetIdx: 1, done: []                }, // none
    { sheetIdx: 2, done: []                }, // none
    { sheetIdx: 3, done: []                }, // none
  ],
];

for (let si = 0; si < createdStudents.length; si++) {
  const student  = createdStudents[si];
  const profile  = completionProfiles[si];
  const progress = await Progress.findOne({ student: student._id });

  progress.sheetProgress = profile
    .filter(({ done }) => done.length > 0)
    .map(({ sheetIdx, done }) => ({
      sheet:             createdSheets[sheetIdx]._id,
      completedProblems: done,
      lastUpdated:       new Date(Date.now() - randomBetween(0, 5) * 86400000),
    }));

  await progress.save();
}
console.log('\n📊  Sheet progress saved for all students');

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`
╔══════════════════════════════════════════════════════════╗
║              🌱  SEED COMPLETE — LOGIN DETAILS            ║
╠══════════════════════════════════════════════════════════╣
║  PASSWORD for ALL accounts:  demo1234                    ║
╠══════════════════════════════════════════════════════════╣
║  TEACHER                                                 ║
║  Email:   teacher@dsademo.com                            ║
║  Role:    Teacher  |  Class Code: ${CLASS_CODE}               ║
╠══════════════════════════════════════════════════════════╣
║  STUDENTS (all in class ${CLASS_CODE})                        ║
║                                                          ║
║  arjun@dsademo.com    → 362 solved  👑 Legend            ║
║  sneha@dsademo.com    → 280 solved  💎 Expert            ║
║  rohan@dsademo.com    → 180 solved  🔥 Coder             ║
║  ananya@dsademo.com   → 160 solved  🔥 Coder             ║
║  karan@dsademo.com    →  90 solved  ⚡ Grinder           ║
║  meera@dsademo.com    →  70 solved  ⚡ Grinder           ║
║  dev@dsademo.com      →  35 solved  🌱 Rookie            ║
╠══════════════════════════════════════════════════════════╣
║  SHEETS CREATED (4 published)                            ║
║  • Week 1 — Arrays & Hashing Foundation (6 problems)    ║
║  • Week 2 — Trees & Binary Search (7 problems)          ║
║  • Week 3 — Dynamic Programming Sprint (7 problems)     ║
║  • Bonus  — Graphs & Hard Problems (8 problems)         ║
╚══════════════════════════════════════════════════════════╝
`);

await mongoose.disconnect();