const TasksService = require('./tasks-service')


const TasksHelper = {
    updateTasks(tasks, knex) {
        return knex.transaction(trx => {
            const queries = [];
            tasks.forEach(task => {
                const { title, image, checked } = task
                const taskToUpdate = { title, image, checked }

                const numberOfValues = Object.values(taskToUpdate).filter(Boolean).length
                if (numberOfValues === 0) {
                    return res.status(400).json({
                        error: {
                            message: `Request body must content either 'title', 'image', or 'checked'`
                        }
                    })
                }
                const query = TasksService.updateTask(
                    knex,
                    task.id,
                    taskToUpdate
                )
                    .transacting(trx);
                queries.push(query);
            })
            Promise.all(queries)
                .then(trx.commit)
                .catch(trx.rollback);
        })

    }
}

module.exports = TasksHelper