import Twitter from "twitter"

import env from "./env_variables";

const client = new Twitter({
    consumer_key: env.consumerKey,
    consumer_secret: env.consumerSecret,
    access_token_key: env.accessTokenKey,
    access_token_secret: env.accessTokenSecret
});


const startStream = ()=>{
    const stream = client.stream('statuses/filter', {track: '@OffchainLabs'});
    stream.on('data', function(event) {
    console.log(event && event.text);
    });
}
export default startStream