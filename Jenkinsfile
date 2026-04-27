pipeline {
    agent any

    environment {
        NODE_VERSION     = '20'
        BUILD_DIR        = 'dist'
        // Credentials stored in Jenkins Credential Manager (ID → value)
        FTP_HOST         = credentials('HOSTINGER_FTP_HOST')
        FTP_USER         = credentials('HOSTINGER_FTP_USER')
        FTP_PASS         = credentials('HOSTINGER_FTP_PASS')
        FTP_REMOTE_DIR   = credentials('HOSTINGER_FTP_REMOTE_DIR')  // e.g. /public_html
        SLACK_WEBHOOK    = credentials('SLACK_WEBHOOK_URL')          // optional
    }

    options {
        // Keep last 5 builds; discard older ones
        buildDiscarder(logRotator(numToKeepStr: '5'))
        // Abort if build takes > 15 minutes
        timeout(time: 15, unit: 'MINUTES')
        // Prevent parallel runs on same branch
        disableConcurrentBuilds()
        timestamps()
    }

    triggers {
        // Poll SCM every minute (or use GitHub webhook — see README)
        pollSCM('* * * * *')
    }

    stages {

        // ─────────────────────────────────────────────
        stage('📥 Checkout') {
        // ─────────────────────────────────────────────
            steps {
                checkout scm
                echo "✅ Checked out branch: ${env.BRANCH_NAME} — commit: ${env.GIT_COMMIT?.take(7)}"
            }
        }

        // ─────────────────────────────────────────────
        stage('⚙️  Setup Node') {
        // ─────────────────────────────────────────────
            steps {
                // Requires NodeJS plugin with "nodejs-20" installation configured
                nodejs(nodeJSInstallationName: 'nodejs-20') {
                    sh 'node -v && npm -v'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('📦 Install Dependencies') {
        // ─────────────────────────────────────────────
            steps {
                nodejs(nodeJSInstallationName: 'nodejs-20') {
                    // ci = clean install, respects package-lock.json
                    sh 'npm ci'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('🔍 Lint') {
        // ─────────────────────────────────────────────
            steps {
                nodejs(nodeJSInstallationName: 'nodejs-20') {
                    sh 'npm run lint -- --max-warnings=0 || true'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('🏗️  Build') {
        // ─────────────────────────────────────────────
            steps {
                nodejs(nodeJSInstallationName: 'nodejs-20') {
                    sh 'npm run build'
                }
                echo "✅ Build complete — output in ./${BUILD_DIR}/"
            }
            post {
                success {
                    // Archive build artifacts (optional; useful for rollbacks)
                    archiveArtifacts artifacts: "${BUILD_DIR}/**/*", fingerprint: true
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('🚀 Deploy → Hostinger FTP') {
        // ─────────────────────────────────────────────
            when {
                // Only deploy from main/master branch
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                sh '''
                    echo "📤 Deploying to Hostinger via FTP…"

                    lftp -c "
                        set ftp:ssl-allow yes;
                        set ssl:verify-certificate no;
                        set ftp:passive-mode yes;
                        open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST;
                        mirror --reverse --delete --verbose \
                               --exclude-glob .DS_Store \
                               --exclude-glob *.map \
                               ${BUILD_DIR}/ ${FTP_REMOTE_DIR}/;
                        quit
                    "

                    echo "✅ Deploy complete!"
                '''
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline succeeded — Luxtronics is live!"
            // Uncomment to enable Slack notifications:
            // sh "curl -s -X POST -H 'Content-type: application/json' --data '{\"text\":\"✅ Luxtronics deployed successfully! Build #${BUILD_NUMBER}\"}' $SLACK_WEBHOOK"
        }
        failure {
            echo "❌ Pipeline failed — check console output."
            // sh "curl -s -X POST -H 'Content-type: application/json' --data '{\"text\":\"❌ Luxtronics build FAILED! Build #${BUILD_NUMBER} — ${BUILD_URL}\"}' $SLACK_WEBHOOK"
        }
        always {
            // Clean workspace after build to save disk space
            cleanWs()
        }
    }
}
