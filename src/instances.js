import { log, highlight, note } from './log.js';
import { apicRequest } from "./request.js";

export async function getResourceInstances(account, def) {
    let group = def.resource.metadata.scope.name;
    let version = def.versions[def.versions.length - 1].spec.name;
    let kindPlural = def.resource.spec.plural;
    try {
        return await apicRequest(account, `/${group}/${version}/${kindPlural}`, ['name', 'kind', 'metadata', 'group', 'apiVersion', 'finalizers']);
    } catch(e) {
        // Ignore 403 (not everything is readable)
        if (e.response.statusCode !== 403) {
            throw e;
        }
    }
    return [];
}
