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

app.delete('/tasks/:id', async (req, res, next) => {
    try {
        const idToDelete = req.params.id;
        const tasks = await readTasks();
        const updatedTasks = tasks.filter(task => task.id !== idToDelete);

        console.log('🔎 Request to delete ID:', idToDelete);
        console.log('📋 Current task IDs:', tasks.map(t => t.id));
        console.log('📉 Task count before:', tasks.length, '→ after:', updatedTasks.length);

        await writeTasks(updatedTasks);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});


app.put('/tasks/:id', validateTask, async (req, res, next) => {
    try {
        const tasks = await readTasks();
        const index = tasks.findIndex(task => task.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Task not found' });

        const updatedTask = {
            ...tasks[index],
            title: req.body.title.trim(),
            description: req.body.description ? req.body.description.trim() : '',
            status: req.body.status,
            updatedAt: new Date().toISOString(),
        };

        tasks[index] = updatedTask;
        await writeTasks(tasks);
        res.json(updatedTask);
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
