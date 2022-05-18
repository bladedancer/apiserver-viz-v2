import { account } from './sdk.js';
import config from './config.js';
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
        this.definitions = await getResourceDefinitions(account)
        await this.refresh();
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
        let prom;
        if (config.USE_STORE) {
            prom = this.loadFromStore();
        } else {
            prom = this.loadFromServer();
        }

        return prom.then(() => this.loading = false);
    }

    async store() {
        let paths = storeNames();
        await fs.writeFile(paths.definitions, JSON.stringify(this.definitions, null, 2));
        await fs.writeFile(paths.instances, JSON.stringify(this.instances, null, 2));
    }
    
    async init() {
        await this.initPromise;        
    }

    async  refresh() {
        let insts = [];

        for (let def of Object.values(this.definitions).sort((a,b) => a.resource.spec.plural.localeCompare(b.resource.spec.plural))) {
            spinner.text = `Loading ${def.resource.group} ${def.resource.spec.plural}`;    
            let localInstances = await getResourceInstances(account, def);
            insts = insts.concat(localInstances);
        }
        this.instances = insts;
        await this.store();
    }
}

const dbstore = new DBStore();
const db = {
    definitions: () => dbstore.definitions,
    instances: () => dbstore.instances,
    loading: () => dbstore.loading,
    init: async (cb) => { 
        if (cb) {
            dbstore.initPromise = dbstore.initPromise.then(cb); 
        }
        return dbstore.initPromise; 
    }
}
export default db;
