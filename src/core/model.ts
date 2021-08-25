import Database from './database'
import Validate from './validate'

export default class Model {

    private name: string
    private schema: string
    private attrs: any
    private keys: Array<String> = []
    private primaryKeys: Array<String> = []

    constructor(schema: string, name: string) {
        this.name = name
        this.schema = schema
    }

    // MÉTODOS PÚBLICOS

    getName() {
        return this.name
    }

    getSchema() {
        return this.schema
    }

    async getAttrs() {

        if (this.keys.length === 0) {

            let db = new Database()

            let sql = `SELECT *
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '${this.getSchema()}' AND TABLE_NAME = '${this.getName()}'`

            let data = await db.query(sql)

            let keys: Array<String> = []

            for (const item of data) {

                keys.push(item.COLUMN_NAME)
            }

            this.keys = keys

            return data
        }

        await this.getPrimaryKey()

        return this.keys
    }

    async setAttrs(attrs: any) {
        this.attrs = attrs
    }

    async getPrimaryKey() {

        if (this.primaryKeys.length === 0) {

            let db = new Database()

            let primayKey = []

            let sql = `SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '${this.getSchema()}' AND TABLE_NAME = '${this.getName()}' AND COLUMN_KEY = 'PRI'`

            let data = await db.query(sql)

            for (const item of data) {

                primayKey.push(item.COLUMN_NAME)
            }

            this.primaryKeys = primayKey

            return primayKey

        }

        return this.primaryKeys

    }

    async add(data: any) {

        if (typeof data !== 'object') return false

        let { attrs } = this

        let result: any = []
        let errors: any = []


        if (!Array.isArray(data)) {
            data = [data]
        }

        for (const item of data) {

            let { error, value } = Validate.check(attrs, item)

            if (!error) {

                let db = new Database()

                let keys = Object.keys(value)

                let sql = `INSERT INTO \`${this.getName()}\` ( \`${keys.join("`,`")}\` ) VALUES ( :${keys.join(",:")} )`

                let success = await db.query(sql, value)

                result.push(success)

            } else errors.push(error)

        }

        if (errors.length === 0) errors = false

        return { result, errors }
    }

    async get(params: any) {

        // TODO: validates params to schema

        let result: any = []
        let errors: any = []

        let db = new Database()

        let sql = `SELECT * FROM \`${this.getName()}\``

        if (typeof params === 'object') {

            if ('values' in params) {

                let replace: any = this.formatValue(params.values)

                if (replace.length === 0) {
                    replace = '*'
                }

                sql = sql.replace('*', replace)

            }

            if ('where' in params) {
                sql += this.formatWhere(params.where, '=')
            }

            if ('in' in params) {

                if ('where' in params) {
                    sql += ` AND ${this.formatIn(params.in, true)}`
                } else {
                    sql += this.formatIn(params.in)
                }

            }

            if ('like' in params) {

                if ('where' in params) {
                    sql += ` AND ${this.formatWhere(params.like, 'LIKE', true)}`
                } else {
                    sql += this.formatWhere(params.like, 'LIKE')
                }
            }

            if ('order' in params) {

                sql += this.formatOrder(params.order)

            }

            if ('limit' in params) {
                sql += ` LIMIT ${params.limit}`
            }
        }

        result = await db.query(sql)

        if (errors.length === 0) errors = false

        return { result, errors }
    }

    async getById(id: number | string, pk = 'id') {

        let primaryKey = await this.getPrimaryKey()

        let where: any = {}

        if (!primaryKey.includes(pk)) {
            if (primaryKey.length != 0) {
                console.warn(`[ WARN ] The Primary Key was not found '${pk}', and 'id`)
                pk = primaryKey[0]
            }
            else
                return { result: [], error: `This primary key, '${pk}' is not exist` }
        }

        where[pk] = id

        console.log('where', where)

        let { result, errors } = await this.get({ where })

        return { result, errors }
    }

    async update(find: any, data: any, pk = 'id') {

        let result: any = []
        let errors: any = []

        if (typeof data !== 'object') return { result, errors: 'This data is not to Object' }

        let where = ''

        if (typeof find === 'number' || typeof find === 'string') {

            let primaryKey = await this.getPrimaryKey()

            if (!primaryKey.includes(pk)) {
                if (primaryKey.length != 0) {
                    console.warn(`[ WARN ] The Primary Key was not found '${pk}', and 'id`)
                    pk = primaryKey[0]
                }
            }

            where += `WHERE ${pk} = :find`

        } else if (typeof find === 'object' && !Array.isArray(find)) {

            where += `WHERE `

            for (const key in find) {

                where += `\`${key}\` = '${find[key]}' AND`
            }

            let regex = /AND$/gm;

            if (regex.test(where)) {
                where = where.slice(0, -4)
            }
        }

        let { attrs } = this

        let { error, value } = Validate.check(attrs, data)

        if (!error) {

            let db = new Database()

            let set = ''

            for (const key in value) {
                set += `\`${key}\` = '${value[key]}',`
            }

            set = set.slice(0, -1)

            let sql = `UPDATE \`${this.getName()}\` SET ${set} ${where}`

            result = await db.query(sql, value)

        }

        if (errors.length === 0) errors = false

        return { result, errors }
    }

