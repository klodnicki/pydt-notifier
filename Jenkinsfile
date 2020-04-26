def remote = [:]
remote.name = 'gizmo'
remote.host = '127.0.0.1'
remote.allowAnyHosts = true

pipeline {
    agent any
    environment {
        CREDENTIALS = credentials('gizmo-ci-com-klodnicki-pydt-notifier')
    }
    stages {
        stage('Setup') { steps { script {
            remote.user = env.CREDENTIALS_USR
            remote.identityFile = env.CREDENTIALS
            sh 'git clean -fd'
        } } }

        stage('Install dependencies') {
            steps {
                sh 'npm i';
            }
        }
        stage('Build') {
            environment {
                NODE_ENV = 'PRODUCTION'
            }
            steps { script {
                sh 'npm run pack';
            } }
        }

        stage('Prepare Deployment') {
            steps { script {
                sshCommand remote: remote, command: 'rm -rf api.new api.old'
                sshCommand remote: remote, command: 'mkdir api.new'
                sshPut remote: remote, from: 'com-klodnicki-pydt-notifier.tgz', into: 'api.new'
                sshPut remote: remote, from: 'com-klodnicki-pydt-notifier.service', into: 'api.new'
                sshCommand remote: remote, command: '''
                    cd api.new
                    npm i com-klodnicki-pydt-notifier.tgz
                    rm com-klodnicki-pydt-notifier.tgz
                    mkdir -p ~/.config/systemd/user/
                    mv com-klodnicki-pydt-notifier.service ~/.config/systemd/user/com-klodnicki-pydt-notifier.service
                '''
            } }
        }

        stage('Deploy') {
            steps { script {
                sshCommand remote: remote, command: '''
                    mkdir -p api
                    mv api api.old
                    mv api.new api
                    systemctl --user daemon-reload
                    systemctl --user restart com-klodnicki-photos-api.service
                    rm -rf api.old
                '''
            } }
        }

        stage('Clean Up') {
            steps { script {
                sshCommand remote: remote, command: '''
                    rm -rf api.old
                '''
            } }
        }
    }
    post {
        unsuccessful {
            emailext attachLog: false, to: '8566935139@msg.fi.google.com', subject: "", body: "Jenkins: ${env.JOB_NAME}:${env.BUILD_DISPLAY_NAME} unsuccessful!"
        }
    }
}
