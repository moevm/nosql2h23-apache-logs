#!/usr/bin/env node
const { nextTick } = require("process");

const express = require("express");
const cors = require('cors');
// const fileUpload = require('express-fileupload');
const bp = require('body-parser');
// const https = require('https');
const http = require('http');
// const fs = require('fs');
const util = require("util");

// let logFile = fs.createWriteStream('express.log', { flags: 'a' });
// let logStdout = process.stdout;

// console.log = function () {
//     logFile.write('[' + (new Date()).toLocaleString() + '] ' + util.format.apply(null, arguments) + '\n');
//     logStdout.write('[' + (new Date()).toLocaleString() + '] ' + util.format.apply(null, arguments) + '\n');
// }
// console.error = console.log;

let currentDate = (new Date()).toLocaleString();
console.log(`\n[\x1b[2m${currentDate}\x1b[0m] \x1b[36mStarting backend...\x1b[0m`);

let app = express();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

function validateUser(username, password) {
    const ultraSecureUsername = 'admin';
    const ultraSecurePassword = 'admin123';
    return (ultraSecureUsername === username) && (ultraSecurePassword === password);
}

// API

app.get('/check', (req, res) => {
    res.json('Me be expressin...');
})

app.post('/auth', (req, res) => {
    console.log('POST: /auth | username: ' + req.body.username + '; password: ' + req.body.password);
    res.json(validateUser(req.body.username, req.body.password));
});

app.post('/query', (req, res) => {
    const measurement = req.body.measurement;
    const start = req.body.start;
    const stop = req.body.stop;
    console.log(`POST: /query | measurement: ${measurement}; start: ${start}; stop: ${stop}`);
    // if (!validateUser(req.body.username, req.body.password))
    //     res.json('auth failed, wrong password');
    // else {
    if (measurement == 'access') {
        // FOR ACCESS ONLY
        const bod = `import "join"
    
        left = from(bucket: "apache_bucket")
        |> range(start: ${start}, stop: ${stop})
        |> filter(fn: (r) => r["_measurement"] == "access" and r["_field"] == "resp_time")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> keep(columns: ["_time", "resp_time"])
        |> group(columns: ["_time"])
        
        right = from(bucket: "apache_bucket")
        |> range(start: ${start}, stop: ${stop})
        |> filter(fn: (r) => r["_measurement"] == "access" and r["_field"] == "agent")
        |> group(columns: ["_time"])
        
        join.right(
            left: left,
            right: right,
            on: (l, r) => l._time == r._time,
            as: (l, r) => ({r with resp_time: l.resp_time}),
        )
        |> group()
        |> drop(columns: ["_field", "_measurement", "_start", "_stop"])`

        fetch('http://influxdb:8086/api/v2/query?org=apache_org', {
            method: 'POST',
            headers: {
                'Authorization': 'Token apache_token',
                'Accept': 'application/csv',
                'Content-type': 'application/vnd.flux'
            },
            body: bod
        }).then((queryResult) => {
            queryResult.text().then((data) => {
                data = data.replace(/(,result,table,+|,_result,\d+,)/gm, '');
                data = data.replace('_time', 'time');
                data = data.replace('_value', 'agent');
                data = data.replace(/^\s*$/gm, '');
                console.log(data)
                res.json({ query: data });
            })
        })
            .catch((e) => {
                console.warn(e);
            });
    }
    else if (measurement == 'error') {
        // FOR ACCESS ONLY
        const bod = `from(bucket: "apache_bucket")
        |> range(start: ${start}, stop:${stop})
        |> filter(fn: (r) => r["_measurement"] == "error")
        |> map(fn: (r) => ({r with clientport: if exists r.clientport then r. clientport else "-", client: if exists r.client then r. client else "-"}))
        |> group()
        |> drop(columns: ["_field", "_measurement", "_start", "_stop"])`

        fetch('http://influxdb:8086/api/v2/query?org=apache_org', {
            method: 'POST',
            headers: {
                'Authorization': 'Token apache_token',
                'Accept': 'application/csv',
                'Content-type': 'application/vnd.flux'
            },
            body: bod
        }).then((queryResult) => {
            queryResult.text().then((data) => {
                data = data.replace(/(,result,table,+|,_result,\d+,)/gm, '');
                data = data.replace('_time', 'time');
                data = data.replace('_value', 'message');
                data = data.replace(/_time,_value,errorcode,level,module,path,pid,tid/gm, '');
                data = data.replace(/^\s*$/gm, '');
                console.log(data.slice(0, 100))
                res.json({ query: data });
            })
        })
            .catch((e) => {
                console.warn(e);
            });
    }

    // }

})

// app.post("/export", (req, res) => {
//     console.log('POST: /export | username: ' + req.body.username + '; password: ' + req.body.password);
//     if (!validateUser(req.body.username, req.body.password))
//         res.json('auth failed, wrong password');
//     else {
//         const measurement = req.body.measurement;
//         const start = req.body.start; // '2023-12-20T17:28:50Z'
//         const stop = req.body.stop; // '2023-12-20T17:28:50Z'
//         const bod = 'from(bucket:"apache_bucket")\n        |> range(start: ' + start + ', stop: ' + stop + ')'
//         console.log(bod)
//         fetch('http://influxdb:8086/api/v2/query?org=apache_org', {
//             method: 'POST',
//             headers: {
//                 'Authorization': 'Token apache_token',
//                 // 'Accept': 'application/csv',
//                 'Content-type': 'application/vnd.flux'
//             },
//             body: bod
//         }).then((queryResult) => {
//             queryResult.text().then((data) => {
//                 // console.log('data', data)
//                 res.json(data);
//             })
//         })
//             .catch((e) => {
//                 console.warn(e);
//                 // res.json(e);
//             });
//     }
// })

// app.post("/import", (req, res, next) => {
//     console.log('POST: /import | username: ' + req.body.username + '; password: ' + req.body.password);
//     if (!validateUser(req.body.username, req.body.password))
//         res.json('auth failed, wrong password');
//     else {
//         res.json('nice auth');
//     }
// })

const httpServer = http.createServer(app);
httpServer.listen(4000);

console.log(`[\x1b[2m${(new Date()).toLocaleString()}\x1b[0m] \x1b[36mServer is running.\x1b[0m`);