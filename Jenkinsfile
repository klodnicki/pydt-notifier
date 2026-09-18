def remote = [:]
remote.name = 'gizmo'
remote.host = '127.0.0.1'
remote.allowAnyHosts = true

def nvmVersion

def shNode = { String command ->
    sh """
        export NVM_DIR="\${WORKSPACE}/.nvm"
        if [ ! -s "\$NVM_DIR/nvm.sh" ]; then
            echo "NVM is not installed in the workspace" >&2
            exit 1
        fi
        . "\$NVM_DIR/nvm.sh"
        nvm use
        ${command}
    """
}

pipeline {
    agent any
    environment {
        CREDENTIALS = credentials('gizmo-ci-com-klodnicki-pydt-notifier')
    }
    stages {
        stage('Setup') {steps { script {
            remote.user = env.CREDENTIALS_USR
            remote.identityFile = env.CREDENTIALS
            sh 'git clean -fd'

            nvmVersion = readFile('nvm_version').trim()
            sh """
                export NVM_DIR="\${WORKSPACE}/.nvm"
                mkdir -p "\$NVM_DIR"
                if [ ! -s "\$NVM_DIR/nvm.sh" ]; then
                    curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v${nvmVersion}/install.sh" | bash
                fi
                . "\$NVM_DIR/nvm.sh"
                nvm install "\$(cat .nvmrc)"
                nvm alias default "\$(cat .nvmrc)"
            """
        } } }

        stage('Install dependencies') { steps { script {
            shNode 'npm i'
        } } }

        stage('Test') { steps { script {
            // Use CI install and run tests; ensure config is available for tests
            shNode 'npm ci --silent'
            shNode 'PYDT_NOTIFIER_CONFIG=./config-template.json npm test --silent'
        } } }

        stage('Build') {
            environment {
                NODE_ENV = 'PRODUCTION'
            }
            steps { script {
                shNode 'npm run pack'
            } }
        }

        stage('Install Node on Target') {
            steps { script {
                // Update nvm
                nvmVersion = readFile('nvm_version').trim()
                    
                sshCommand remote: remote, command: """
                    curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v${nvmVersion}/install.sh" | bash
                """

                // Install node
                nodeVersion = readFile('.nvmrc').trim()

                sshCommand remote: remote, command: """
                    . ~/.nvm/nvm.sh &&
                    nvm install 'v${nodeVersion}'
                """
            }}
        }

        stage('Prepare Deployment') {
            steps { script {
                nodeVersion = readFile('.nvmrc').trim()

                sshCommand remote: remote, command: 'rm -rf api.new api.old'
                sshCommand remote: remote, command: 'mkdir api.new'
                sshPut remote: remote, from: 'com-klodnicki-pydt-notifier.tgz', into: 'api.new'
                sshPut remote: remote, from: 'com-klodnicki-pydt-notifier.service', into: 'api.new'
                sshCommand remote: remote, command: """
                    . ~/.nvm/nvm.sh &&
                    nvm use 'v${nodeVersion}' &&
                    npm i com-klodnicki-pydt-notifier.tgz &&
                    rm com-klodnicki-pydt-notifier.tgz &&
                    mkdir -p ~/.config/systemd/user/ &&
                    mv com-klodnicki-pydt-notifier.service ~/.config/systemd/user/com-klodnicki-pydt-notifier.service
                """
            } }
        }

        stage('Deploy') {
            steps { script {
                sshCommand remote: remote, command: '''
                    mkdir -p api &&
                    mv api api.old &&
                    mv api.new api &&
                    systemctl --user daemon-reload &&
                    systemctl --user restart com-klodnicki-pydt-notifier
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
