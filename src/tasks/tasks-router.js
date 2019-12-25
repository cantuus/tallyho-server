const express = require('express');
const TasksService = require('./tasks-service');
const xss = require("xss");
const { requireAuth } = require('../middleware/jwt-auth')

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
    .all(requireAuth)
    .get((req, res, next) => {
        const knexInstance = req.app.get("db");
        TasksService.getAllTasks(knexInstance)
            .then(tasks => {
                const cleanTasks = tasks.map(task => {
                    return serializeTask(task);
                });
                res.json(cleanTasks);
            })
            .catch(next);
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { title, image } = req.body;
        const newTask = { title, image }

        for (const [key, value] of Object.entries(newTask)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request in request body` }
                })
            }
        }

        newTask.title = title;
        newTask.image = image;

        TasksService.insertTask(
            req.app.get('db'),
            newTask
        )
            .then(task => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${task.id}`))
                    .json(serializeTask(task))
            })
            .catch(next)
    })

TasksRouter
    .route("/:task_id")
    .all(requireAuth)//basic auth
    .get((req, res, next) => {
        const knexInstance = req.app.get("db")
        TasksService.getById(knexInstance, req.params.task_id)
            .then(task => {
                if (!task) {
                    return res.status(404).json({
                        error: { message: "Task doesn't exist" }
                    });
                }
                res.json(serializeTask(task));
            })
            .catch(next);
    })
    .delete((req, res, next) => {
        const { task_id } = req.params;
        TasksService.deleteTask(
            req.app.get("db"),
            task_id
        )
            .then(numRowsAffected => {
                if (numRowsAffected > 0) {
                    return res.status(204).end();
                }
                else {
                    return res.status(404).json({
                        error: { "message": "Task Not Found" }
                    });
                }
            })
            .catch(next);
    });

module.exports = TasksRouter