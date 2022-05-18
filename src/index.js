import db from './db.js';
import { spinner } from './spinner.js';
import config from './config.js';
import api from './api.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express()
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function init() {
    spinner.text = 'Loading schema';
    spinner.start();
    db.init(() => spinner.stop());
}

app.use(express.static('client/dist'));
app.use('/api', api);

app.listen(config.PORT, async () => {
    console.log(`API Server Viz listening on port ${config.PORT}\n`)
    init();
});
