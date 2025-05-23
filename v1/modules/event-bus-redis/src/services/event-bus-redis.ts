import { InternalModuleDeclaration } from '@medusajs/modules-sdk';
import { EmitData, Logger, Message } from '@medusajs/types';
import { AbstractEventBusModuleService, isString } from '@medusajs/utils';
import { BulkJobOptions, JobsOptions, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { BullJob, EmitOptions, EventBusRedisModuleOptions } from '../types';

type InjectedDependencies = {
  logger: Logger;
  eventBusRedisConnection: Redis;
};

/**
 * Can keep track of multiple subscribers to different events and run the
 * subscribers when events happen. Events will run asynchronously.
 */
// eslint-disable-next-line max-len
export default class RedisEventBusService extends AbstractEventBusModuleService {
  protected readonly logger_: Logger;
  protected readonly moduleOptions_: EventBusRedisModuleOptions;
  // eslint-disable-next-line max-len
  protected readonly moduleDeclaration_: InternalModuleDeclaration;
  protected readonly eventBusRedisConnection_: Redis;

  protected queue_: Queue;
  protected bullWorker_: Worker;
  protected onSubscriberError_: (data: {
    event: string;
    subscriberId: string;
    error: Error;
  }) => void = () => {};

  constructor(
    { logger, eventBusRedisConnection }: InjectedDependencies,
    moduleOptions: EventBusRedisModuleOptions = {},
    moduleDeclaration: InternalModuleDeclaration,
  ) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);

    this.eventBusRedisConnection_ = eventBusRedisConnection;

    this.moduleOptions_ = moduleOptions;
    this.logger_ = logger;

    this.queue_ = new Queue(moduleOptions.queueName ?? `events-queue`, {
      prefix: `${this.constructor.name}`,
      ...(moduleOptions.queueOptions ?? {}),
      connection: eventBusRedisConnection,
    });

    // Register our worker to handle emit calls
    const shouldStartWorker = moduleDeclaration.worker_mode !== 'server';
    if (shouldStartWorker) {
      this.bullWorker_ = new Worker(moduleOptions.queueName ?? 'events-queue', this.worker_, {
        prefix: `${this.constructor.name}`,
        ...(moduleOptions.workerOptions ?? {}),
        connection: eventBusRedisConnection,
      });
    }

    if (moduleOptions.onSubscriberError) {
      this.onSubscriberError_ = moduleOptions.onSubscriberError;
    }
  }

  __hooks = {
    onApplicationPrepareShutdown: async () => {
      await this.bullWorker_?.close(false);
    },
  };

  /**
   * Emit a single event
   * @param {string} eventName - the name of the event to be process.
   * @param data - the data to send to the subscriber.
   * @param options - options to add the job with
   */
  async emit<T>(eventName: string, data: T, options: Record<string, unknown>): Promise<void>;

  /**
   * Emit a number of events
   * @param {EmitData} data - the data to send to the subscriber.
   */
  async emit<T>(data: EmitData<T>[]): Promise<void>;

  async emit<T>(data: Message<T>[]): Promise<void>;

  async emit<T, TInput extends string | EmitData<T>[] | Message<T>[] = string>(
    eventNameOrData: TInput,
    data?: T,
    options: BulkJobOptions | JobsOptions = {},
  ): Promise<void> {
    const globalJobOptions = this.moduleOptions_.jobOptions ?? {};

    const isBulkEmit = Array.isArray(eventNameOrData);

    const opts = {
      // default options
      removeOnComplete: true,
      attempts: 1,
      // global options
      ...globalJobOptions,
    } as EmitOptions;

    const dataBody = isString(eventNameOrData) ? (data ?? (data as Message<T>).body) : undefined;

    const events = isBulkEmit
      ? eventNameOrData.map((event) => ({
          name: event.eventName,
          data: {
            eventName: event.eventName,
            data: (event as EmitData).data ?? (event as Message<T>).body,
          },
          opts: {
            ...opts,
            // local options
            ...event.options,
          },
        }))
      : [
          {
            name: eventNameOrData as string,
            data: { eventName: eventNameOrData, data: dataBody },
            opts: {
              ...opts,
              // local options
              ...options,
            },
          },
        ];

    await this.queue_.addBulk(events);
  }

  /**
   * Handles incoming jobs.
   * @param job The job object
   * @return resolves to the results of the subscriber calls.
   */
  worker_ = async <T>(job: BullJob<T>): Promise<unknown> => {
    const { eventName, data } = job.data;
    const eventSubscribers = this.eventToSubscribersMap.get(eventName) || [];
    const wildcardSubscribers = this.eventToSubscribersMap.get('*') || [];

    const allSubscribers = eventSubscribers.concat(wildcardSubscribers);

    // Pull already completed subscribers from the job data
    const completedSubscribers = job.data.completedSubscriberIds || [];

    // Filter out already completed subscribers from the all subscribers
    const subscribersInCurrentAttempt = allSubscribers.filter(
      (subscriber) => subscriber.id && !completedSubscribers.includes(subscriber.id),
    );

    const currentAttempt = job.attemptsMade;
    const isRetry = currentAttempt > 1;
    const configuredAttempts = job.opts.attempts;

    const isFinalAttempt = currentAttempt === configuredAttempts;

    if (isRetry) {
      if (isFinalAttempt) {
        this.logger_.info(`Final retry attempt for ${eventName}`);
      }

      this.logger_.info(
        `Retrying ${eventName} which has ${eventSubscribers.length} subscribers (${subscribersInCurrentAttempt.length} of them failed)`,
      );
    } else {
      this.logger_.info(`Processing ${eventName} which has ${eventSubscribers.length} subscribers`);
    }

    const completedSubscribersInCurrentAttempt: string[] = [];
    const subscriberErrors: Error[] = [];

    const subscribersResult = await Promise.all(
      subscribersInCurrentAttempt.map(async ({ id, subscriber }) => {
        try {
          const result = await subscriber(data, eventName);
          // For every subscriber that completes successfully, add their id to the list of completed subscribers
          completedSubscribersInCurrentAttempt.push(id);
          return result;
        } catch (err) {
          subscriberErrors.push(err);
          this.logger_.warn(`An error occurred while processing ${eventName}: ${err}`);

          try {
            this.onSubscriberError_({
              event: eventName,
              subscriberId: id,
              error: err,
            });
          } catch (ex) {
            this.logger_.warn(`Failed onSubscriberError: ${ex}`);
          }

          return err;
        }
      }),
    );

    // If the number of completed subscribers is different from the number of subscribers to process in current attempt, some of them failed
    const didSubscribersFail = completedSubscribersInCurrentAttempt.length !== subscribersInCurrentAttempt.length;

    const isRetriesConfigured = configuredAttempts! > 1;

    // Therefore, if retrying is configured, we try again
    const shouldRetry = didSubscribersFail && isRetriesConfigured && !isFinalAttempt;

    if (shouldRetry) {
      const updatedCompletedSubscribers = [...completedSubscribers, ...completedSubscribersInCurrentAttempt];

      job.data.completedSubscriberIds = updatedCompletedSubscribers;

      await job.updateData(job.data);

      const errorMessage = `One or more subscribers of ${eventName} failed. Retrying...`;

      this.logger_.warn(errorMessage);

      if (subscriberErrors.length === 1) return Promise.reject(subscriberErrors[0]);

      return Promise.reject(Error(errorMessage));
    }
    if (isFinalAttempt && didSubscribersFail) {
      this.logger_.warn(`One or more subscribers of ${eventName} failed. All retries have been exhausted.`);

      if (subscriberErrors.length === 1) return Promise.reject(subscriberErrors[0]);

      return Promise.reject(AggregateError(subscriberErrors, '2 or more subscribers failed'));
    }

    if (didSubscribersFail && !isFinalAttempt) {
      // If retrying is not configured, we log a warning to allow server admins to recover manually
      this.logger_.warn(
        `One or more subscribers of ${eventName} failed. Retrying is not configured. Use 'attempts' option when emitting events.`,
      );
    }

    return Promise.resolve(subscribersResult);
  };
}
