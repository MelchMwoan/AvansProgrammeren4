const mysql = require('mysql2');
const config = require('../../config.json');
const logger = require('tracer').colorConsole();

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
pool.on('connection', function (connection) {
    logger.debug(`Connected to database '${connection.config.database}'`);
});

pool.on('acquire', function (connection) {
    logger.debug('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
    logger.debug('Connection %d released', connection.threadId);
});

module.exports = pool;