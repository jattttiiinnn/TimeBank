# CI/CD Pipeline Setup Guide

## Overview

This project now includes a comprehensive CI/CD pipeline with the following features:

- ✅ **Automated builds and testing** on every push and pull request
- ✅ **Automatic deployments** to Firebase and Render on main branch
- ✅ **Dependency updates** via Dependabot and custom workflows  
- ✅ **Security auditing** with automated vulnerability detection
- ✅ **Code quality checks** with ESLint, TypeScript, and Prettier
- ✅ **Auto-merge** for dependency updates that pass all tests

## Pipeline Structure

### Main Workflows

1. **`ci-cd.yml`** - Main CI/CD pipeline
2. **`dependency-updates.yml`** - Automated dependency updates
3. **`code-quality.yml`** - Code quality and formatting checks
4. **`auto-merge.yml`** - Auto-merge approved dependency updates

## Setup Instructions

### 1. GitHub Repository Setup

If you haven't already, initialize a Git repository and push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit with CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. GitHub Secrets Configuration

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

#### Required Secrets:
- **`FIREBASE_TOKEN`** - Firebase CI token
- **`RENDER_DEPLOY_HOOK`** - Render.com deploy webhook URL

#### Optional Secrets (for enhanced features):
- **`SLACK_WEBHOOK_URL`** - For Slack notifications
- **`DISCORD_WEBHOOK_URL`** - For Discord notifications

### 3. Firebase CI Token

Get your Firebase CI token:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login and get CI token
firebase login:ci
```

Copy the generated token and add it as `FIREBASE_TOKEN` secret in GitHub.

### 4. Render Deploy Hook

1. Go to your Render dashboard
2. Select your service
3. Go to Settings > Build & Deploy
4. Copy the "Deploy Hook" URL
5. Add it as `RENDER_DEPLOY_HOOK` secret in GitHub

### 5. Update Dependabot Configuration

Edit `.github/dependabot.yml` and replace `@me` with your actual GitHub username:

```yaml
reviewers:
  - "your-github-username"
assignees:
  - "your-github-username"
```

## How It Works

### Automatic Deployments

**Trigger:** Push to `main` branch
**Process:**
1. Run tests and build checks
2. If all pass, deploy to Firebase Hosting
3. Deploy backend to Render.com
4. Notify about deployment status

### Dependency Updates

**Schedule:** Every Monday at 9 AM UTC
**Process:**
1. Dependabot creates PRs for outdated packages
2. Custom workflow creates additional PRs for bulk updates
3. CI runs tests on dependency update PRs
4. If tests pass, PRs are auto-approved and merged
5. Security audit runs and creates issues for vulnerabilities

### Code Quality

**Trigger:** Every push and pull request
**Checks:**
- ESLint for code quality
- TypeScript type checking
- Prettier for code formatting
- Build verification on multiple Node.js versions

## Local Development Scripts

### New scripts added to `package.json`:

```bash
# Code quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run type-check    # TypeScript type checking

# CI/CD helpers
npm run ci:build      # Full CI build process
npm run ci:test       # Run all CI tests
npm run deploy:firebase  # Build and deploy to Firebase
npm run update-deps   # Update all dependencies
```

## Branch Protection Rules

Recommended branch protection rules for `main`:

1. Go to `Settings > Branches` in your GitHub repo
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Required status checks:
     - `Run Tests`
     - `Lint and Format`
     - `Build Test`

## Monitoring and Maintenance

### Viewing Pipeline Status

- **Actions Tab**: View all workflow runs
- **Pull Requests**: See check status on PRs
- **Issues**: Auto-created security vulnerability issues

### Weekly Tasks

The pipeline handles most maintenance automatically:
- ✅ Dependency updates
- ✅ Security audits  
- ✅ Code quality checks
- ✅ Automated deployments

### Manual Interventions

You may need to manually handle:
- Major version updates of core dependencies
- Security vulnerabilities that can't be auto-fixed
- Failed deployments due to configuration issues

## Customization

### Adding New Environments

To add staging environment:

1. Update `ci-cd.yml` to add staging deployment job
2. Add staging-specific secrets
3. Modify branch triggers as needed

### Custom Notifications

To add Slack/Discord notifications:

1. Add webhook URLs to secrets
2. Uncomment notification steps in workflows
3. Customize notification messages

### Different Deployment Providers

To use different providers (Vercel, Netlify, etc.):

1. Replace Firebase/Render deployment steps
2. Update required secrets
3. Modify build commands as needed

## Troubleshooting

### Common Issues

1. **Firebase deployment fails**
   - Check FIREBASE_TOKEN is valid
   - Ensure Firebase project is configured correctly

2. **Render deployment doesn't trigger**
   - Verify RENDER_DEPLOY_HOOK URL is correct
   - Check Render service is connected to GitHub

3. **Tests fail on dependency updates**
   - Review the failing tests
   - May need to update test configurations

4. **Auto-merge not working**
   - Check branch protection rules
   - Ensure GitHub Actions have proper permissions

### Getting Help

- Check GitHub Actions logs for detailed error messages
- Review this documentation
- Check official documentation for Firebase, Render, and GitHub Actions

## Security Notes

- Never commit secrets to the repository
- Use GitHub secrets for all sensitive configuration
- Regularly review and rotate access tokens
- Monitor dependency updates for security vulnerabilities

---

## Next Steps

1. ✅ Set up GitHub secrets
2. ✅ Push code to trigger first pipeline run
3. ✅ Configure branch protection rules
4. ✅ Update Dependabot configuration with your username
5. ✅ Test the pipeline by creating a test PR

Your CI/CD pipeline is now ready! 🚀
