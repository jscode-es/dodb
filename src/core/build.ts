const $ = process.env

import Database from './database'
import Model from './model'

export default class Build {

    static cache: any = {}

    static async syncDatabase(schema: string = '') {

        /*if (Build.cache[schema]) {
            return Build.cache[schema]
        }*/

        if (typeof schema === 'string' && schema.length === 0) {
            schema = String($.DB_TABLE)
        }

        let sql = `
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = :schema`

        let tableDefined: any = String($.TABLE_DEFINED)

        if (tableDefined !== 'undefined') {

            let tables = tableDefined.split(',')

            for (const table of tables) {

                sql += ` AND table_name='${table}'`
            }

        }

        let db = new Database()

        let tables = await db.query(sql, { schema })

        let models: any = {}

        for (let i = 0; i < tables.length; i++) {

            models[tables[i].TABLE_NAME] = await Model.generate(schema, tables[i].TABLE_NAME)
        }

        //Build.cache[schema] = models

        return models

    }

}