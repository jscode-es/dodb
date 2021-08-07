import Database from './database'
import Validate from './validate'

export default class Model {

    private name: string
    private schema: string
    private attrs: any

    constructor(schema: string, name: string) {
        this.name = name
        this.schema = schema
    }

    getName() {
        return this.name
    }

    getSchema() {
        return this.schema
    }

    async getAttrs() {

        let db = new Database()

        let sql = `SELECT *
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${this.getSchema()}' AND TABLE_NAME = '${this.getName()}'`

        let data = await db.query(sql)

        return data
    }

    async setAttrs(attrs: any) {
        this.attrs = attrs
    }

    async getPrimaryKey() {

        let db = new Database()

        let primayKey = []

        let sql = `SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${this.getSchema()}' AND TABLE_NAME = '${this.getName()}' AND COLUMN_KEY = 'PRI'`

        let data = await db.query(sql)

        for (const item of data) {
            
            primayKey.push(item.COLUMN_NAME)
        }

        return primayKey
    }

    // Data, pude un objecto o un array de objectos
    async add(data: any) { 

        if (typeof data !== 'object') return false

        let { attrs } = this

        let result:any = []
        let errors :any= []

        if(!Array.isArray(data))
        {
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
            } else 
                errors.push(error)

        }

        if(errors.length===0) errors = false

        return {result, errors}
    }

    async get(params:any) {

        let db = new Database()

        let sql = `SELECT * FROM \`${this.getName()}\``

        if('where' in params)
        {
            //TODO: continuar
        }

        let result = await db.query(sql)

        return result
    }

    async getById(id:number|string, pk='id')
    {
        let primaryKey = await this.getPrimaryKey()

        let result:any = []

        let where :any= {}

        if(!primaryKey.includes(pk))
        {
            if(primaryKey.length!=0)
                pk = primaryKey[0]
            else
                return false
        }

        where[pk] = id

        result = await this.get({where})

        return result
    }

    async update(data: any) {

        if (typeof data !== 'object') return false

        let primaryKey = await this.getPrimaryKey()

        let isPrimaryExist = false

        let where = ''

        primaryKey.forEach(function(key) { 

            where += 'WHERE '

            if(key in data)
            {
                where += `\`${key}\` = '${data[key]}'`
                delete data[key]
            }
        });

        if(!isPrimaryExist) return false

        let { attrs } = this

        let { error, value } = Validate.check(attrs, data)

        if (!error) {

            let db = new Database()

            let keys = Object.keys(value)

            let set = ''

            for (const key in value) 
            {
                set+=`\`${key}\` = '${value[key]}',`
            }

            set = set.slice(0, -1) 

            let sql = `UPDATE \`${this.getName()}\` SET ${set} ${where}`

            let result = await db.query(sql, value)

            return result
        }

        return false
    }

    async remove(id: any) {

        
        if (id && typeof id !== 'object') {

            let db = new Database()
    
            let primaryKey = await this.getPrimaryKey()
    
            let sql = `
            DELETE FROM \`${this.getName()}\` 
            WHERE ${primaryKey} = :id`

            let result = await db.query(sql, { id })
    
            return result
        }

        return false

    }

    static async generate(schema: string, table: string) {

        let model = new Model(schema, table)

        let attrs = await Validate.setSchema(model) // Schema de la tabla

        model.setAttrs(attrs)

        return model;
    }
}