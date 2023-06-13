// @ts-check

const { connection } = require("./connection");
const { v4 } = require("uuid");

/**
 *
 * @param {any} array
 * @param {string[]} attributes
 */
const arrayToSQL = (array, attributes) => {
  let string = "";
  attributes.forEach((attribute, i) => {
    if (array[attribute])
      string += `${
        typeof array[attribute] === "string"
          ? `'${array[attribute]}'`
          : array[attribute]
      }`;
    if (i < attributes.length - 1) string += ",";
  });
  return string;
};

/**
 *
 * @param {any} array
 * @param {string[]} attributes
 */
const arrayToUPDATE = (array, attributes) => {
  let string = "";
  attributes.forEach((attribute, i) => {
    if (array[attribute])
      string += `${attribute} = ${
        typeof array[attribute] === "string"
          ? `'${array[attribute]}'`
          : array[attribute]
      }`;
    if (i < attributes.length - 1) string += ",";
  });
  return string;
};

/**
 * @param {any} where
 */
const prepareWhere = (where) => {
  try {
    if (where.length) {
      let string = "WHERE";
      where.forEach(
        (
          /** @type {{ attribute: any; operator: any; value: any; value1: any; logic: any; }} */ cond,
          /** @type {number} */ i
        ) => {
          const { attribute, operator, value, value1, logic } = cond;
          switch (operator) {
            case "BETWEEN":
              return `${i !== 0 ? logic : ""} BETWEEN ${value} AND ${value1}`;
            case "IN":
              return `${
                i !== 0 ? logic : ""
              } ${attribute} IN (${value.toString()})`;
            default:
              string = `${i !== 0 ? logic : ""} ${attribute} ${operator} ${
                typeof value === "string" ? `'${value}'` : value
              }`;
              break;
          }
        }
      );
    } else if (where.attribute && where.operator && where.value) {
      const { attribute, operator, value, value1 } = where;
      switch (operator) {
        case "BETWEEN":
          return `WHERE ${attribute} BETWEEN ${value} AND ${value1}`;
        case "IN":
          return `WHERE ${attribute} IN (${value.toString()})`;
        default:
          return `WHERE ${attribute} ${operator} ${
            typeof value === "string" ? `'${value}'` : value
          }`;
      }
    }
  } catch (err) {
    console.error(err);
  }
  return "";
};

/**
 *
 * @param {number} start
 * @param {number} end
 * @param {number} count
 */
const preparePagination = (start, end, count) => {
  if (start || count) {
    if (start && end) return `${start},${end}`;
    else if (start && !end) return `${start},18446744073709551615`;
    if (!start && !end) return `${count}`;
  }
  return "";
};

/**
 *
 * @param {string} table
 * @param {string[]} attributes
 * @param {object} values
 * @returns
 */
const insert = async (table, attributes, values) => {
  const id = v4();
  const connectionA = connection.db;
  await connectionA?.execute(
    `INSERT INTO ${table}(${attributes.toString()}) VALUES(${arrayToSQL(
      { id, ...values },
      attributes
    )})`
  );
  return id;
};

/**
 *
 * @param {string} table
 * @param {string[]} attributes
 * @param {object} values
 * @param {any} where
 * @returns
 */
const update = async (table, attributes, values, where) => {
  const connectionA = connection.db;
  const result = await connectionA?.execute(
    `UPDATE  ${table} SET ${arrayToUPDATE(values, attributes)} ${prepareWhere(
      where
    )}`
  );
  return result;
};

/**
 *
 * @param {string} table
 * @param {string[]} attributes
 * @param {any} where
 * @param {number} count
 * @param {number} start
 * @param {number} end
 */
const select = async (
  table,
  attributes,
  where,
  start = 0,
  end = 0,
  count = 0
) => {
  const connectionA = connection.db;
  const [rows] = await connectionA?.execute(
    `SELECT ${
      attributes ? attributes.toString() : "*"
    } FROM ${table} ${prepareWhere(where)} ${preparePagination(
      start,
      end,
      count
    )}`
  );
  return { rows };
};

/**
 *
 * @param {string} table
 * @param {any} where
 */
const deleteDocuments = async (table, where) => {
  const connectionA = connection.db;
  const result = await connectionA?.execute(
    `DELETE FROM ${table} ${prepareWhere(where)}`
  );
  return result;
};

module.exports = {
  insert,
  select,
  update,
  deleteDocuments,
};
