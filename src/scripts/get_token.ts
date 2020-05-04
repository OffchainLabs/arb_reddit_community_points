import request from "request"
import env from "../constants";

const credentials = `${env.consumerKey}:${env.consumerSecret}`;
const credentialsBase64Encoded =  Buffer.from(credentials).toString('base64');

request({
    url: 'https://api.twitter.com/oauth2/token',
    method:'POST',
    headers: {
      'Authorization': `Basic ${credentialsBase64Encoded}`,
      'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: 'grant_type=client_credentials'
}, function(err, resp, body) {
  if (err){
    console.warn('token retrieval error', err);
    return
  }
  console.info(body); // the bearer token ...
});
