import { generateResponse } from '../Distribution'
console.info('generateing signature');
// @ts-ignore
const address: string = process.argv.slice(2)[0]

( async ()=>{
    const res = await generateResponse(address)
    console.info('done', res)

})()
