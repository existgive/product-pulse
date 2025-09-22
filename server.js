const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = 'https://api.github.com';

// Helper function to make GitHub API requests
async function githubRequest(endpoint, token = GITHUB_TOKEN) {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'product-pulse'
      }
    });
    return response.data;
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Product Pulse Dashboard',
    error: null 
  });
});

app.get('/api/repositories', async (req, res) => {
  try {
    if (!GITHUB_TOKEN) {
      return res.status(400).json({ error: 'GitHub token not configured' });
    }

    const repos = await githubRequest('/user/repos?type=private&sort=updated&per_page=10');
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

app.get('/api/repository/:owner/:repo/pulse', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    // Get repository basic info
    const repoInfo = await githubRequest(`/repos/${owner}/${repo}`);
    
    // Get recent commits (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const commits = await githubRequest(`/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=100`);
    
    // Get pull requests
    const pullRequests = await githubRequest(`/repos/${owner}/${repo}/pulls?state=all&per_page=20`);
    
    // Get issues
    const issues = await githubRequest(`/repos/${owner}/${repo}/issues?state=all&per_page=20`);
    
    // Get contributors
    const contributors = await githubRequest(`/repos/${owner}/${repo}/contributors?per_page=10`);

    const pulseData = {
      repository: repoInfo,
      commits: commits,
      pullRequests: pullRequests,
      issues: issues,
      contributors: contributors,
      stats: {
        totalCommits: commits.length,
        openPullRequests: pullRequests.filter(pr => pr.state === 'open').length,
        closedPullRequests: pullRequests.filter(pr => pr.state === 'closed').length,
        openIssues: issues.filter(issue => issue.state === 'open' && !issue.pull_request).length,
        closedIssues: issues.filter(issue => issue.state === 'closed' && !issue.pull_request).length,
        totalContributors: contributors.length
      }
    };

    res.json(pulseData);
  } catch (error) {
    console.error('Error fetching pulse data:', error);
    res.status(500).json({ error: 'Failed to fetch repository pulse data' });
  }
});

app.listen(PORT, () => {
  console.log(`Product Pulse Dashboard running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the dashboard`);
});