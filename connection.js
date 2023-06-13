// @ts-check

const mysql = require("mysql2/promise");

class Database {
  constructor() {}

  /**
   *
   * @param {object} config
   */
  async init(config) {
    this.db = await mysql.createConnection({
      host: config.bdHost,
      user: config.bdUser,
      password: config.bdPassword,
      database: config.bdDatabase,
    });
  }
}

const connection = new Database();

module.exports = { connection };
