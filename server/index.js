const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs').promises;
const logger = require('./logger');
const validateTask = require('./validateTask');
const errorHandler = require('./errorHandler');

const app = express();
const PORT = 3000;

const DATA_PATH = './tasks.json';

async function readTasks() {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}

async function writeTasks(TasksArray) {
    await fs.writeFile(DATA_PATH, JSON.stringify(TasksArray, null, 2));
}

app.use(express.json());
app.use(logger);
app.use(cors());

app.post('/tasks', validateTask, async (req, res, next) => {
    const newTask = {
        id: uuidv4(),
        title: req.body.title.trim(),
        description: req.body.description ? req.body.description.trim() : '',
        status: req.body.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    try {
        const tasks = await readTasks();
        tasks.push(newTask);
        await writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (err) {
        next(err);
    }
});

app.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
