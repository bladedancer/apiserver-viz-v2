import { account } from './sdk.js';
import config from './config.js';
import { log, highlight, note } from './log.js';
import { getResourceDefinitions } from './definitions.js';
import { getResourceInstances } from './instances.js';
import { spinner } from './spinner.js';
import fs from 'fs/promises';
import path from 'node:path';

function storeNames() {
    let orgId = account.org.id;
    return {
        definitions: path.join(config.STORE_PATH, `definitions.${orgId}.json`),
        instances: path.join(config.STORE_PATH, `instances.${orgId}.json`),
    }
}

class DBStore {
    constructor() {
        this.definitions = [];
        this.instances = [];
        this.initPromise = this.load();
    }

    async loadFromServer() {
        await this.refresh('definitions');
        await this.refresh('instances');
    }

    async loadFromStore() {
        let paths = storeNames();
        let rawDefs = await fs.readFile(paths.definitions);
        let rawInstances = await fs.readFile(paths.instances);
        this.definitions = JSON.parse(rawDefs);
        this.instances = JSON.parse(rawInstances);
    }

    async load() {
        this.loading = true;

        try {
            await this.loadFromStore();
            this.loading = false;
        } catch(e) {
            log.info("No resources cached for " + account.org.id);
        }

        if (this.loading) {
            await this.loadFromServer();
            this.loading = false
        }

        return;
    }

    async store() {
        let paths = storeNames();
        await fs.writeFile(paths.definitions, JSON.stringify(this.definitions, null, 2));
        await fs.writeFile(paths.instances, JSON.stringify(this.instances, null, 2));
    }

    async init() {
        await this.initPromise;
    }

    async refreshInstances() {
        let insts = [];

        for (let def of Object.values(this.definitions).sort((a,b) => a.resource.spec.plural.localeCompare(b.resource.spec.plural))) {
            spinner.text = `Loading ${def.resource.group} ${def.resource.spec.plural}`;
            let localInstances = await getResourceInstances(account, def);
            insts = insts.concat(localInstances);
        }
        this.instances = insts;
        await this.store();
    }

    async refreshDefinitions() {
        this.definitions = await getResourceDefinitions(account)
        await this.store();
    }

    async refresh(source) {
        this.loading = true;
        if (source === 'definitions') {
            await this.refreshDefinitions();
        } else if (source === 'instances') {
            await this.refreshInstances();
        }
        this.loading = false;
    }
}

const dbstore = new DBStore();
const db = {
    definitions: () => dbstore.definitions,
    instances: () => dbstore.instances,
    loading: () => dbstore.loading,
    refresh: (s) => dbstore.refresh(s),
    init: async (cb) => {
        if (cb) {
            dbstore.initPromise = dbstore.initPromise.then(cb);
        }
        return dbstore.initPromise;
    }
}
export default db;
