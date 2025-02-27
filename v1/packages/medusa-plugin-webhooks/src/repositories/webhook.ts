import { Webhook } from '../models';
import { dataSource } from '@medusajs/medusa/dist/loaders/database';

const WebhookRepository = dataSource.getRepository(Webhook);
export default WebhookRepository;
