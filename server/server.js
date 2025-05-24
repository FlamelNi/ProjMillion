
const express = require('express');
var axios = require('axios');
var url = require('url');
var fs = require('fs');
const cors = require('cors');
const fsPromises = fs.promises;
const { prototype } = require('module');

const app = express();
app.use(cors());
app.use(express.json()); // Required for parsing JSON
app.use(express.urlencoded({ extended: true })); // Supports form-encoded data

const PORT = process.env.PORT || 8080;

// app.listen(8080, function () {
app.listen(secret.port, function () {
    load_all();
    console.log(`server started at port ${secret.port}`);
});


