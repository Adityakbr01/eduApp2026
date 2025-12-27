import NodeCache from "node-cache";

const cache = new NodeCache({
    stdTTL: 60,          // default TTL = 60 sec
    checkperiod: 120,    // cleanup interval
    useClones: false,    // performance boost
});

export default cache;
