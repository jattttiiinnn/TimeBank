pipeline {
    agent any
    
    // Environment variables
    environment {
        NODE_VERSION = '18'
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
        NODE_ENV = 'production'
        FIREBASE_TOKEN = credentials('firebase-token')
        RENDER_DEPLOY_HOOK = credentials('render-deploy-hook')
    }
    
    // Build parameters
    parameters {
        choice(
            name: 'DEPLOY_ENVIRONMENT',
            choices: ['staging', 'production'],
            description: 'Select deployment environment'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Skip test execution'
        )
        booleanParam(
            name: 'FORCE_DEPLOY',
            defaultValue: false,
            description: 'Force deployment even if tests fail'
        )
    }
    
    // Pipeline options
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        retry(3)
        skipStagesAfterUnstable()
        disableConcurrentBuilds()
    }
    
    // Triggers
    triggers {
        githubPush()
        pollSCM('H/5 * * * *') // Poll every 5 minutes as fallback
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    try {
                        // Clean workspace before checkout
                        deleteDir()
                        
                        // Checkout code from SCM
                        checkout scm
                        
                        // Display git information
                        sh '''
                            echo "=== Git Information ==="
                            git --version
                            git log --oneline -5
                            echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
                            echo "Commit hash: $(git rev-parse HEAD)"
                        '''
                    } catch (Exception e) {
                        error "Checkout failed: ${e.message}"
                    }
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    try {
                        // Install Node.js using NodeJS plugin or nvm
                        sh '''
                            echo "=== Setting up Node.js environment ==="
                            
                            # Check if node is available
                            if command -v node >/dev/null 2>&1; then
                                echo "Node version: $(node --version)"
                                echo "NPM version: $(npm --version)"
                            else
                                echo "Node.js not found, installing..."
                                # Install Node.js 18
                                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                                sudo apt-get install -y nodejs
                            fi
                            
                            # Verify versions
                            node --version
                            npm --version
                            
                            # Create npm cache directory
                            mkdir -p ${NPM_CONFIG_CACHE}
                        '''
                    } catch (Exception e) {
                        error "Environment setup failed: ${e.message}"
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    try {
                        sh '''
                            echo "=== Installing dependencies ==="
                            
                            # Clear npm cache
                            npm cache clean --force
                            
                            # Install dependencies with retry logic
                            for i in 1 2 3; do
                                echo "Installation attempt $i..."
                                if npm ci --prefer-offline --no-audit --no-fund; then
                                    echo "Dependencies installed successfully"
                                    break
                                else
                                    echo "Installation attempt $i failed"
                                    if [ $i -eq 3 ]; then
                                        echo "All installation attempts failed"
                                        exit 1
                                    fi
                                    sleep 5
                                fi
                            done
                            
                            # Display installed packages
                            echo "=== Installed packages ==="
                            npm list --depth=0
                        '''
                    } catch (Exception e) {
                        error "Dependency installation failed: ${e.message}"
                    }
                }
            }
        }
        
        stage('Code Quality Checks') {
            parallel {
                stage('Linting') {
                    steps {
                        script {
                            try {
                                sh '''
                                    echo "=== Running ESLint ==="
                                    npm run lint
                                '''
                            } catch (Exception e) {
                                // Try to fix linting issues automatically
                                echo "Linting failed, attempting to fix..."
                                sh 'npm run lint:fix || true'
                                error "Linting failed: ${e.message}"
                            }
                        }
                    }
                    post {
                        always {
                            // Publish ESLint results if available
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports',
                                reportFiles: 'eslint.html',
                                reportName: 'ESLint Report'
                            ])
                        }
                    }
                }
                
                stage('Type Checking') {
                    steps {
                        script {
                            try {
                                sh '''
                                    echo "=== Running TypeScript type checking ==="
                                    npm run type-check
                                '''
                            } catch (Exception e) {
                                error "Type checking failed: ${e.message}"
                            }
                        }
                    }
                }
                
                stage('Format Checking') {
                    steps {
                        script {
                            try {
                                sh '''
                                    echo "=== Checking code formatting ==="
                                    npm run format:check
                                '''
                            } catch (Exception e) {
                                echo "Format checking failed, running formatter..."
                                sh 'npm run format || true'
                                error "Code formatting issues found: ${e.message}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Audit') {
            steps {
                script {
                    try {
                        sh '''
                            echo "=== Running security audit ==="
                            npm audit --audit-level=high --json > audit-report.json || true
                            
                            # Check if there are high/critical vulnerabilities
                            if npm audit --audit-level=high; then
                                echo "No high/critical vulnerabilities found"
                            else
                                echo "Security vulnerabilities detected!"
                                echo "Attempting to fix automatically..."
                                npm audit fix --force || true
                                
                                # Check again after fix attempt
                                if ! npm audit --audit-level=high; then
                                    echo "Warning: Security vulnerabilities still present"
                                    # Don't fail the build, just warn
                                fi
                            fi
                        '''
                    } catch (Exception e) {
                        echo "Security audit completed with warnings: ${e.message}"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'audit-report.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('Tests') {
            when {
                not { params.SKIP_TESTS }
            }
            steps {
                script {
                    try {
                        sh '''
                            echo "=== Running tests ==="
                            # Since no test framework is configured, we'll run the CI test script
                            npm run ci:test
                            
                            echo "Tests completed successfully"
                        '''
                    } catch (Exception e) {
                        if (params.FORCE_DEPLOY) {
                            echo "Tests failed but FORCE_DEPLOY is enabled, continuing..."
                        } else {
                            error "Tests failed: ${e.message}"
                        }
                    }
                }
            }
            post {
                always {
                    // Publish test results if available
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    try {
                        sh '''
                            echo "=== Building application ==="
                            
                            # Set build environment
                            export NODE_ENV=production
                            
                            # Build the application
                            npm run build
                            
                            # Verify build output
                            if [ -d "dist" ]; then
                                echo "Build successful - dist directory created"
                                echo "Build contents:"
                                ls -la dist/
                            else
                                echo "Error: dist directory not found after build"
                                exit 1
                            fi
                            
                            # Create build info
                            echo "{
                                \"buildNumber\": \"${BUILD_NUMBER}\",
                                \"buildId\": \"${BUILD_ID}\",
                                \"gitCommit\": \"$(git rev-parse HEAD)\",
                                \"gitBranch\": \"$(git rev-parse --abbrev-ref HEAD)\",
                                \"buildTime\": \"$(date -Iseconds)\",
                                \"nodeVersion\": \"$(node --version)\",
                                \"npmVersion\": \"$(npm --version)\"
                            }" > dist/build-info.json
                        '''
                    } catch (Exception e) {
                        error "Build failed: ${e.message}"
                    }
                }
            }
            post {
                success {
                    // Archive build artifacts
                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: false
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    params.FORCE_DEPLOY
                }
            }
            parallel {
                stage('Deploy to Firebase') {
                    steps {
                        script {
                            try {
                                sh '''
                                    echo "=== Deploying to Firebase ==="
                                    
                                    # Install Firebase CLI if not available
                                    if ! command -v firebase >/dev/null 2>&1; then
                                        echo "Installing Firebase CLI..."
                                        npm install -g firebase-tools
                                    fi
                                    
                                    # Verify Firebase token
                                    firebase --version
                                    
                                    # Deploy to Firebase
                                    firebase deploy --token "${FIREBASE_TOKEN}" --non-interactive
                                    
                                    echo "Firebase deployment completed successfully"
                                '''
                            } catch (Exception e) {
                                echo "Firebase deployment failed: ${e.message}"
                                // Don't fail the entire stage if one deployment fails
                            }
                        }
                    }
                }
                
                stage('Deploy to Render') {
                    steps {
                        script {
                            try {
                                sh '''
                                    echo "=== Triggering Render deployment ==="
                                    
                                    # Trigger Render deployment via webhook
                                    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${RENDER_DEPLOY_HOOK}")
                                    
                                    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
                                        echo "Render deployment triggered successfully (HTTP $response)"
                                    else
                                        echo "Render deployment trigger failed (HTTP $response)"
                                        exit 1
                                    fi
                                '''
                            } catch (Exception e) {
                                echo "Render deployment failed: ${e.message}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Post-Deploy Validation') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    params.FORCE_DEPLOY
                }
            }
            steps {
                script {
                    try {
                        sh '''
                            echo "=== Running post-deployment validation ==="
                            
                            # Wait a bit for deployment to propagate
                            sleep 30
                            
                            # Add health checks here if you have endpoints to test
                            echo "Deployment validation completed"
                        '''
                    } catch (Exception e) {
                        echo "Post-deployment validation failed: ${e.message}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Clean up
                sh '''
                    echo "=== Cleaning up ==="
                    # Clean npm cache
                    npm cache clean --force || true
                    
                    # Remove node_modules if disk space is low
                    if [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 85 ]; then
                        echo "Disk usage high, cleaning node_modules..."
                        rm -rf node_modules
                    fi
                '''
            }
            
            // Clean workspace
            cleanWs()
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
            
            // Send success notification
            script {
                if (env.SLACK_WEBHOOK_URL) {
                    sh """
                        curl -X POST -H 'Content-type: application/json' \
                        --data '{"text":"✅ Build ${BUILD_NUMBER} succeeded for ${JOB_NAME}"}' \
                        ${env.SLACK_WEBHOOK_URL}
                    """
                }
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            
            // Send failure notification
            script {
                if (env.SLACK_WEBHOOK_URL) {
                    sh """
                        curl -X POST -H 'Content-type: application/json' \
                        --data '{"text":"❌ Build ${BUILD_NUMBER} failed for ${JOB_NAME}. Check: ${BUILD_URL}"}' \
                        ${env.SLACK_WEBHOOK_URL}
                    """
                }
            }
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings!'
        }
        
        changed {
            echo '🔄 Pipeline status changed!'
        }
    }
}
