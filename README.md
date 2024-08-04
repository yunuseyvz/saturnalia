## Multibuzzer

Simple multiplayer buzzer system

https://multibuzzer.onrender.com

Built using Create React App and boardgame.io

Please open an issue if you experience a bug or have product feedback!

### Functionality

- **Multiplayer Buzzer System**: Allows multiple players to join a room and buzz in response to questions.
- **Quiz Questions**: Includes a set of quiz questions that players can answer.
- **Host Controls**: The host can lock/unlock buzzers, reset buzzers, and move to the next question.

### Planned Features

- **Upload Custom Questions**: Allow users to upload their own set of questions.
- **Categories**: Organize questions into different categories for a more structured quiz experience.
- ... and more

### Fork Information

I forked this project from https://github.com/wsun/multibuzzer.

### Development

- Prerequisites: node and a package manager (e.g. npm, yarn)
- Run `yarn install` to install dependencies
- Run `yarn dev` to run local client on localhost:4000 and local server on localhost:4001

### Deployment

- Build React app using `yarn build`
- Run `yarn start` to run the Koa server, which will serve the built React app (via '/build'), as well as operate both the boardgame.io server and lobby