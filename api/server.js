import path from 'path';
import serve from 'koa-static';
import ratelimit from 'koa-ratelimit';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'boardgame.io/server';
import { Buzzer } from './lib/store';

const server = Server({ games: [Buzzer], generateCredentials: () => uuidv4() });

const PORT = process.env.PORT || 3001;
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
    errorMessage: 'Sometimes You Just Have to Slow Down.',
    id: (ctx) => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total',
    },
    max: 100,
  })
);

export default server.callback();