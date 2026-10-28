
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        REGISTRY   = '10.0.1.212:8084'
        IMAGE_NAME = 'task-flow'
        IMAGE_TAG  = "${BUILD_NUMBER}"
        GITOPS_REPO = 'git@github.com:kunals30/task-flow-gitops.git'
        GITOPS_DIR  = 'task-flow-gitops-deploy'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                    set -eu
                    node --version
                    npm --version
                    docker --version

                    test -f package.json
                    test -f package-lock.json
                    test -f Dockerfile
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Application Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        withEnv([
                            "SONAR_SCANNER_HOME=${scannerHome}"
                        ]) {
                            sh '''
                                set -eu

                                "$SONAR_SCANNER_HOME/bin/sonar-scanner" \
                                  -Dsonar.projectKey=Task-Flow \
                                  -Dsonar.projectName="Task Flow" \
                                  -Dsonar.sources=client/src,server/src \
                                  -Dsonar.tests=server/tests \
                                  -Dsonar.sourceEncoding=UTF-8 \
                                  -Dsonar.exclusions=**/node_modules/**,**/dist/**
                            '''
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    set -eu

                    docker build \
                      -t "$REGISTRY/$IMAGE_NAME:$IMAGE_TAG" \
                      -t "$REGISTRY/$IMAGE_NAME:latest" \
                      .
                '''
            }
        }

        stage('Push Image to Nexus') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-task-flow-credentials',
                        usernameVariable: 'NEXUS_USERNAME',
                        passwordVariable: 'NEXUS_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        printf '%s' "$NEXUS_PASSWORD" |
                          docker login "$REGISTRY" \
                            --username "$NEXUS_USERNAME" \
                            --password-stdin

                        docker push "$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
                        docker push "$REGISTRY/$IMAGE_NAME:latest"

                        docker logout "$REGISTRY"
                    '''
                }
            }
        }

        stage('Update GitOps Repository') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'task-flow-gitops-ssh',
                        keyFileVariable: 'GIT_SSH_KEY',
                        usernameVariable: 'GIT_SSH_USER'
                    )
                ]) {
                    sh '''
                        set -eu

                        export GIT_SSH_COMMAND="ssh -i $GIT_SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

                        rm -rf "$GITOPS_DIR"

                        git clone \
                          --branch main \
                          "$GITOPS_REPO" \
                          "$GITOPS_DIR"

                        cd "$GITOPS_DIR"

                        test -f deployment.yaml

                        sed -i -E \
                          "s#^([[:space:]]*image:[[:space:]]*)10\\.0\\.1\\.212:8084/task-flow:[^[:space:]]+#\\110.0.1.212:8084/task-flow:${IMAGE_TAG}#" \
                          deployment.yaml

                        grep -F \
                          "image: 10.0.1.212:8084/task-flow:${IMAGE_TAG}" \
                          deployment.yaml

                        git config user.name "Jenkins"
                        git config user.email "jenkins@localhost"

                        git add deployment.yaml

                        if git diff --cached --quiet; then
                            echo "GitOps manifest already contains image tag ${IMAGE_TAG}."
                        else
                            git commit -m "Deploy Task Flow image ${IMAGE_TAG}"
                            git push origin main
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: CI passed, image pushed to Nexus, and GitOps deployment manifest updated. Argo CD will reconcile the change.'
        }

        failure {
            echo 'FAILED: Check the Jenkins console output for the first failed stage.'
        }

        always {
            echo 'Task Flow CI/CD pipeline finished.'
        }
    }
}
