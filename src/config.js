import { config } from 'dotenv';
import { Config } from '@axway/amplify-cli-utils';
// Load defaults from .env
config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const USER_AGENT = process.env.USER_AGENT || 'apiserver-viz';
const AMPLIFY_CENTRAL_URL = process.env.AMPLIFY_CENTRAL_URL || 'https://apicentral.axway.com';
const BASE_URL = AMPLIFY_CENTRAL_URL + "/apis";
const PAGE_SIZE = process.env.PAGE_SIZE ? parseInt(process.env.PAGE_SIZE) : 100;
const STORE_PATH = process.env.STORE_PATH || './store';
const USE_STORE = process.env.USE_STORE ? process.env.USE_STORE.toLowerCase() === 'true' : false;

const PLATFORM_CONFIG = new Config();
process.env.PLATFORM_ENV && PLATFORM_CONFIG.set("env", process.env.PLATFORM_ENV)

export default {
    PORT,
    USER_AGENT,
    AMPLIFY_CENTRAL_URL,
    BASE_URL,
    PAGE_SIZE,
    STORE_PATH,
    USE_STORE,
    PLATFORM_CONFIG
};
