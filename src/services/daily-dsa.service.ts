const problems = [
  { title: "Two Sum", difficulty: "Easy", concepts: "hash maps", prompt: "Given an array of integers and a target, return indices of two numbers whose sum equals the target." },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", concepts: "sliding window", prompt: "Find the length of the longest substring without repeated characters." },
  { title: "Number of Islands", difficulty: "Medium", concepts: "graphs, DFS/BFS", prompt: "Count connected components of land in a binary grid." },
  { title: "Course Schedule", difficulty: "Medium", concepts: "topological sorting", prompt: "Determine whether all courses can be completed from prerequisite pairs." },
  { title: "Merge Intervals", difficulty: "Medium", concepts: "sorting, intervals", prompt: "Merge all overlapping intervals in a list." },
  { title: "Lowest Common Ancestor", difficulty: "Medium", concepts: "binary trees", prompt: "Find the lowest common ancestor of two nodes in a binary tree." },
  { title: "LRU Cache", difficulty: "Medium", concepts: "hash maps, linked lists", prompt: "Design a fixed-capacity cache with O(1) get and put operations." },
] as const;

export class DailyDsaService {
  getChallenge(date = new Date()): string {
    const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
    const problem = problems[day % problems.length]!;
    return `Today's DSA problem — ${problem.title} (${problem.difficulty})\n\n${problem.prompt}\n\nFocus: ${problem.concepts}.\n\nTry it for 25 minutes. Reply “hint” when you want a nudge, or share your approach for feedback.`;
  }
}
