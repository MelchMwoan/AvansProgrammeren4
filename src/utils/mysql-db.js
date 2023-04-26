const mysql = require('mysql2');
const config = require('../../config.json');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || config.mysql_host,
    user: process.env.MYSQL_USER || config.mysql_user,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || config.mysql_database,
    port: process.env.MYSQL_PORT || config.mysql_port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

module.exports = pool;