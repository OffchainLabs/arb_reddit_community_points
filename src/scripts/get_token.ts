import request from "request"
import env from "../env_variables";

const credentials = `${env.consumerKey}:${env.consumerSecret}`;
const credentialsBase64Encoded =  Buffer.from(credentials).toString('base64');
console.warn("creds",credentialsBase64Encoded );

request({
    url: 'https://api.twitter.com/oauth2/token',
    method:'POST',
    headers: {
      'Authorization': `Basic ${credentialsBase64Encoded}`,
      'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: 'grant_type=client_credentials'
}, function(err, resp, body) {
  console.warn('err');
  
    console.log(body); // the bearer token ...
});

