pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }

    stages {
        stage('Checkout') {
            steps {
                // Thực hiện git pull từ nhánh feature/init-server
                git branch: 'main', url: 'https://github.com/AIML-In-Ecommerce/techzone-server'
        }
        stage('Install Docker Compose') {
            steps {
                sh 'curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose'
                sh 'chmod +x /usr/local/bin/docker-compose'
            }
        }

            }
        stage('Install Dependencies') {
            steps {
                // Bước này để cài đặt các dependencies của Node.js
                script {
                    
                    dir('Cart') {
                        sh 'npm install'
                    }
                    dir('Category') {
                        sh 'npm install'
                    }
                    dir('Order') {
                        sh 'npm install'
                    }
                    dir('Product') {
                        sh 'npm install'
                    }
                    dir('Promotion') {
                        sh 'npm install'
                    }
                    dir('Review') {
                        sh 'npm install'
                    }
                    dir('Shop') {
                        sh 'npm install'
                    }
                    dir('User') {
                        sh 'npm install'
                    }

                }
            }
        }
        


        stage('Build') {
            steps {
                // Bước này để thực hiện các bước build hoặc compile (nếu cần)
                script {
                    sh 'docker ps'
                     sh 'docker-compose up -d'
                        sh 'docker-compose ps'
                        sh 'docker-compose logs'
                }
            }
        }

        

        stage('Deploy') {
            steps {
                // Bước này để triển khai ứng dụng (nếu cần)
                script {
                    // Thay thế lệnh dưới đây bằng lệnh triển khai thực tế của bạn
                    echo 'Deployment step...'
                    docker ps -a
                }
            }
        }
    }

    
}
