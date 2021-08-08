# Dynamic Object DataBase (dodb)
DODB es un ORM de Node.js basado en promesas para MySQL, sin necesidad de definir un modelo previo como se realiza en Sequelize.

Dispone de un administrado de validación de atributos, tanto si esta definido en la base de datos como la tipologia del dato.

# IMPORTATE!!! Está en desarrollo

## Uso básico
Para recuperar todos los objectos de la base de datos, la función de dodb se ejecuta como una promesa.

```Javascript
import dodb from 'dodb'

(async ()=>{

    let { user } = await dodb()

    let params =
    {
        name:'Sergio',
        surname:'González'
        email:'sgonzalez@jscode.es'
    }
    
    // Añadir un usuario
    let data = await user.add(params)

})()

// OR

dodb().then(async({user})=>
{   
    let params =
    {
        name:'Sergio',
        surname:'González'
        email:'sgonzalez@jscode.es'
    }
    
    // Añadir un usuario
    let data = await user.add(params)

})
```

## Métodos de los modelos
|                |Método                          |Ejemplo                         |
|----------------|-------------------------------|-----------------------------|
|Añadir|`[tabla].add(<object>)`            |`user.add({name:'Sergio'})`           |
|Recuperar datos          |`[tabla].get(<object>)`        |`user.get({limit:5})`          |
|Recuperar datos por ID          | `[tabla].getByID(id <int/string>, pk <string> = 'id')`| `user.getByID(2,'user_id')`|
|Actualizar          | `[tabla].update(<object>)`| `user.update({user_id:1, name:'Jessica'})`|
|Eliminar          | `[tabla].remove(id <int/string/object>, pk <string> = 'id')`| `user.remove(2,'user_id')`|
|Recuperar atriburtos de la tabla          | `[tabla].getAttrs()`| `user.getAttrs()`|
|Recuperar nombre de la tabla          | `[tabla].getAttrs()`| `user.getAttrs()`|
|Recuperar nombre del schema de la tabla          | `[tabla].getSchema()`| `user.getSchema()`|
|Recuperar claves primarias | `[tabla].getPrimaryKey()`| `user.getPrimaryKey()`|

## Métodos futuros
|                |Método                          |Ejemplo                         |
|----------------|-------------------------------|-----------------------------|
|Añadir sino existe|`[tabla].addIsNoTExist(<object>)`            |`user.addIsNoTExist({name:'Sergio'})`           |
|Recuperar datos          |`[tabla].get(<object>)`        |`user.get({limit:5})`          |
|Recuperar datos por ID          | `[tabla].getByID(id <int/string>, pk <string> = 'id')`| `user.getByID(2,'user_id')`|
|Actualizar          | `[tabla].update(<object>)`| `user.update({user_id:1, name:'Jessica'})`|
|Eliminar          | `[tabla].remove(id <int/string/object>, pk <string> = 'id')`| `user.remove(2,'user_id')`|