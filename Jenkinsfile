    pipeline {

        agent any
        tools {
            nodejs 'NodeJS'
        }

        stages {
            stage('Checkout') {
                steps {
                    // Thực hiện git pull từ nhánh feature/init-server
                    git branch: 'main', url: 'https://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@github.com/AIML-In-Ecommerce/techzone-server'
                }
            }
            

            stage('Install Dependencies') {
                // options {
                //     timeout(time: 30, unit: 'MINUTES')
                // }
                steps {
                    // Bước này để cài đặt các dependencies của Node.js
                    script {
                        docker ps -a
                        // sh 'npm install'
                        // dir('Auth') {
                        //     sh 'npm install'
                        // }
                        // dir('Cart') {
                        //     sh 'npm install'
                        // }
                        // dir('Category') {
                        //     sh 'npm install'
                        // }
                        // dir('Order') {
                        //     sh 'npm install'
                        // }
                        // dir('Product') {
                        //     sh 'npm install'
                        // }
                        // dir('Promotion') {
                        //     sh 'npm install'
                        // }
                        // dir('Review') {
                        //     sh 'npm install'
                        // }
                        // dir('Shop') {
                        //     sh 'npm install'
                        // }
                        // dir('User') {
                        //     sh 'npm install'
                        // }

                    }
                }
            }
            


            stage('Build') {
                // options {
                //     timeout(time: 30, unit: 'MINUTES')
                // }
                steps {
                    // Kiểm tra và down container
                    script {
                        sh 'docker-compose ps'
                        sh 'docker-compose down --remove-orphans'
                    }
                    sh 'docker-compose build --no-cache'
                    // Build và chạy container mới
                    sh 'docker-compose up -d'

                    // Kiểm tra lại trạng thái của container
                    sh 'docker-compose ps'
                    sh 'docker-compose logs'
                }
            }

            

            stage('Deploy') {
                steps {
                    // Bước này để triển khai ứng dụng (nếu cần)
                    script {
                        // Thay thế lệnh dưới đây bằng lệnh triển khai thực tế của bạn
                        echo 'Deployment step...'
                        sh 'docker-compose ps'
                    }
                }
            }
        }

        
    }
