const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const geojsonFilePath = './draw-geojson.json';
// Come from https://sig.biel-bienne.ch/datastore/E331_Baumkataster-Cadastre_des_arbres/e331_baumkataster.json to avoid cors errors
const bielTreesGeojsonFilePath = './biel-trees.json';

const server = http.createServer((req, res) => {
    console.log(req.method, req.url);
    if (req.method === 'OPTIONS') {
        setCors(res);
        res.end();
        return;
    }
    if (req.url.split('/')[1] === 'getbieltrees' && req.method === 'GET') {
        returnGeojson(req, res, bielTreesGeojsonFilePath);
        return;
    }
    if (req.url.split('/')[1] === 'setdraw' && req.method === 'POST') {
        setDraw(req, res);
        return;
    }
    if (req.url.split('/')[1] === 'getdraw' && req.method === 'GET') {
        returnGeojson(req, res, geojsonFilePath);
        return;
    }
    console.error('no match');
    res.statusCode = 404;
    res.end();
});

const setDraw = (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        if (!body) {
            console.error('Empty post (draw)');
            returnTextResponse(res, 404, 'Empty draw POST');
            return;
        }
        const fd = fs.openSync(geojsonFilePath, "w+");
        fs.writeSync(fd, body, 0, 'utf-8');
        returnTextResponse(res, 200, 'Draw updated');
    });
}

const returnGeojson = (req, res, filename) => {
    const geojson = fs.readFileSync(filename, {encoding: 'utf-8'});
    res.statusCode = 200;
    setCors(res);
    res.setHeader('Content-Type', 'application/json');
    res.end(geojson);
}

const returnTextResponse = (res, code, text) => {
    res.statusCode = code;
    setCors(res);
    res.setHeader('Content-Type', 'plain/text');
    res.end(text);
}

const setCors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
}

const run = () => {
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}

run();
