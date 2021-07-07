const { createServer, createController } = require('ipfsd-ctl')
const ipfsHttpModule = require('ipfs-http-client');
const ipfsBin = require.resolve('ipfs/src/cli.js');

const getDataNode = async (port) => {
  const server = createServer({
    host: '127.0.0.1',
    port
    } , {
    ipfsHttpModule,
    ipfsBin,
    type: 'js',
    ipfsOptions: {
      config: {
        API: {
          HTTPHeaders: {
            "Access-Control-Allow-Origin": [
              "*"
            ],
            "Access-Control-Allow-Methods": ["PUT", "POST", "GET", "DELETE"],
            "Access-Control-Allow-Credentials": true,
          }
        }
      }
    }
  })

  await server.start()

  console.log(server);

  const ipfsd = await createController({
    ipfsHttpModule,
    remote: true,
    type: 'js',
    endpoint: `http://127.0.0.1:${port}`
  })
  //console.log(ipfsd);
  return ipfsd.api
};

getDataNode(5001).then(fs => {
  //console.log(fs);
})