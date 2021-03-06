var http = require('http');
var https = require('https');
var fs = require('fs');
var os = require('os');
var path = require('path');

exports.remove = function (filename) {
    return new Promise((resolve, reject) => {
        fs.exists(path.join(os.homedir(), 'files', filename), function (exists) {
            if (exists) {
                fs.unlink(path.join(os.homedir(), 'files', filename));
                resolve();
            } else {
                resolve();
            }
        });
    });
};
exports.download = function (url, dest) {
    var file = fs.createWriteStream(path.join(os.homedir(), 'files', filename));
    console.log("Downloading: " + url);
    return new Promise((resolve, reject) => {
        var responseSent = false; // flag to make sure that response is sent only once.
        var proto = http;
        if (url.indexOf("https") != -1) {
            proto = https;
        }
        proto.get(url, response => {
            response.pipe(file);
            file.on('finish', () =>
                file.close(() => {
                    if (responseSent) return;
                    responseSent = true;
                    resolve();
                }));
        }).on('error', err => {
            if (responseSent) return;
            responseSent = true;
            reject(err);
        });
    });
};
