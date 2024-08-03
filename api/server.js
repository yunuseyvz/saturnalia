import path from 'path';
import serve from 'koa-static';
import ratelimit from 'koa-ratelimit';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'boardgame.io/server';
import { Buzzer } from '../lib/store';

const server = Server({ games: [Buzzer], generateCredentials: () => uuidv4() });

const { app } = server;

const FRONTEND_PATH = path.join(__dirname, '../build');
app.use(
  serve(FRONTEND_PATH, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

function randomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// rate limiter
const db = new Map();
app.use(
  ratelimit({
    driver: 'memory',
    db: db,
    duration: 60000,
    errorMessage: 'Too many requests',
    id: (ctx) => ctx.ip,
    max: 25,
    whitelist: (ctx) => {
      return !ctx.path.includes(`games/${Buzzer.name}`);
    },
  })
);

export default async (req, res) => {
  await server.run(
    {
      port: process.env.PORT || 4001,
      lobbyConfig: { uuid: () => randomString(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ') },
    },
    () => {
      server.app.use(async (ctx, next) => {
        await serve(FRONTEND_PATH)(
          Object.assign(ctx, { path: 'index.html' }),
          next
        );
      });
    }
  );
};