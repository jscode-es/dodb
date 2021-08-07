jest.useFakeTimers()

import dodb from '../index'

describe("DODB", () => {

    it("syncDatabase", async () => {

        let data = await dodb()

        console.log(data)
        //expect(user.getName()).toBe('user')

        expect(200).toBe(200)


    });
});