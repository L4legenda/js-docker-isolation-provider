import express from 'express';
import { generateApolloClient } from "@deep-foundation/hasura/client.js";
import { DeepClient, parseJwt } from "@deep-foundation/deeplinks/imports/client.js";
import { gql } from '@apollo/client/index.js';
import memoize from 'lodash/memoize.js';
import http from 'http';
// import { parseStream, parseFile } from 'music-metadata';
import { createRequire } from 'node:module';
import bodyParser from 'body-parser';
import { ExpressPeerServer } from 'peer';

const require = createRequire(import.meta.url);


const app = express();

const GQL_URN = process.env.GQL_URN || 'localhost:3006/gql';
const GQL_SSL = process.env.GQL_SSL || 0;

const toJSON = (data) => JSON.stringify(data, Object.getOwnPropertyNames(data), 2);



const makeDeepClient = (token: string) => {
  if (!token) throw new Error('No token provided');
  const decoded = parseJwt(token);
  const linkId = decoded?.userId;
  const apolloClient = generateApolloClient({
    path: GQL_URN,
    ssl: !!+GQL_SSL,
    token,
  });
  const deepClient = new DeepClient({ apolloClient, linkId, token }) as any;
  deepClient.import = async (path: string) => {
    let module;
    try {
      module = require(path)
    } catch (e) {
      if (e.code === 'ERR_REQUIRE_ESM') {
        module = await import(path)
      } else {
        throw e;
      }
    }
    return module;
  };
  return deepClient;
}

const requireWrapper = (id: string) => {
  // if (id === 'music-metadata') {
  //   return { parseStream, parseFile };
  // }
  return require(id);
}

const serverListen = app.listen(process.env.PORT);
const options: any = { debug: true }
const peerServer = ExpressPeerServer(serverListen, options);

app.use('/peerjs', peerServer);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.get('/healthz', (req, res) => {
  res.json({});
});
app.post('/init', (req, res) => {
  res.json({});
});


http.createServer({ maxHeaderSize: 10*1024*1024*1024 }, app)


console.log(`Listening ${process.env.PORT} port`);