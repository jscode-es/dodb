import dodb from '../index'

test.skip("Module dodb Object", async () => {

    let data = await dodb()

    expect(typeof data).toBe('object')
});

test.skip("Get user by id", async () => {

    let { user } = await dodb()
    let { result, errors } = await user.getById(11)

    expect(errors).toBe(false)
});

test.skip("Get user by other params", async () => {

    let { user } = await dodb()

    let like = {
        name: '%Se%'
    }

    let { result, errors } = await user.get({ like })

    expect(errors).toBe(false)
});

test.skip("Inserta datos", async () => {

    let { user } = await dodb()

    let params = {
        name: 'Jessica',
        surname: 'Amer',
        alias: 'jamer',
        email: 'jamer@jscode.es',
        pass: '*****',
        order: 'PA'
    }

    let { errors } = await user.add(params)

    expect(errors).toBe(false)
});

test.skip("Update datos by params", async () => {

    let { user } = await dodb()

    let find =
    {
        name: 'Jessica'
    }

    let params = {
        name: 'Sergio',
        surname: 'Gonzalez',
        alias: 'sgonzalez',
        email: 'sgonzalez@jscode.es',
        pass: '************'
    }

    let { result, errors } = await user.update(find, params)

    console.log(result)

    expect(errors).toBe(false)
});

test.skip("Get primary keys", async () => {

    let { user } = await dodb()

    let data = await user.getPrimaryKey()

    console.log(data)

    expect(data).toBe(false)
});


test.skip("Get attribute", async () => {

    let { user } = await dodb()

    let data = await user.getAttrs()

    console.log(data)

    expect(Array.isArray(data)).toBe(true)
});

test.skip("Remove data", async () => {

    let { user } = await dodb()

    let { result, errors } = await user.remove(11)

    console.log({ result, errors })

    expect(errors).toBe(false)
});