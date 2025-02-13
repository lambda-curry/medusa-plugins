import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import bodyParser from 'body-parser';
import { Router } from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { authenticate } from '@medusajs/medusa';

export interface IOptions {
  eventBusRedisOptions?: {
    redisUrl: string;
    redisOptions?: any;
    queueName?: string;
    queueOptions?: {
      prefix?: string;
    };
  };
  jobSchedulerOptions?: {
    redisUrl: string;
    redisOptions?: any;
    queueName?: string;
    queueOptions?: {
      prefix?: string;
    };
  };
  basePath?: string;
  reverseProxyPrefix?: string;
}

const eventBusQueue = (eventBusOptions: IOptions['eventBusRedisOptions']) => {
  if (!eventBusOptions) {
    return undefined;
  }

  const connection = new Redis(eventBusOptions.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    ...(eventBusOptions?.redisOptions ?? {}),
  });

  const queueConfig = {
    prefix: 'RedisEventBusService',
    ...(eventBusOptions.queueOptions ?? {}),
    connection,
  };

  const queue = new Queue(
    eventBusOptions.queueName ?? `events-queue`,
    queueConfig
  );

  return queue;
};

export const jobSchedulerQueue = (
  jobSchedulerOptions?: IOptions['jobSchedulerOptions']
) => {
  if (!jobSchedulerOptions) {
    return undefined;
  }

  const connection = new Redis(jobSchedulerOptions.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    ...(jobSchedulerOptions?.redisOptions ?? {}),
  });

  const queueConfig = {
    prefix: 'JobSchedulerService',
    ...(jobSchedulerOptions.queueOptions ?? {}),
    connection,
  };

  const queue = new Queue(
    jobSchedulerOptions.queueName ?? `scheduled-jobs:queue`,
    queueConfig
  );

  return queue;
};

export default function (rootDirectory: string, options: IOptions) {
  const router = Router();

  router.use(bodyParser.json());

  const reverseProxyPrefix =
    options.reverseProxyPrefix?.replace(/\/$/, '') || '';

  const basePath = options.basePath ?? '/queue-ui';

  const serverAdapter = new ExpressAdapter();

  serverAdapter.setBasePath(`${reverseProxyPrefix}${basePath}`);
  const queues = [
    eventBusQueue(options.eventBusRedisOptions),
    jobSchedulerQueue(options.jobSchedulerOptions),
  ]
    .filter(q => !!q)
    .map(q => new BullMQAdapter(q));

  createBullBoard({
    queues,
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: 'BullMQ Dashboard',
        boardLogo: {
          path: 'https://user-images.githubusercontent.com/7554214/153162406-bf8fd16f-aa98-4604-b87b-e13ab4baf604.png',
          width: 'auto',
          height: 'auto',
        },
      },
    },
  });

  router.use(basePath, authenticate());

  router.use(basePath, serverAdapter.getRouter());

  return router;
}
