// import crypto from "crypto"
const crypto = require('crypto');

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

async function get_pass_hash(username, passcode) {

  return await hash(username + passcode + "server hash salt");
}

async function check_credential(con, username, passcode, login_key) {
  var pass_hash = await get_pass_hash(username, passcode);
  var is_verified = false;

  var promise = new Promise((resolve, reject) => {
    try {
      con.query(`SELECT * FROM users WHERE username=? AND passkey=?;`, [username, pass_hash], function (err, result) {
        is_verified = result.length > 0;
        var user_id = -1;
        if (is_verified) {
          user_id = result[0].id;
        }

        resolve([is_verified, user_id]);
      });
    } catch (err) {
      console.log(err);
      res.send("err");
      reject();
    }


  });

  return promise;
}

function get_current_timestamp() {
  return Math.floor(Date.now() / 1000);
}

async function get_temp_keys(con, user_id) {
  var temp_key = "";
  try {
    temp_key = await hash(`${user_id}${Date.now().toString()}`);
    await con.query(`UPDATE users SET temp_key=?, temp_key_date=? WHERE id = ?`, [temp_key, get_current_timestamp(), user_id], function (err, result) {
    });
  } catch (err) {
    return "";
  }
  return temp_key;
}

async function update_temp_key_duration(con, id) {
  con.query(`update users set temp_key_date = ? where id=?;`, [get_current_timestamp(), id], function (err, result) {
    if (err) { }
  });
}

async function check_temp_keys(con, temp_key) {
  var return_val = new Promise((resolve, reject) => {

    var current_timestamp = get_current_timestamp();

    con.query(`SELECT temp_key_date,id FROM users WHERE temp_key = ?`, [temp_key], function (err, result) {
      var data = null;
      if (err) {
        // reject(err);
      }
      if (result.length != 1) {
        // res.send("No query was found");
        // return_val = false;
        resolve({ result: false, user_id: -1 });
      } else {
        data = result[0];

        if (data['temp_key_date'] + (60 * 60) < current_timestamp) {
          // if (data['temp_key_date'] + (60) < current_timestamp) {
          // too old
          resolve({ result: false, user_id: -1 });
        } else {
          update_temp_key_duration(con, data.id);
          // con.query(`update users set temp_key_date = ? where id=?;`, [get_current_timestamp(), data.id], function (err, result) {
          //   if (err) { }
          // });
        }
      }
      resolve({ result: true, user_id: data == null ? -1 : data['id'] });
    });
  });

  return return_val;
}

async function check_admin(con, username, pass_hash, temp_key) {
  var prom = new Promise((resolve, reject) => {
    if (temp_key != undefined || temp_key != null) {
      check_admin_temp_key(con, temp_key).then((result) => {
        resolve(result);
      });
    } else if (username != undefined && username != null && pass_hash != undefined && pass_hash != null) {
      check_admin_pass_key(con, username, pass_hash).then((result) => {
        resolve(result);
      });
    }
  });
  return prom;
}


async function check_admin_pass_key(con, username, passcode) {
  var pass_hash = await get_pass_hash(username, passcode);
  var is_verified = false;

  var promise = new Promise((resolve, reject) => {
    try {
      con.query(`SELECT * FROM users WHERE username=? AND passkey=? AND is_admin=true;`, [username, pass_hash], function (err, result) {
        resolve(result.length > 0);
      });
    } catch (err) {
      console.log(err);
      res.send("err");
      reject();
    }


  });

  return promise;
}


async function check_admin_temp_key(con, temp_key) {
  var return_val = new Promise((resolve, reject) => {

    var current_timestamp = get_current_timestamp();

    con.query(`SELECT temp_key_date,id FROM users WHERE temp_key = ? AND is_admin=true`, [temp_key], function (err, result) {
      if (err) {
        // reject(err);
      }
      if (result.length != 1) {
        // res.send("No query was found");
        // return_val = false;
        resolve(false);
      } else {
        var data = result[0];

        if (data['temp_key_date'] + (60 * 60) < current_timestamp) {
          // if (data['temp_key_date'] + (60) < current_timestamp) {
          // too old
          resolve(false);
        } else {
          update_temp_key_duration(con, data.id);
          // con.query(`update users set temp_key_date = ? where id=?;`, [get_current_timestamp(), data.id], function (err, result) {
          //   if (err) { }
          // });
        }
      }
      resolve(true);
    });
  });

  return return_val;
}


//this just checks if user exists. must also check user owns the site

async function check_query_credential(con, params) {
  if (params.username != undefined && params.pass_hash != undefined) {
    if (false) {
      //if username and passcode match to yodeck player, then just grant access
      //
    }
  }

  return await check_req_credential(con, params);
}

async function check_req_credential(con, params) {
  var prom = new Promise((resolve, reject) => {
    if (params.temp_key != undefined) {
      check_temp_keys(con, params.temp_key).then((result) => {
        resolve({ result: result.result, user_id: result.user_id });
      });
    } else if (params.username != undefined && params.pass_hash != undefined) {
      check_credential(con, params.username, params.pass_hash).then((result) => {
        var is_verified = result[0];
        var user_id = result[1];
        resolve({ result: is_verified, user_id: user_id });
      });
    }
  });
  return prom;
}


module.exports = {
  hash,
  get_pass_hash,
  check_credential,
  get_temp_keys,
  check_temp_keys,
  check_query_credential,
  check_req_credential,
  check_admin,
};

