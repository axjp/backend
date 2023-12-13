"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./database"));
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.listen(3000, () => console.log(`server on port ${3000}`));
