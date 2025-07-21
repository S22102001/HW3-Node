const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs').promises;
const logger = require('./logger');
const validateTask = require('./validateTask');
const errorHandler = require('./errorHandler');


const app = express();
const PORT = 3000;

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
        const data = await fs.readFile('tasks.json', 'utf-8');
        const tasks = JSON.parse(data);
        tasks.push(newTask);
        await fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2));
        res.status(201).json(newTask);
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
