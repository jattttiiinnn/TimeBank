# Jenkins Pipeline Setup Guide

## Overview

This Jenkins pipeline is designed for your Node.js/React TimeBank application with the following features:

- ✅ **Comprehensive error handling** with try-catch blocks
- ✅ **Parallel execution** for code quality checks
- ✅ **Flexible deployment** options (staging/production)
- ✅ **Security auditing** with vulnerability detection
- ✅ **Automated testing** and quality checks
- ✅ **Build artifact management**
- ✅ **Notification system** (Slack integration)
- ✅ **Resource cleanup** to prevent disk space issues

## Common Errors Resolved

### 1. **Node.js Version Issues**
- **Fixed**: Automatic Node.js 18 installation if not available
- **Error Prevention**: Version verification before proceeding

### 2. **Dependency Installation Failures**
- **Fixed**: Retry logic with 3 attempts
- **Error Prevention**: Cache clearing and offline-first installation

### 3. **Build Failures**
- **Fixed**: Proper error handling and build verification
- **Error Prevention**: Environment variable validation

### 4. **Deployment Issues**
- **Fixed**: Parallel deployment with individual error handling
- **Error Prevention**: Webhook validation and token verification

### 5. **Resource Management**
- **Fixed**: Automatic cleanup and disk space monitoring
- **Error Prevention**: Workspace cleaning after each run

### 6. **Code Quality Issues**
- **Fixed**: Automatic linting and formatting fixes
- **Error Prevention**: Parallel quality checks to save time

## Required Jenkins Setup

### 1. Jenkins Plugins

Install these required plugins in your Jenkins instance:

```bash
# Essential plugins
- Pipeline
- Git
- NodeJS Plugin
- HTML Publisher Plugin
- Build Timeout Plugin
- Workspace Cleanup Plugin

# Optional but recommended
- Blue Ocean (better UI)
- Slack Notification Plugin
- GitHub Integration Plugin
```

### 2. Jenkins Credentials

Create these credentials in Jenkins (`Manage Jenkins > Manage Credentials`):

#### Required Secrets:
- **`firebase-token`** (Secret Text)
  - Get token: `firebase login:ci`
  - Copy the generated token

- **`render-deploy-hook`** (Secret Text)  
  - Get from Render dashboard > Service > Settings > Deploy Hook

#### Optional Secrets:
- **`SLACK_WEBHOOK_URL`** (Secret Text)
  - For pipeline notifications

### 3. Jenkins Global Configuration

#### Node.js Installation:
1. Go to `Manage Jenkins > Global Tool Configuration`
2. Add Node.js installation:
   - Name: `NodeJS-18`
   - Version: `18.x` (latest)
   - Install automatically: ✅

#### Environment Variables:
1. Go to `Manage Jenkins > Configure System`
2. Add Global Properties > Environment variables:
   - `NODE_OPTIONS`: `--max-old-space-size=4096`
   - `CI`: `true`

## Pipeline Configuration

### 1. Create New Pipeline Job

1. New Item > Pipeline
2. Configure SCM (GitHub/GitLab)
3. Pipeline Definition: "Pipeline script from SCM"
4. Repository URL: Your repo URL
5. Script Path: `Jenkinsfile`

### 2. Branch Strategy

The pipeline automatically handles:
- **Feature branches**: Run tests and quality checks only
- **Main/Master branches**: Full pipeline including deployment
- **Pull Requests**: Run all checks except deployment

### 3. Build Parameters

The pipeline includes these parameters:
- `DEPLOY_ENVIRONMENT`: Choose staging or production
- `SKIP_TESTS`: Skip test execution if needed
- `FORCE_DEPLOY`: Force deployment even if tests fail

## Pipeline Stages Explanation

### Stage 1: Checkout
- Cleans workspace
- Checks out latest code
- Displays git information for debugging

### Stage 2: Setup Environment  
- Installs/verifies Node.js 18
- Sets up npm cache directory
- Validates environment

### Stage 3: Install Dependencies
- Clears npm cache
- Installs dependencies with retry logic
- Lists installed packages for verification

### Stage 4: Code Quality Checks (Parallel)
- **Linting**: ESLint with auto-fix attempt
- **Type Checking**: TypeScript validation
- **Format Checking**: Prettier validation with auto-format

