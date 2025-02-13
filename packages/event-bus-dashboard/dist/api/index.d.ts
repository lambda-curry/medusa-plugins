import { Queue } from 'bullmq';
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
export declare const jobSchedulerQueue: (jobSchedulerOptions?: IOptions['jobSchedulerOptions']) => Queue<any, any, string>;
export default function (rootDirectory: string, options: IOptions): any;
