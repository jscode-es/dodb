let $ = process.env

import mysql from 'promise-mysql'
import dotenv from 'dotenv'

dotenv.config()

export default class Database {

    // Atributo privado de la clase
    private result: any = []
    private setting: any = {}

    constructor(options: any = {}) {
        this.result = []
        this.setSetting(options)
    }

    setSetting(options: any = {}) {

        if (typeof options !== 'object') throw "The options isn't object"

        let setting =
        {
            host: $.DB_HOST,
            user: $.DB_USER,
            password: $.DB_PASS,
            database: $.DB_TABLE,
            port: 3306,
            multipleStatements: true,
            connectionLimit: 5000,
            dateStrings: true,
            connectTimeout: 30000,
            supportBigNumbers: true,
            stringifyObjects: true,
            charset: 'UTF8_GENERAL_CI',
            queryFormat: function (query: any, values: any) {

                if (!values) return query;

                return query.replace(/\:(\w+)/g, function (txt: any, key: any) {

                    if (values.hasOwnProperty(key)) {
                        return mysql.escape(values[key])
                        //return this.escape(values[key]);
                    }

                    return txt;

                }.bind(this));
            }
        }

        Object.assign(setting, options)

        this.setting = setting
    }

    // Establecer conexión
    private connect() {

        return mysql.createConnection(this.setting)

    }

    async query(sql: string, params = {}) {

        let con = await this.connect()

        let data = await con.query(sql, params)

        this.result = data

        con.end()

        return data
    }
}