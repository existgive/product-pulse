# Product Pulse

A web dashboard to monitor the activity and pulse of your private GitHub repositories. This application provides insights into repository statistics including commits, pull requests, issues, and contributor activity.

## Features

- 🔒 **Private Repository Support** - Monitor your private repositories with GitHub API integration
- 📊 **Real-time Statistics** - View commit activity, pull requests, issues, and contributor metrics
- 🎨 **Beautiful Dashboard** - Clean, responsive interface with real-time data visualization
- 🚀 **Easy Setup** - Simple configuration with GitHub Personal Access Token
- 📱 **Mobile Friendly** - Responsive design that works on all devices

## Screenshots

The dashboard displays:
- List of your private repositories
- Repository pulse data including commits (last 30 days), open PRs, open issues, and contributors
- Recent activity timeline with commits, pull requests, and issues
- Top contributors with avatars and contribution counts

## Setup

### Prerequisites

- Node.js (version 14 or higher)
- GitHub Personal Access Token with repository access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/existgive/product-pulse.git
cd product-pulse
```

2. Install dependencies:
```bash
npm install
```

3. Configure GitHub access:
```bash
cp .env.example .env
```

4. Edit `.env` file and add your GitHub Personal Access Token:
```
GITHUB_TOKEN=your_github_token_here
PORT=3000
```

### Creating a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Product Pulse Dashboard"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
5. Click "Generate token"
6. Copy the token and paste it in your `.env` file

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at `http://localhost:3000`

## How to Use

1. **Access the Dashboard**: Open your browser and navigate to `http://localhost:3000`
2. **View Repositories**: The dashboard will automatically load your private repositories
3. **Select Repository**: Click on any repository to view its pulse data
4. **Monitor Activity**: View recent commits, pull requests, issues, and contributor statistics

## API Endpoints

- `GET /` - Main dashboard interface
- `GET /api/repositories` - List of private repositories
- `GET /api/repository/:owner/:repo/pulse` - Detailed pulse data for a specific repository

## Architecture

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript with EJS templating
- **Styling**: Custom CSS with responsive design
- **API Integration**: GitHub REST API v3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Security

- Never commit your `.env` file or GitHub tokens to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your GitHub Personal Access Tokens
- Ensure your GitHub token has minimal required permissions

## Troubleshooting

### Common Issues

1. **"GitHub token not configured"**: Make sure your `.env` file contains a valid `GITHUB_TOKEN`
2. **"No private repositories found"**: Ensure your token has `repo` scope and access to private repositories
3. **API rate limits**: GitHub API has rate limits; the app handles this gracefully but may need retries for heavy usage

### Support

If you encounter issues, please check:
1. Your GitHub token is valid and has the correct permissions
2. You have access to the private repositories you're trying to monitor
3. Your internet connection is stable for GitHub API calls