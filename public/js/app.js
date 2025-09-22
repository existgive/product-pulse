class ProductPulse {
    constructor() {
        this.selectedRepository = null;
        this.init();
    }

    init() {
        this.loadRepositories();
    }

    async loadRepositories() {
        const repositoriesList = document.getElementById('repositories-list');
        
        try {
            const response = await fetch('/api/repositories');
            
            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }
            
            const repositories = await response.json();
            
            if (repositories.length === 0) {
                repositoriesList.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-info-circle"></i>
                        No private repositories found. Make sure your GitHub token has access to private repositories.
                    </div>
                `;
                return;
            }
            
            repositoriesList.innerHTML = repositories.map(repo => `
                <div class="repository-item" data-owner="${repo.owner.login}" data-repo="${repo.name}">
                    <div class="repository-name">
                        <i class="fas fa-lock"></i> ${repo.full_name}
                    </div>
                    <div class="repository-description">
                        ${repo.description || 'No description provided'}
                    </div>
                    <div class="repository-meta">
                        <span><i class="fas fa-code-branch"></i> ${repo.default_branch}</span>
                        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fas fa-code-fork"></i> ${repo.forks_count}</span>
                        <span><i class="fas fa-clock"></i> Updated ${this.formatDate(repo.updated_at)}</span>
                    </div>
                </div>
            `).join('');
            
            // Add click handlers to repository items
            document.querySelectorAll('.repository-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.selectRepository(item);
                });
            });
            
        } catch (error) {
            console.error('Error loading repositories:', error);
            repositoriesList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error loading repositories. Please check your GitHub token configuration.
                </div>
            `;
        }
    }

    selectRepository(repositoryElement) {
        // Remove previous selection
        document.querySelectorAll('.repository-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        repositoryElement.classList.add('selected');
        
        const owner = repositoryElement.dataset.owner;
        const repo = repositoryElement.dataset.repo;
        
        this.selectedRepository = { owner, repo };
        this.loadRepositoryPulse(owner, repo);
    }

    async loadRepositoryPulse(owner, repo) {
        const pulseSection = document.getElementById('pulse-section');
        const pulseData = document.getElementById('pulse-data');
        
        pulseSection.style.display = 'block';
        pulseData.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading pulse data...</div>';
        
        try {
            const response = await fetch(`/api/repository/${owner}/${repo}/pulse`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch pulse data');
            }
            
            const pulse = await response.json();
            this.renderPulseData(pulse);
            
        } catch (error) {
            console.error('Error loading pulse data:', error);
            pulseData.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error loading pulse data for ${owner}/${repo}
                </div>
            `;
        }
    }

    renderPulseData(pulse) {
        const pulseData = document.getElementById('pulse-data');
        
        pulseData.innerHTML = `
            <div class="pulse-stats">
                <div class="stat-card commits">
                    <div class="stat-value">${pulse.stats.totalCommits}</div>
                    <div class="stat-label">Commits (30 days)</div>
                </div>
                <div class="stat-card pulls">
                    <div class="stat-value">${pulse.stats.openPullRequests}</div>
                    <div class="stat-label">Open Pull Requests</div>
                </div>
                <div class="stat-card issues">
                    <div class="stat-value">${pulse.stats.openIssues}</div>
                    <div class="stat-label">Open Issues</div>
                </div>
                <div class="stat-card contributors">
                    <div class="stat-value">${pulse.stats.totalContributors}</div>
                    <div class="stat-label">Contributors</div>
                </div>
            </div>
            
            <div class="pulse-details">
                <div class="pulse-section-item">
                    <h3><i class="fas fa-code-commit"></i> Recent Commits</h3>
                    ${pulse.commits.slice(0, 5).map(commit => `
                        <div class="commit-item">
                            <div class="commit-message">${this.truncateText(commit.commit.message, 60)}</div>
                            <div class="commit-author">
                                by ${commit.commit.author.name} • ${this.formatDate(commit.commit.author.date)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="pulse-section-item">
                    <h3><i class="fas fa-code-pull-request"></i> Pull Requests</h3>
                    ${pulse.pullRequests.slice(0, 5).map(pr => `
                        <div class="pr-item">
                            <div class="pr-title">${this.truncateText(pr.title, 60)}</div>
                            <div class="pr-author">
                                by ${pr.user.login} • ${pr.state} • ${this.formatDate(pr.created_at)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="pulse-section-item">
                    <h3><i class="fas fa-exclamation-circle"></i> Issues</h3>
                    ${pulse.issues.filter(issue => !issue.pull_request).slice(0, 5).map(issue => `
                        <div class="issue-item">
                            <div class="issue-title">${this.truncateText(issue.title, 60)}</div>
                            <div class="issue-author">
                                by ${issue.user.login} • ${issue.state} • ${this.formatDate(issue.created_at)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="pulse-section-item">
                    <h3><i class="fas fa-users"></i> Top Contributors</h3>
                    ${pulse.contributors.slice(0, 5).map(contributor => `
                        <div class="contributor-item">
                            <img src="${contributor.avatar_url}" alt="${contributor.login}" class="contributor-avatar">
                            <div class="contributor-info">
                                <div class="contributor-name">${contributor.login}</div>
                                <div class="contributor-contributions">${contributor.contributions} contributions</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ProductPulse();
});