import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import { Webhook } from "../models/webhook";

const WebhookRepository = dataSource.getRepository(Webhook);
export default WebhookRepository;
