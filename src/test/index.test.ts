import dodb from '../index'

test.skip("Module dodb Object", async () => {

    let data = await dodb()

    expect(typeof data).toBe('object')
});

test.skip("Get user by id", async () => {

    let { user } = await dodb()
    let data = await user.getById(1)

    expect(typeof data).toBe('object')
});

test.skip("Get user by other params", async () => {

    let { user } = await dodb()

    let where = {
        name: 'Sergio'
    }

    let data = await user.get({ where })

    expect(typeof data).toBe('object')
});

test.skip("Inserta datos", async () => {

    let { user } = await dodb()

    let params = {
        name: 'Jessica',
        surname: 'Amer',
        alias: 'jamer',
        email: 'jamer@jscode.es',
        pass: '*****'
    }

    let data = await user.add(params)

    expect(typeof data).toBe('object')
});

test.skip("Update datos by params", async () => {

    let { user } = await dodb()

    let find =
    {
        name: 'Maria'
    }

    let params = {
        name: 'Jessica',
        surname: 'Amer',
        alias: 'jamer',
        email: 'jamer@jscode.es',
        pass: '************'
    }

    let data = await user.update(find, params)

    expect(typeof data).toBe('object')
});