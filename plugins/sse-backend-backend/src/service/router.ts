import { errorHandler, PluginEndpointDiscovery } from '@backstage/backend-common';
import * as express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import fetch from 'cross-fetch';

export interface RouterOptions {
  logger: Logger;
  discovery: PluginEndpointDiscovery;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  const buffer = Buffer.from(`test:test`, 'utf8');
  headers.Authorization = `Basic ${buffer.toString('base64')}`;

  return headers;
}

async function sleep(seconds: number) {
  return new Promise((resolve) =>setTimeout(resolve, seconds * 1000));
  }

async function* getNotifications(): AsyncGenerator<unknown> {
  let shouldBreak = false;

  process.on('SIGINT', () => (shouldBreak = true));

  while (!shouldBreak) {
    console.log('awake');

    const response = await fetch(
      'http://localhost:7007/api/proxy/parodos-notifications/notifications?page=0&size=10&sort=NotificationMessage_createdOn,desc',
      { method: 'GET', headers: getAuthHeaders() },
    );
    
    yield await response.json();
  }
}

export async function createRouter(
  {logger}: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/v2/notifications/eventstream', async (req, res) => {
    res.writeHead(200, {
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
    });

    const asyncIterable = getNotifications();

    const asyncIterator = asyncIterable[Symbol.asyncIterator]();

    const cleanUp = async () => {
        if (typeof asyncIterator.return === 'function') {
            await asyncIterator.return(true);
        }
    };

    req.on('close', cleanUp)

    try {
      for await (const notification of asyncIterator) {
        await sleep(5);
        console.log(notification);
        
        res.write("event: message\n");
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
      }

    } catch (e) {
      logger.error(e);
    } finally {
      res.end();
      await cleanUp();
    }
  });

  router.get('/health', (_, res) => {
    res.status(200).json({ ok: true });
  });

  router.use(errorHandler());

  return router;
}

function flush(response: express.Response) {
  const flushable = response as unknown as { flush: Function };
  if (typeof flushable.flush === 'function') {
    flushable.flush();
  }
}
