
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
var path = require('path');
const { Hash } = require('crypto');
const crypto = require('crypto');

const secret = require("../secret.json");

const ERROR_CODES = {
    EIL: "[INLINE]",
    ESQL: "Error: api call with symbols"
}

const save_dir = path.join(__dirname, 'save');
if (!fs.existsSync(save_dir)) {
    fs.mkdirSync(save_dir);
}

class GXBackupLog {
    date = "";
    is_success = true;
    error_message = "";
    constructor(date, is_success, error_message) {
        this.date = date;
        this.is_success = is_success;
        this.error_message = error_message;
    }
}

class Site {
    name = "";
    logs = [];
}

let all_sites = {};

function save_all() {
    const filePath = path.join(save_dir, 'test-log.txt');

    // Convert `all_sites` to JSON before saving
    console.log("write");
    fs.writeFile(filePath, JSON.stringify(all_sites, null, 2), (err) => {
        console.log(err);
        if (err) {
            console.log("err");
            return false;
            // return res.status(500).json({ error: "Failed to create log file" });
        }
        console.log("no err");
        return true;
        // res.json({ message: "Log file saved successfully", path: filePath });
    });
}

function load_all() {
    const filePath = path.join(save_dir, 'test-log.txt');

    if (!fs.existsSync(filePath)) {
        console.log("⚠ No log file found. Initializing an empty all_sites dictionary.");
        all_sites = {}; // Initialize as an empty object
        return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("❌ Failed to read log file:", err);
            return;
        }

        try {
            all_sites = JSON.parse(data);
            console.log("✅ Log file loaded successfully:", all_sites);
        } catch (parseError) {
            console.error("❌ Error parsing log file:", parseError);
            all_sites = {}; // Reset to empty object on error
        }
    });
}

function add_site(site_name) {
    if (!all_sites[site_name]) {
        all_sites[site_name] = { name: site_name, logs: [] };
        console.log(`✅ New site added: ${site_name}`);
        save_all();
    } else {
        console.log(`🔹 Site ${site_name} already exists.`);
    }
}

function add_log_to_site(site_name, is_success, error_message) {
    if (!all_sites[site_name]) {
        add_site(site_name);
    }
    all_sites[site_name].logs.push(new GXBackupLog("date", is_success, error_message));
}

// app.get('/test_save', function (req, res) {
//     save_all();
// });


app.get('/db/q/images/:slideshow_element_id', function (req, res) {
    const helper = () => {
        var slideshow_element_id = req.params.slideshow_element_id;

        try {
            con.query(`SELECT img_id FROM slideshow_elements WHERE id = ?`, [slideshow_element_id], function (err, result) {
                if (result.length != 1) {
                    res.send("No query was found");
                    return;
                }
                var img_id = result[0].img_id;
                con.query(`SELECT img FROM images WHERE id = ?`, [img_id], function (err, result) {
                    if (result.length != 1) {
                        res.send("No query was found");
                        return;
                    }

                    var blob_t = new Blob([result[0]], { type: "octet/stream" });
                    blob_t.slice(0, 3).arrayBuffer().then((result) => {
                    });

                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                    res.send(result[0]);
                });

            });

        } catch (err) {
            console.log(err);
            res.send("err");
        }
    }

    LoginLogic.check_query_credential(con, req.query).then((result) => {
        if (result.result) {
            helper();
        } else {
            res.send([]);
        }

    });
});

app.get('/site', function (req, res) {
    res.send(all_sites.keys());
    //req.query access request's params
    console.log(Object.keys(req.query));
    console.log(req.query.test);
});

app.get('/db/test', function (req, res) {
    res.send("Hello World!, I am server created by expresss");
    //req.query access request's params
    console.log(Object.keys(req.query));
    console.log(req.query.test);
});
app.post('/db/test', function (req, res) {
    res.send("Hello World!, I am server created by expresss (post)");
    console.log(req.body);
    console.log(req.params);
    console.log(Object.keys(req));
})

const users = {
    // admin: "password123",
    // user1: "securepass"
    git: "GXupload925"
};
app.post('/upload', function (req, res) {
    // const { username, password, site, is_success, error_message } = req.body;
    let username = req.body.username;
    let password = req.body.password;
    let site = req.body.site;
    let is_success = req.body.is_success;
    let error_message = req.body.error_message;

    console.log(req.body);

    // Authenticate user
    if (!users[username] || users[username] !== password) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    console.log(`Data received from ${username}:`);
    console.log(`site: ${site}`);
    console.log(`is_success: ${is_success}`);
    console.log(`error_message: ${error_message}`);


    // all_sites.push()
    add_log_to_site(site, is_success, error_message);
    save_all();

    res.json({ message: "Upload successful!" });
});


app.post('/db/login', function (req, res) {
    // console.log(req.body);
    let username = req.body.username;
    let pass_hash = req.body.pass_hash;
    let temp_key = req.body.temp_key;

    if (username == undefined || pass_hash == undefined) {
        if (temp_key == undefined) {
            res.send(false);
            return;
        }

        LoginLogic.check_temp_keys(con, temp_key).then((result) => {
            res.send(result);
        });
        return;
    }

    LoginLogic.check_credential(con, username, pass_hash).then((result) => {
        is_verified = result[0];
        user_id = result[1];

        if (is_verified) {
            LoginLogic.get_temp_keys(con, user_id).then((temp_key) => {
                // res.send("Login success");
                res.send(temp_key);
            });
        } else {
            res.send(false);
        }
    });
});

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
}

function hash(s) {
    return sha256(s + "some salt and pepper");
}


// app.listen(8080, function () {
app.listen(secret.port, function () {
    load_all();
    console.log(`server started at port ${secret.port}`);
});


