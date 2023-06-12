// @ts-check

const mysql = require("mysql2/promise");

var db = undefined;

/**
 *
 * @param {any} config
 * @returns
 */
const createConnection = async (config) => {
  db = await mysql.createConnection({
    host: config.bdHost,
    user: config.bdUser,
    password: config.bdPassword,
    database: config.bdDatabase,
  });
};

module.exports = { createConnection, db };
