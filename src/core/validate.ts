import joi from 'joi'

export default class Validate {

    static async setSchema(model: any) {

        let attrs = await model.getAttrs()

        let schema: any = {}

        for (const attr of attrs) {

            let { COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH, COLUMN_KEY } = attr

            schema[COLUMN_NAME] = null

            if (DATA_TYPE === 'varchar') {

                schema[COLUMN_NAME] = joi.string().trim()

                if (CHARACTER_MAXIMUM_LENGTH) {
                    schema[COLUMN_NAME] = schema[COLUMN_NAME].max(CHARACTER_MAXIMUM_LENGTH)
                }

            } else if (DATA_TYPE === 'int') {

                schema[COLUMN_NAME] = joi.number()

            } else if (DATA_TYPE === 'datetime') {

                schema[COLUMN_NAME] = joi.date()
            }

            if (COLUMN_DEFAULT) {

                if (COLUMN_DEFAULT != 'CURRENT_TIMESTAMP')
                    schema[COLUMN_NAME] = schema[COLUMN_NAME].default(COLUMN_DEFAULT)
            }

            if (IS_NULLABLE === 'NO') {

                if (COLUMN_KEY !== 'PRI' && COLUMN_DEFAULT === null)
                    schema[COLUMN_NAME] = schema[COLUMN_NAME].required()
            }
        }

        return joi.object(schema)
    }

    static check(schema: any, data: any) {

        let setting =
        {
            abortEarly: false,
            convert: true,
            allowUnknown: true,
            stripUnknown: true,
            skipFunctions: true
        }

        let { error, value } = schema.validate(data, setting)

        if (error) {
            for (const { message } of error.details) {
                console.warn('[ Error ]', message)
            }
        }

        return { error, value }
    }
}