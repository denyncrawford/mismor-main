//import Room  from 'ipfs-pubsub-room';
import IPFS from 'ipfs'
import { join }  from 'path';
import { homedir } from 'os';

const ipfs = await IPFS.create({
  init: true,
  start: true,
  repo: join(homedir(), '/.jsipfs2'),
  relay: {
    enabled: true,
    hop: {
      enabled: true,
      active: true
    }
  },
  config: {
    Routing: {
      Type: 'dht'
    },
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
        "/ip4/0.0.0.0/tcp/4005",
        "/ip4/192.168.0.4/tcp/4006/ws",
      ],
      Gateway: "/ip4/192.168.0.4/tcp/8082", 
      API: "/ip4/192.168.0.4/tcp/5003" 
    },
    Discovery: {
      MDNS: {
        Enabled: true,
        Interval: 10
      }
    }
  }
})
//const room = new Room(ipfs, 'room-name')

await ipfs.pubsub.subscribe('denyncrawford:notification', ({ data }) => {
  console.log(data.toString());
});