const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Tasks Endpoints', function () {
    let db

    const {
        testUsers,
        testTasks,
    } = helpers.makeTasksFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    before('cleanup', () => helpers.cleanTables(db))

    after('disconnect from db', () => db.destroy())

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/tasks`, () => {

        context('Given there are tasks in the database', () => {
            beforeEach('insert users and tasks', async () => {
                await helpers.seedUsers(db, testUsers)
                await helpers.seedTasks(db, testTasks)
            })

            it('responds with 200 and all of the tasks', (done) => {
                const expectedTasks = testTasks.map(task =>
                    helpers.makeExpectedTask(
                        testUsers,
                        task,
                    )
                )

                done()

                return supertest(app)
                    .get('/api/tasks')
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedTasks)
            })
        })
    })
})
