const express = require('express');
const TasksService = require('./tasks-service');
const xss = require("xss");

const TasksRouter = express.Router();
const jsonParser = express.json();

//sanitation logic
const serializeTask = task => ({
    id: task.id,
    title: xss(task.title),
    image: task.image,
});

TasksRouter
    .route("/")
    .get((req, res, next) => {
        const knexInstance = req.app.get("db");
        TasksService.getAllTasks(knexInstance)
            .then( tasks => {
                const cleanTasks = tasks.map(task => {
                    return serializeTask(task);
                });
                res.json(cleanTasks);
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { title, image } = req.body;
        const newTask = { title, image }

        for(const [key, value] of Object.entries(newTask)) {
            if(value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request in request body`}
                })
            }
        }


        newTask.title = title;
        newTask.image = image;

        TasksService.insertTask(
            req.app.get('db'),
            newTasks
        )
            .then( task => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeTask(task))
            })
            .catch(next)
    })