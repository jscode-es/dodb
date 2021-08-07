import Build from './core/build'

(async () => {

    let { category } = await Build.syncDatabase()

    let insert =
    {
        //id:1,
        name: 'java',
    }
 
    let data = await category.add(insert)
    //let data = await category.get(2)
    //let data = await category.update(insert)
    //let data = await category.remove(1) 

    console.log(data)

})()

export default async () => await Build.syncDatabase()