    async remove(id: any, pk: string = 'id') {

        let result: any = []
        let errors: any = []

        // TODO: validates params to schema

        if (id && typeof id !== 'object') {

            let db = new Database()

            let primaryKey = await this.getPrimaryKey()

            if (!primaryKey.includes(pk)) {
                if (primaryKey.length != 0) {
                    console.warn(`[ WARN ] The Primary Key was not found '${pk}', and 'id`)
                    pk = primaryKey[0]
                }
                else
                    return { result: [], error: `This primary key, '${pk}' is not exist` }
            }

            let sql = `
            DELETE FROM \`${this.getName()}\` 
            WHERE ${pk} = :id`

            console.log({ sql })

            result = await db.query(sql, { id })

        } else {

            errors = 'Required id'
        }

        if (errors.length === 0) errors = false

        return { result, errors }

    }

    static async generate(schema: string, table: string) {

        let model = new Model(schema, table)

        let attrs = await Validate.setSchema(model) // Schema de la tabla

        model.setAttrs(attrs)

        return model
    }

    // MÉTODOS PRIVADOS

    private formatIn(_in: any, delWhere: boolean = false) {

        let { keys } = this

        let sql = 'WHERE'

        if (delWhere) sql = ''

        let existKey = false

        for (const key in _in) {

            if (keys.includes(key)) {

                existKey = true

                if (Array.isArray(_in[key])) {

                    sql += ` \`${key}\` IN ( '${_in[key].join('\',\'')}' ) AND`

                }

            } else {
                console.warn(`[ WARN ] This key '${key}', no exist`)
            }
        }

        let regex = /AND$/gm;

        if (regex.test(sql)) {
            sql = sql.slice(0, -4)
        }

        if (!existKey) sql = ''

        return sql
    }

    private formatOrder(order: any) {
        let { keys } = this
        let sql = ' ORDER BY '
        let existKey = false

        for (const key in order) {
            if (keys.includes(key)) {
                existKey = true
                sql += `\`${key}\` ${order[key]},`
            } else {
                console.warn(`[ WARN ] This key '${key}', not exist`)
            }
        }

        let regex = /\,$/gm;

        if (regex.test(sql)) {
            sql = sql.slice(0, -1)
        }

        if (!existKey) sql = ''

        return sql
    }

    private formatValue(value: any): String {

        let { keys } = this

        let existKey = false
        let sql = ''

        if (Array.isArray(value)) {

            for (const key of value) {

                if (keys.includes(key)) {

                    existKey = true

                    sql += `\`${key}\`, `

                } else {

                    const regex = /^([a-zA-Z]+)+\(+[a-zA-Z\*]+\)/gm;

                    if (regex.test(key)) {

                        let [fun, alias] = key.split(':')

                        alias = (alias) ? ` AS \`${alias}\`` : ''

                        sql += `${fun}${alias}, `

                    } else {

                        let [attr, alias] = key.split(':')

                        if (keys.includes(attr)) {

                            existKey = true

                            alias = (alias) ? ` AS \`${alias}\`` : ''

                            sql += `\`${attr}\`${alias}, `

                        } else {

                            console.warn(`[ WARN ] This key '${key}', not exist`)
                        }

                    }
                }

            }
        }

        let regex = /\,\s$/gm;

        if (regex.test(sql)) {
            sql = sql.slice(0, -2)
        }

        if (!existKey) sql = ''

        return sql
    }

    private formatWhere(where: any, type: string = '=', delWhere: boolean = false) {

        let { keys } = this

        let sql = 'WHERE'

        if (delWhere) sql = ''

        let existKey = false

        for (const key in where) {

            if (keys.includes(key)) {

                existKey = true

                if (Array.isArray(where[key])) {

                    let or = ''

                    for (const item of where[key]) {

                        or += `\`${key}\` ${type} '${item}' OR `
                    }

                    sql += ` ( ${or.slice(0, -3)} )`

                } else {

                    let regex = /\)$/gm;

                    if (regex.test(sql)) {
                        sql += ' AND'
                    }

                    sql += ` \`${key}\` ${type} '${where[key]}' AND`
                }

            } else {
                console.warn(`[ WARN ] This key '${key}', not exist`)
            }
        }

        let regex = /AND$/gm;

        if (regex.test(sql)) {
            sql = sql.slice(0, -4)
        }

        if (!existKey) sql = ''

        return sql
    }
}