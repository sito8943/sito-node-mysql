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
    if (array[attribute] !== undefined)
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
    if (array[attribute] !== undefined)
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
 * @param {string} table
 * @param {any} where
 */
const prepareWhere = (table, where) => {
  try {
    if (where.length) {
      let string = "WHERE";
      let atLeastOne = false;
      where.forEach(
        (
          /** @type {{ attribute: string; operator: string; value: any; value1: any; logic: string; parenthesis: string }} */ cond,
          /** @type {number} */ i
        ) => {
          if (
            (cond.attribute !== undefined &&
              cond.operator !== undefined &&
              cond.value !== undefined) ||
            cond.parenthesis
          ) {
            atLeastOne = true;
            const { attribute, operator, value, value1, logic, parenthesis } =
              cond;
            if (logic) string += ` ${logic} `;
            if (parenthesis === "(") string += `${parenthesis} `;
            switch (operator) {
              case "BETWEEN":
                string += ` BETWEEN ${value} AND ${value1}`;
                break;
              case "IN":
                string += ` ${attribute} IN (${value.toString()})`;
                break;
              default:
                string += ` ${attribute} ${operator} ${
                  (typeof value === "string" &&
                    table.indexOf(value.split(".")[0]) < 0) ||
                  value.length === 0
                    ? `'${value}'`
                    : value
                }`;
                break;
            }
            if (parenthesis === ")") string += ` ${parenthesis} `;
          }
        }
      );
      if (atLeastOne) return string;
      return "";
    } else if (
      where.attribute !== undefined &&
      where.operator !== undefined &&
      where.value !== undefined
    ) {
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
 */
const preparePagination = (start, end) => {
  if (start >= 0) {
    if (end) return `LIMIT ${start},${end}`;
    else if (!end) return `LIMIT ${start},18446744073709551615`;
    if (start === -1 && end) return `LIMIT ${end}`;
  }
  return "";
};

/**
 *
 * @param {string[]} attributes
 */
const attributesToString = (attributes) => {
  let result = "";
  attributes.forEach((att, i) => {
    result += att;
    if (i < attributes.length - 1) result += ",";
  });
  return result;
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
    `INSERT INTO ${table}(${attributesToString(
      attributes
    )}) VALUES(${arrayToSQL({ id, ...values }, attributes)})`
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
      table,
      where
    )}`
  );
  return result;
};

/**
 *
 * @param {any} table
 * @param {string[]} attributes
 * @param {any} where
 * @param {number} start
 * @param {number} end
 */
const select = async (
  table,
  attributes = [],
  where = [],
  start = 0,
  end = 0,
  orderBy = ""
) => {
  const connectionA = connection.db;
  const [rows] = await connectionA?.execute(
    `SELECT ${
      attributes && attributes.length ? attributesToString(attributes) : "*"
    } FROM ${
      typeof table === "string" ? table : table.toString()
    } ${prepareWhere(table, where)} ${
      orderBy && orderBy.length ? `ORDER BY ${orderBy}` : ""
    } ${preparePagination(start, end)} `
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
    `DELETE FROM ${table} ${prepareWhere(table, where)}`
  );
  return result;
};

module.exports = {
  insert,
  select,
  update,
  deleteDocuments,
};