### Stage 5: Security Audit
- Runs npm audit for vulnerabilities
- Attempts automatic fixes
- Generates audit report

### Stage 6: Tests
- Runs your test suite (`npm run ci:test`)
- Can be skipped with parameter
- Publishes test/coverage reports

### Stage 7: Build
- Builds production application
- Verifies build output
- Creates build metadata
- Archives artifacts

### Stage 8: Deploy (Parallel)
- **Firebase**: Deploys frontend
- **Render**: Triggers backend deployment
- Only runs on main/master branches

### Stage 9: Post-Deploy Validation
- Waits for deployment propagation
- Can include health checks
- Validates deployment success

## Error Handling Features

### 1. **Automatic Recovery**
```groovy
// Example: Auto-fix linting issues
catch (Exception e) {
    echo "Linting failed, attempting to fix..."
    sh 'npm run lint:fix || true'
    error "Linting failed: ${e.message}"
}
```

### 2. **Resource Cleanup**
```groovy
// Automatic cleanup to prevent disk space issues
if [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 85 ]; then
    echo "Disk usage high, cleaning node_modules..."
    rm -rf node_modules
fi
```

### 3. **Retry Logic**
```groovy
// Dependency installation with retries
for i in 1 2 3; do
    if npm ci --prefer-offline --no-audit --no-fund; then
        break
    else
        sleep 5
    fi
done
```

## Monitoring & Debugging

### 1. **Pipeline Logs**
- Each stage has detailed logging
- Git information for traceability
- Build metadata in artifacts

### 2. **Build Artifacts**
- Build output (`dist/` directory)
- Security audit reports
- Test coverage reports
- Build metadata JSON

### 3. **Notifications**
- Success/failure notifications to Slack
- Build status in commit/PR status

## Customization Options

### 1. **Add New Deployment Targets**
```groovy
stage('Deploy to Vercel') {
    steps {
        sh 'vercel --prod --token $VERCEL_TOKEN'
    }
}
```

### 2. **Add Custom Test Stages**
```groovy
stage('Integration Tests') {
    steps {
        sh 'npm run test:integration'
    }
}
```

### 3. **Custom Quality Gates**
```groovy
stage('Performance Tests') {
    steps {
        sh 'npm run lighthouse'
    }
}
```

## Troubleshooting Guide

### Common Issues & Solutions:

1. **"Node.js not found"**
   - Solution: Install NodeJS plugin and configure global tools

2. **"Firebase token invalid"**
   - Solution: Regenerate token with `firebase login:ci`

3. **"Build timeout"**
   - Solution: Increase timeout in pipeline options or optimize build

4. **"Permission denied"**
   - Solution: Check Jenkins service account permissions

5. **"Workspace disk full"**
   - Solution: The pipeline auto-cleans, but check Jenkins disk usage

6. **"Parallel stages failing"**
   - Solution: Check individual stage logs, some stages can fail independently

## Best Practices Implemented

1. **Fail Fast**: Critical issues stop the pipeline early
2. **Resource Management**: Automatic cleanup prevents resource exhaustion  
3. **Parallel Execution**: Quality checks run in parallel for speed
4. **Error Recovery**: Automatic fixes for common issues
5. **Comprehensive Logging**: Detailed logs for easy debugging
6. **Security**: Credentials properly managed, no secrets in logs
7. **Flexibility**: Parameters allow pipeline customization per run

## Next Steps

1. ✅ Set up Jenkins credentials (`firebase-token`, `render-deploy-hook`)
2. ✅ Install required Jenkins plugins
3. ✅ Configure NodeJS global tool
4. ✅ Create pipeline job pointing to your repository
5. ✅ Run first build and verify all stages pass
6. ✅ Set up branch protection rules if using GitHub/GitLab
7. ✅ Configure notifications (optional)

Your Jenkins pipeline is now ready with comprehensive error handling! 🚀

## Support

If you encounter any issues:
1. Check Jenkins console logs for detailed error messages
2. Verify all credentials are properly configured
3. Ensure required plugins are installed
4. Review this documentation for troubleshooting steps
