
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
                      -t "$REGISTRY/$IMAGE_NAME:$BUILD_NUMBER" \
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

                        docker push "$REGISTRY/$IMAGE_NAME:$BUILD_NUMBER"
                        docker push "$REGISTRY/$IMAGE_NAME:latest"

                        docker logout "$REGISTRY"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Tests, SonarQube, Quality Gate, Docker build and Nexus push completed.'
        }

        failure {
            echo 'FAILED: Check the Jenkins console output for the first failed stage.'
        }

        always {
            echo 'Task Flow CI pipeline finished.'
        }
    }
}
