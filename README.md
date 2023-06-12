# sito-node-mysql

sito-node-mysql

# Functions

_Using [mysql2](https://www.npmjs.com/package/mysql2)_

## insert (table: string, attributes: string[], values: object)

```
    const { insert } = require("sito-node-mysql");

    /* ⚠ If you pass 'id' will override uuid id auto generated ⚠ */
    const result = insert("users", ["id", "user", "name"], { user: "sito8943", name: "Sito" })

    // sql => INSERT INTO users(id, name) VALUES('<uuid>', 'Sito');

```

## update (table: string, attributes: string[], values: object, where: any)

```
    const { update } = require("sito-node-mysql");

    const result = update("users", ["name"], { name: "SitoNumbis" }, { attribute: "user", operator: "=", value: "sito8943" })

    // sql => UPDATE users SET name='SitoNumbis' WHERE user='sito8943';

```

## select (table: string, attributes: string[], where: any, start, end, count)

```
    const { select } = require("sito-node-mysql");

    const result = select("users", ["name"], { attribute: "user", operator: "=", value: "sito8943" })

    // sql => SELECT name FROM users WHERE user='sito8943';

```

## deleteDocuments (table: string, where: any)

```
    const { deleteDocuments } = require("sito-node-mysql");

    const result = deleteDocuments("users", { attribute: "user", operator: "=", value: "sito8943" })

    // sql => DELETE FROM users WHERE user='sito8943';

```
