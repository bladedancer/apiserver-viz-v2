import { sdk } from './sdk.js';
import { log, highlight, note } from './log.js';
import config from './config.js';

export async function request(account, url, {
    json,
    query,
    method
} = {}) {
    const headers = {
        Accept: 'application/json',
        'User-Agent': config.USER_AGENT,
        'X-Axway-Tenant-Id': account.org.id,
        Authorization: `Bearer ${account.auth.tokens.access_token}`
    };

    if (!method) {
        method = json ? 'post' : 'get';
    }
    let opts = {
        headers,
        json: json ? JSON.parse(JSON.stringify(json)) : undefined,
        responseType: 'json',
        searchParams: query,
        retry: 0
    };
    try {
        log.debug(`${method.toUpperCase()} ${highlight(url)} ${note('token ' + account.auth.tokens.access_token)}`);
        return await sdk.got[method](url, opts);
    } catch (e) {
        log.error(e);
        if (e.response && e.response.body) {
            log.error(e.response.body);
        }
        throw e
    }
}

export async function apicRequest(account, path, fields = []) {
    const url = `${config.BASE_URL}${path}`;
    let page = 1;
    let pageSize = config.PAGE_SIZE;
    let all = []; // Obviously this could go horribly wrong with memory...but it won't
    let hasMore = true;
    
    let query = {
        page,
        pageSize
    };

    if (fields.length > 0) {
        query.fields = fields.join(',');
    }

    while (hasMore) {
        let response = await request(account, url,  {
            query
        });

        all = all.concat(response.body);
        hasMore = (response.body.length == pageSize);
        query.page += 1;
    }
    return all;
}
