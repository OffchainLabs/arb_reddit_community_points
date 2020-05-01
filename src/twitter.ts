import Twitter from "twitter"

import env from "./constants";

const client = new Twitter({
    consumer_key: env.consumerKey,
    consumer_secret: env.consumerSecret,
    access_token_key: env.accessTokenKey,
    access_token_secret: env.accessTokenSecret
});


export const startStream = (cb)=>{
    const stream = client.stream('statuses/filter', {track: '@OffchainLabs'});
    stream.on('data', cb);
}

export const reply = (text: string, tweet: any) => {
    client.post('status/update',{
        status:`${tweet.user.screen_name} text`,
        in_reply_status_id: tweet.id_str
    })
}
