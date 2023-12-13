"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const connectionDB = new pg_1.Pool({
    user: "postgres",
    host: "localhost",
    database: "sabiduria1",
    password: "1234",
    port: 5432,
});
connectionDB.connect();
exports.default = connectionDB;
