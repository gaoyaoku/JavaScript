const axios = require('axios')

axios.defaults.baseURL = 'https://sc.jincwl.com/addons/zjhj_bd/web/index.php?_mall_id=2434&r=plugin';
axios.defaults.headers.common['User-Agent'] = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x18001234) NetType/WIFI Language/zh_CN";
axios.defaults.headers.common['X-App-Platform'] = "wxapp";

let tokens = []
if (process.env.FISH) {
    if (process.env.FISH.indexOf('&') > -1) {
        tokens = process.env.FISH.split('&');
    } else if (process.env.FISH.indexOf('\n') > -1) {
        tokens = process.env.FISH.split('\n');
    } else {
        tokens = [process.env.FISH];
    }
} else {
    console.log('Cannot find environment variable "FISH" which contains one or more tokens separated by "\n" or "&" !');
    process.exit()
}


(async () => {
    console.log('Running...');

    for (let i = 0; i < tokens.length; i++) {
        let randomInt = getRandomInt(600)
        console.log(`Wait ${randomInt}s to continue...`)
        await sleep(randomInt)
        axios.defaults.headers.common['X-Access-Token'] = tokens[i]
        const checkInData = await checkIn()
        console.log('User ' + tokens[i] + ':\n' + JSON.stringify(checkInData));
    }

    console.log('\nResult...');
    for (let i = 0; i < tokens.length; i++) {
        await sleep(getRandomInt(60))
        axios.defaults.headers.common['X-Access-Token'] = tokens[i]
        const checkInData = await checkIn()
        console.log('User ' + tokens[i] + ':\n' + JSON.stringify(checkInData));
    }
})().catch(err => {
    console.log(err)
})


function checkIn() {
    return new Promise((resolve, reject) => {
        axios.get('/check_in/api/index/sign-in&status=1&day=1')
            .then(res => resolve(res.data))
            .catch(err => reject(err))
    })
}

function sleep(second) {
    return new Promise(resolve => {
        setTimeout(resolve, second * 1000)
    })
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
