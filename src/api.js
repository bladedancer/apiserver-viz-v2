import express from 'express';
import db from './db.js';

let api = express.Router();

api.get('/definitions', async (req, res) => {
    res.json(db.definitions());
});

api.get('/instances', async (req, res) => {
    res.json(db.instances());
});

api.get('/loading', async (req, res) => {
    res.json(db.loading());
});

api.get('/wait', async (req, res) => {
    await db.init();
    res.end();
});

export default api;