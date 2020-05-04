import Twitter from "twitter"

import env from "./constants";

/* app only / bearer token AUTH doesn't support streaming, it seems, so we're sticking with
user-based auth here for now
*/
const client = new Twitter({
        consumer_key: env.consumerKey,
        consumer_secret: env.consumerSecret,
        access_token_key: env.accessTokenKey,
        access_token_secret: env.accessTokenSecret
    });


export const startStream = (cb)=>{
    const stream = client.stream('statuses/filter', {track: '@OffChainLabs'});
    stream.on('data', cb);
}

export const reply = (text: string, tweet: any) => {
    client.post('statuses/update',{
        status:`@${tweet.user.screen_name} ${text}`,
        in_reply_to_status_id: tweet.id_str
    }).then((data)=>{
        console.info('successfully replied!')
    }).catch((err)=>{
        console.warn('error replying to tweet', err);

    })
}
