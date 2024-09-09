LAB-1 FRAGMENTS

1. Prerequisites
   It inculdes the installation of the following:
   - WSL2 - using the command (wsl --install)
   - Node.Js
   - VSCode - also need to install the following extensions in it:
         * ESLint
         * Prettier - Code Formatter
         * Code Spell Checker
     - git - check the version of the installed git using the command (git --version)
     - curl - for windows, to check the version of curl in powershell use the command (curl.exe --version)
       
2. API Server Setup
   In this step, I have created a node.js based REST API using EXPRESS.
   For this the first step is to setup npm, which will be done using the command (npm init -y), this will create a package.json file.

3. Prettier Setup
   It is basically a code formatter which will help to format the source code whenever the code will be saved. It will keep the consistency of the code.
   
   For Setup, Firstly install a dependancy of the prettier using command:
   npm install --save-dev --save-exact prettier

   Secondly, create a .prettierrc file(it will contain the configurations) and .prettierignore file(it will guide prettier about which file or folder to ignore 
   while formmating)

   Thirdly, create a folder named .vscode and a file name settings.json within the folder, which will help to override the vscode when working on the project so 
   that no other project is modified or disturbed.

5. ESLint
   ESLint is basically a tool which is used to check the style of the code and the syntax errors of the code.
   
   To check the lint of the code the following command is used:
   npm run lint
   
6. Structured Logging and Pino
   Structured Logging is a method of using log in a systematic way specially in key-value format. It is a good way of coding as it helps the devloper to easly 
   analyze and search the data.
   Pino is a type of structured logging, which is fast and lightweight and produces the logs in Json formmat.

   To install a dependency of Pino the following command is used:
   npm install --save pino pino-pretty pino-http

7. Express App
   It is a type of web application which is build using Express.js framework.
   
   To install the packages required for Express App:
   npm install --save express cors helmet compression

8. Express Server Setup
   Express Server will help to setup a communication between a client and HTTP server.

   I have installed stoppable packages, to allow my server exit gracefully, for this I have used the following command:
   npm install --save stoppable

9. Server Startup Scripts
    This script will help to run the code and give an output on HTTP server.

    First step, install nodemon pakages, using the command:
    npm install --save-dev nodemon

10. Start
    To start the program, the following command will be given:
    npm start

11. Development
    Here, the code will start in the development mode which will help to see the changes in real time.
    
    For windows, the following line is to be added in scripts of package.json to start the development:
    "dev": "cross-env LOG_LEVEL=debug nodemon ./src/server.js --watch src"

    To run the program, we use the command:
    npm run dev

12. Debug
    Debugging will help to troubleshoot the errors.

    For windows, the following line is to be added in scripts of package.json:
    "debug": "cross-env LOG_LEVEL=debug nodemon --inspect=0.0.0.0:9229 ./src/server.js --watch src"

    To debug the program, use the command:
    npm run debug
