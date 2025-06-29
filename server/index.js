const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/tasks', (req, res) => {
    const newTask = {
        id: uuidv4(),
        title: req.body.title.trim(),
        description: req.body.description ? req.body.description.trim() : '',
        status: req.body.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    console.log(newTask);
    res.status(201).json(newTask);
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});


