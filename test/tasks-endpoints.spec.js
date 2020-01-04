const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

describe('Tasks Endpoints', function () {
    let db

    const {
        testUsers,
        testTasks,
    } = helpers.makeTasksFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    before('cleanup', () => helpers.cleanTables(db))

    after('disconnect from db', () => db.destroy())

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/tasks`, () => {

        context('Given no tasks', () => {

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('api/tasks')
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })
    })
}
