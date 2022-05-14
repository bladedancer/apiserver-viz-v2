import { initSDK } from '@axway/amplify-cli-utils';
const { sdk } = initSDK();

async function authenticate() {
    try {
        return await sdk.auth.login();
    } catch (err) {
        if (err.message != 'Account already authenticated') {
            throw err
        } else {
            return err.account;
        }
    }
}

let account = await authenticate();

export {
    account, 
    sdk
};