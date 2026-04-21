import axios from 'axios';

const LC_GRAPHQL = 'https://leetcode.com/graphql';

// ─── Shared axios instance with browser-like headers (bypass Cloudflare) ──────
const lcAxios = axios.create({
  baseURL: LC_GRAPHQL,
  headers: {
    'Content-Type': 'application/json',
    'Referer':      'https://leetcode.com',
    'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
    'Origin':       'https://leetcode.com',
  },
  timeout: 15000,
});

// ─── GraphQL Queries ──────────────────────────────────────────────────────────

// 1. Profile overview (solved counts, ranking, acceptance)
const PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
        starRating
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

// 2. Recent accepted submissions (last 20)
const RECENT_SUBMISSIONS_QUERY = `
  query getRecentSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      lang
    }
  }
`;

// 3. Tag / topic breakdown (how many solved per topic)
const TOPIC_STATS_QUERY = `
  query getUserTagProblemCounts($username: String!) {
    matchedUser(username: $username) {
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
    }
  }
`;

// ─── Helper: run a single GraphQL query ──────────────────────────────────────
const gql = async (query, variables) => {
  const { data } = await lcAxios.post('', { query, variables });
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
};

// ─── Main export: fetch everything and return a unified stats object ──────────
export const fetchLeetCodeStats = async (username) => {
  try {
    // Run all 3 queries in parallel for speed
    const [profileData, recentData, topicData] = await Promise.all([
      gql(PROFILE_QUERY,          { username }),
      gql(RECENT_SUBMISSIONS_QUERY, { username, limit: 20 }),
      gql(TOPIC_STATS_QUERY,      { username }),
    ]);

    // ── Parse profile ──────────────────────────────────────────────────────
    const matched = profileData?.matchedUser;
    if (!matched) return { error: `LeetCode user "${username}" not found.` };

    const acStats = matched.submitStats?.acSubmissionNum || [];
    const find = (diff) => acStats.find(s => s.difficulty === diff) || {};

    const totalSolved  = find('All').count         || 0;
    const totalSubs    = find('All').submissions    || 0;
    const easySolved   = find('Easy').count         || 0;
    const mediumSolved = find('Medium').count       || 0;
    const hardSolved   = find('Hard').count         || 0;
    const acceptanceRate = totalSubs > 0 ? +((totalSolved / totalSubs) * 100).toFixed(1) : 0;
    const ranking      = matched.profile?.ranking   || 0;

    // ── Parse recent submissions ───────────────────────────────────────────
    const recentSubmissions = (recentData?.recentAcSubmissionList || []).map(s => ({
      title:     s.title,
      titleSlug: s.titleSlug,
      timestamp: Number(s.timestamp),
      status:    'Accepted', // this query only returns AC
      lang:      s.lang,
    }));

    // ── Parse topic stats into a flat map ─────────────────────────────────
    const tagCounts = topicData?.matchedUser?.tagProblemCounts || {};
    const allTags = [
      ...(tagCounts.fundamental || []),
      ...(tagCounts.intermediate || []),
      ...(tagCounts.advanced || []),
    ];

    const topicStats = {};
    for (const tag of allTags) {
      if (tag.problemsSolved > 0) {
        // Normalize tag names: "dynamic-programming" → "Dynamic Programming"
        const label = tag.tagName
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        topicStats[label] = (topicStats[label] || 0) + tag.problemsSolved;
      }
    }

    return {
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions: totalSubs,
      acceptanceRate,
      ranking,
      topicStats,
      recentSubmissions,
    };
  } catch (err) {
    console.error('[LeetCode Fetch Error]', err.message);
    // Graceful error — don't crash the route
    return { error: `Failed to fetch LeetCode data: ${err.message}` };
  }
};

// ─── Lightweight check: does this username exist? (used during profile setup) ─
export const verifyLeetCodeUser = async (username) => {
  try {
    const data = await gql(PROFILE_QUERY, { username });
    return !!data?.matchedUser;
  } catch {
    return false;
  }
};

// Add this export at the bottom of the file, after verifyLeetCodeUser

export const verifyProblemSolved = async (username, titleSlug) => {
  try {
    const data = await gql(
      `query($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          titleSlug
          timestamp
        }
      }`,
      { username, limit: 100 }
    );
    const list  = data?.recentAcSubmissionList ?? [];
    const found = list.find((s) => s.titleSlug === titleSlug);
    return { solved: !!found, timestamp: found?.timestamp ?? null };
  } catch (err) {
    return { solved: false, error: err.message };
  }
};