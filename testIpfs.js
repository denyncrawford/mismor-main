const { createController } = require('ipfsd-ctl')
const { join } = require('path')
const ipfsHttpModule = require('ipfs-http-client');
const homedir = require('os').homedir();
const ipfsBin = require.resolve('ipfs/src/cli.js');

const getDataNode = async () => {
  const ipfsd = await createController({
    ipfsHttpModule,
    ipfsBin,
    remote: false,
    type: 'js',
    ipfsOptions: {
      init: true,
      start: true,
      repo: join(homedir, '/.jsipfs'),
      config: {
        API: {
          HTTPHeaders: {
            "Access-Control-Allow-Origin": [
              "*"
            ],
            "Access-Control-Allow-Methods": ["PUT", "POST", "GET", "DELETE"],
            "Access-Control-Allow-Credentials": true,
          }
        },
        Addresses: { 
          Swarm: [
            "/ip4/0.0.0.0/tcp/4002",
            "/ip4/127.0.0.1/tcp/4003/ws"
          ],
          Gateway: "/ip4/127.0.0.1/tcp/8080", 
          API: "/ip4/127.0.0.1/tcp/5001" 
        }
      }
    },
    disposable: false
  });
  await ipfsd.init()
  await ipfsd.start()
  console.log(ipfsd);
  process.on('SIGINT', async (evt) => {
    await ipfsd.api.stop()
  });
  return ipfsd.api
}

const main = async () => {
  await getDataNode();
}

main()