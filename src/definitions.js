import { log, highlight, note } from './log.js';
import { apicRequest } from "./request.js";

async function getResourceVersions(account) {
    return apicRequest(account, `/definitions/v1alpha1/resourceversions`)
}

async function getResources(account) {
    return apicRequest(account, `/definitions/v1alpha1/resources`)
}

export async function getResourceDefinitions(account) {
    let resources = await getResources(account);
    let resourceVersions = await getResourceVersions(account);
    let resourceSchemas = resources.reduce((acc, res) => {
        acc[res.name] = {
            resource: res,
            versions: resourceVersions.filter(ver => ver.spec.resourceDefinition === res.name)
        };
        return acc;
    }, {})
    return resourceSchemas;
}
