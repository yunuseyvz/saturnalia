
<p align="center">
  <img src="https://github.com/yunuseyvz/saturnalia/blob/main/public/image.png?raw=true" />
</p>

Simple multiplayer buzzer system with quiz questions

<https://saturnalia.onrender.com>

(Note: Initial loading could take up to 60 seconds, as this runs on a free instance of Render)

Built using Create React App and boardgame.io

### Functionality

- **Multiplayer Buzzer System**: Allows multiple players to join a room and buzz in response to questions.
- **Quiz Questions**: Includes a set of quiz questions that players can answer.
- **Host Controls**: The host can lock/unlock buzzers, reset buzzers, and move to the next question.
- **Categories**: Organize questions into different categories for a more structured quiz experience.
- **Game Modes**
- **Emote Reactions**

### Planned Features (maybe)

- **Upload Custom Questions**: Allow users to upload their own set of questions.
- **Different Buzzers for each Player**
- **Fortune Wheel**

### Saturnalia?

Felt cute

### Fork Information

I forked this project from <https://github.com/wsun/multibuzzer>.

### Development

- Prerequisites: node and a package manager (e.g. npm, yarn)
- Run `yarn install` to install dependencies
- Run `yarn dev` to run local client on localhost:4000 and local server on localhost:4001

### Deployment

- Build React app using `yarn build`
- Run `yarn start` to run the Koa server, which will serve the built React app (via '/build'), as well as operate both the boardgame.io server and lobby
