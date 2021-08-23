/*
活动地址：
京东APP -> 我的 -> 客户服务 -> 价格保护
https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu

脚本地址：
https://raw.githubusercontent.com/gaoyaoku/JavaScript/master/priceProtect.js

获取jd_tokens:
Quantumult X
[rewrite_local]
https:\/\/api\.m.jd.com\/api\?appid=siteppM&functionId=siteppM_priceskusPull url script-request-body https://raw.githubusercontent.com/gaoyaoku/JavaScript/master/priceProtectToken.js

*/

const $ = new Env('京东价格保护');

const notify = $.isNode() ? require('./notify').sendNotify : '';
const cookies = $.isNode() ? require("./cookie").cookies : cookies = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);

const unifiedGatewayName = 'https://api.m.jd.com';
//多个jd_tokens以@分隔
let tokens = 'kegkwneig9z4omv4u2x1629549758213jgm0~NmZeSyVEbFNSd3V0cVVUBXp3DwhlRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsafwU5HEwdZWEYQwtub35rGmcHbhRUJ3N+fVgICix9AA5oXzRBWyQmeyFQDAF9fAVZZBNjAz9jaxFmCB5fEWYNZHMSJAQGHWVhGEMFQTkYFQINRDsCCjUiPTRMC19jLlMWMgk7LUFtG280DzEQdxgVFyMDJQVMMTUkJwQdQCI0X1c/A3kBESgkKBQTAmIlGBUUDUQmBT9jfRFmCRlGPTcNZHNKClMTKBtvfj1PA39oBBRlSmdJT3Frfn09T09vaBVdNQIlFkF7ZT8qGAcQYWZUS3NcdBMUKCg8MQ0aUCUmBkA7X2YBASI9PitQWVU6cU1dYgsgFAgwfm9oQw4Qd2ZCTDceMh9aMSQuNwoUVngtD00hV2BDWnR0f3xWWQp0dAAKJhx0XUElNCNmW09BPiZFSzsRYlNPYy4+ZltPA29oFVI4BXRLQXh+dH1DEA==|~1629549776397~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ==~2~269~5pl0|5d1x3-97,lk,,;bd2q-98,lk,8q,l;doei:,1,0,0,0,0,1000,-1000,1000,-1000;dmei:,1,0,0,1000,-1000,1000,-1000,1000,-1000;emc:,d:1;emmm:;emcf:,d:1;ivli:,0:0;iivl:,0:0;ivcvj:;scvje:;ewhi:,0:0-0;1629549773801,1629549776397,1,0,2,2,0,1,0,0,0;d7yo';

if ($.isNode()) {
    if (process.env.JD_TOKENS) {
        tokens = process.env.JD_TOKENS
    }
} else {
    tokens = $.getdata('jd_tokens') || tokens
}
$.tokenList = tokens.split('@')

!(async () => {
    if (!$.tokenList[0]) {
        await message($.name,'','请先获取JD_TOKENS!');
        return ;
    }
    for (let i = 0; i < cookies.length; i++) {
        if (cookies[i]) {
            $.cookie = cookies[i];
            $.index = i + 1;
            //若match到，返回[1]；若match不到，返回null。不加 match(/pt_pin=(.+?);/) && 时，若匹配不到会报错。
            $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1]);
            $.isLogin = true;
            $.nickName = '';

            await cookieStatus();
            if (!$.isLogin) {
                await message($.name, `京东账号${$.index}: ${$.nickName || $.UserName}cookie已失效，请重新获取！`);
                continue ;
            }

            console.log(`京东账号${$.index}: ${$.nickName || $.UserName}，开始！`);
            $.refundTotalAmount = 0
            $.token = $.tokenList.length > i ? $.tokenList[i] : ($.token || '')
            $.feSt = $.token ? 's' : 'f'

            $.applied = false
            await onceApply()
            if ($.applied) {
                await checkOnceAppliedResult();
            }
            await message($.name, '',`京东账号${$.index}: ${$.nickName || $.UserName} 本次价格保护金额：${$.refundTotalAmount}💰`);
        }
    }
})()
    .catch((e) => {
        console.log(`${$.name} 错误！\n${e}`)
    })
    .finally(() => $.done())

//检查cookie是否失效
function cookieStatus() {
    const options = {
        "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
        "headers": {
            "Accept": "application/json,text/plain, */*",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Cookie": $.cookie,
            "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
            "User-Agent": "jdapp;iPhone;10.1.0;15.0;8cc12b238b42f7b45184eea19d59315fd59f9f7f;network/wifi;JDEbook/openapp.jdreader;model/iPhone12,1;addressid/2350567446;appBuild/167774;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
        },
        "timeout": 10000,
    }
    return new Promise(resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} cookieStatus检查cookie状态时请求失败！`);
                    console.log(`${JSON.stringify(err)}`);
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === 13) {
                            $.isLogin = false;
                            return ;
                        }
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName
                        }
                    } else {
                        console.log(`cookieStatus检查cookie状态时,京东服务器返回了空数据！`);
                    }
                }
            } catch (e) {
                console.log(`${$.name} cookieStatus检查cookie状态时发生错误！`);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
//一键申请价格保护
function onceApply() {
    let body = {
        sid: '',
        type: '3',
        forcebot: '',
        token: $.token,
        feSt: $.feSt
    };
    let options = taskUrl('siteppM_skuOnceApply', body);
    
    return new Promise((resolve, reject) => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${arguments.callee.name.toString()} onceApply请求失败!\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data)
                    if (data.flag) {
                        $.applied = true
                    } else {
                        console.log(`onceApply一键价格保护失败!\n失败原因：${data.responseMessage}`)
                    }
                }
            } catch (e) {
                reject(`${arguments.callee.name.toString()} onceApply返回结果解析时出错!\n${e}\n${JSON.stringify(data)}`)
            } finally {
                resolve()
            }
        })
    })
}
//检查申请结果
function checkOnceAppliedResult() {
    let body = {
        sid: '',
        type: '3',
        forcebot: '',
        num: 15
    }
    let options = taskUrl('siteppM_appliedSuccAmount', body);
    
    return new Promise((resolve, reject) => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${arguments.callee.name.toString()} checkOnceAppliedResult请求失败!\n${JSON.stringify(err)}`);
                } else {
                    data = JSON.parse(data);
                    if (data.flag) {
                        $.refundTotalAmount = data.succAmount;
                    } else {
                        console.log(`checkOnceAppliedResult一键价格保护结果：${JSON.stringify(data)}`);
                    }
                }
            } catch (e) {
                reject(`${arguments.callee.name.toString()} checkOnceAppliedResult返回结果解析时出错!\n${e}\n${JSON.stringify(data)}`);
            } finally {
                resolve();
            }
        })
    })
}
//任务url
function taskUrl(functionId, body) {
    const url = `${unifiedGatewayName}/api?appid=siteppM&functionId=${functionId}&forcebot=&t=${new Date().getTime()}`;
    return {
        "url": url,
        "headers": {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Connection": "keep-alive",
            "Content-Length": "1180",
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": $.cookie,
            "Host": "api.m.jd.com",
            "Origin": "https://msitepp-fm.jd.com",
            "Referer": "https://msitepp-fm.jd.com/",
            "User-Agent": "jdapp;iPhone;10.1.0;15.0;8cc12b238b42f7b45184eea19d59315fd59f9f7f;network/wifi;JDEbook/openapp.jdreader;model/iPhone12,1;addressid/2350567446;appBuild/167774;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
        },
        "body": body ? `body=${encodeURIComponent(JSON.stringify(body))}` : undefined
    }
}
//整合通知
async function message(title, subTitle, description, options) {
    $.msg(title, subTitle, description, options);
    if($.isNode()){
        await notify(title, description);
    }
}

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', 'ios解析cookie时错误！')
            return [];
        }
    }
}

function Env(name, opts) {

    class Http {
        constructor(env) {
            this.env = env
        }

        send(opts, method = 'GET') {
            opts = typeof opts === 'string' ? { url: opts } : opts
            let sender = this.get
            if (method === 'POST') {
                sender = this.post
            }
            return new Promise((resolve, reject) => {
                sender.call(this, opts, (err, resp, body) => {
                    if (err) reject(err)
                    else resolve(resp)
                })
            })
        }

        get(opts) {
            return this.send.call(this.env, opts)
        }

        post(opts) {
            return this.send.call(this.env, opts, 'POST')
        }
    }

    return new (class {
        constructor(name, opts) {
            this.name = name
            this.http = new Http(this)
            this.data = null
            this.dataFile = 'box.dat'
            this.logs = []
            this.isMute = false
            this.isNeedRewrite = false
            this.logSeparator = '\n'
            this.encoding = 'utf-8'
            this.startTime = new Date().getTime()
            Object.assign(this, opts)
            this.log('', `🔔${this.name}, 开始!`)
        }

        isNode() {
            return 'undefined' !== typeof module && !!module.exports
        }

        isQuanX() {
            return 'undefined' !== typeof $task
        }

        isSurge() {
            return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
        }

        isLoon() {
            return 'undefined' !== typeof $loon
        }

        isShadowrocket() {
            return 'undefined' !== typeof $rocket
        }

        toObj(str, defaultValue = null) {
            try {
                return JSON.parse(str)
            } catch {
                return defaultValue
            }
        }

        toStr(obj, defaultValue = null) {
            try {
                return JSON.stringify(obj)
            } catch {
                return defaultValue
            }
        }

        getjson(key, defaultValue) {
            let json = defaultValue
            const val = this.getdata(key)
            if (val) {
                try {
                    json = JSON.parse(this.getdata(key))
                } catch { }
            }
            return json
        }

        setjson(val, key) {
            try {
                return this.setdata(JSON.stringify(val), key)
            } catch {
                return false
            }
        }

        getScript(url) {
            return new Promise((resolve) => {
                this.get({ url }, (err, resp, body) => resolve(body))
            })
        }

        runScript(script, runOpts) {
            return new Promise((resolve) => {
                let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
                httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
                let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout')
                httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
                httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
                const [key, addr] = httpapi.split('@')
                const opts = {
                    url: `http://${addr}/v1/scripting/evaluate`,
                    body: { script_text: script, mock_type: 'cron', timeout: httpapi_timeout },
                    headers: { 'X-Key': key, 'Accept': '*/*' }
                }
                this.post(opts, (err, resp, body) => resolve(body))
            }).catch((e) => this.logErr(e))
        }

        loaddata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                if (isCurDirDataFile || isRootDirDataFile) {
                    const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
                    try {
                        return JSON.parse(this.fs.readFileSync(datPath))
                    } catch (e) {
                        return {}
                    }
                } else return {}
            } else return {}
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                const jsondata = JSON.stringify(this.data)
                if (isCurDirDataFile) {
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                } else if (isRootDirDataFile) {
                    this.fs.writeFileSync(rootDirDataFilePath, jsondata)
                } else {
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                }
            }
        }

        lodash_get(source, path, defaultValue = undefined) {
            const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
            let result = source
            for (const p of paths) {
                result = Object(result)[p]
                if (result === undefined) {
                    return defaultValue
                }
            }
            return result
        }

        lodash_set(obj, path, value) {
            if (Object(obj) !== obj) return obj
            if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
            path
                .slice(0, -1)
                .reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
                path[path.length - 1]
                ] = value
            return obj
        }

        getdata(key) {
            let val = this.getval(key)
            // 如果以 @
            if (/^@/.test(key)) {
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objval = objkey ? this.getval(objkey) : ''
                if (objval) {
                    try {
                        const objedval = JSON.parse(objval)
                        val = objedval ? this.lodash_get(objedval, paths, '') : val
                    } catch (e) {
                        val = ''
                    }
                }
            }
            return val
        }

        setdata(val, key) {
            let issuc = false
            if (/^@/.test(key)) {
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objdat = this.getval(objkey)
                const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
                try {
                    const objedval = JSON.parse(objval)
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                } catch (e) {
                    const objedval = {}
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                }
            } else {
                issuc = this.setval(val, key)
            }
            return issuc
        }

        getval(key) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.read(key)
            } else if (this.isQuanX()) {
                return $prefs.valueForKey(key)
            } else if (this.isNode()) {
                this.data = this.loaddata()
                return this.data[key]
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        setval(val, key) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.write(val, key)
            } else if (this.isQuanX()) {
                return $prefs.setValueForKey(val, key)
            } else if (this.isNode()) {
                this.data = this.loaddata()
                this.data[key] = val
                this.writedata()
                return true
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        initGotEnv(opts) {
            this.got = this.got ? this.got : require('got')
            this.cktough = this.cktough ? this.cktough : require('tough-cookie')
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
            if (opts) {
                opts.headers = opts.headers ? opts.headers : {}
                if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
                    opts.cookieJar = this.ckjar
                }
            }
        }

        get(opts, callback = () => { }) {
            if (opts.headers) {
                delete opts.headers['Content-Type']
                delete opts.headers['Content-Length']
            }
            if (this.isSurge() || this.isLoon()) {
                if (this.isSurge() && this.isNeedRewrite) {
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
                }
                $httpClient.get(opts, (err, resp, body) => {
                    if (!err && resp) {
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if (this.isQuanX()) {
                if (this.isNeedRewrite) {
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, { hints: false })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const { statusCode: status, statusCode, headers, body } = resp
                        callback(null, { status, statusCode, headers, body }, body)
                    },
                    (err) => callback(err)
                )
            } else if (this.isNode()) {
                let iconv = require('iconv-lite')
                this.initGotEnv(opts)
                this.got(opts)
                    .on('redirect', (resp, nextOpts) => {
                        try {
                            if (resp.headers['set-cookie']) {
                                const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
                                if (ck) {
                                    this.ckjar.setCookieSync(ck, null)
                                }
                                nextOpts.cookieJar = this.ckjar
                            }
                        } catch (e) {
                            this.logErr(e)
                        }
                        // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
                    })
                    .then(
                        (resp) => {
                            const { statusCode: status, statusCode, headers, rawBody } = resp
                            callback(null, { status, statusCode, headers, rawBody }, iconv.decode(rawBody, this.encoding))
                        },
                        (err) => {
                            const { message: error, response: resp } = err
                            callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
                        }
                    )
            }
        }

        post(opts, callback = () => { }) {
            const method = opts.method ? opts.method.toLocaleLowerCase() : 'post'
            // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
            if (opts.body && opts.headers && !opts.headers['Content-Type']) {
                opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
            if (opts.headers) delete opts.headers['Content-Length']
            if (this.isSurge() || this.isLoon()) {
                if (this.isSurge() && this.isNeedRewrite) {
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
                }
                $httpClient[method](opts, (err, resp, body) => {
                    if (!err && resp) {
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if (this.isQuanX()) {
                opts.method = method
                if (this.isNeedRewrite) {
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, { hints: false })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const { statusCode: status, statusCode, headers, body } = resp
                        callback(null, { status, statusCode, headers, body }, body)
                    },
                    (err) => callback(err)
                )
            } else if (this.isNode()) {
                let iconv = require('iconv-lite')
                this.initGotEnv(opts)
                const { url, ..._opts } = opts
                this.got[method](url, _opts).then(
                    (resp) => {
                        const { statusCode: status, statusCode, headers, rawBody } = resp
                        callback(null, { status, statusCode, headers, rawBody }, iconv.decode(rawBody, this.encoding))
                    },
                    (err) => {
                        const { message: error, response: resp } = err
                        callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
                    }
                )
            }
        }
        /**
         *
         * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
         *    :$.time('yyyyMMddHHmmssS')
         *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
         *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
         * @param {string} fmt 格式化参数
         * @param {number} 可选: 根据指定时间戳返回格式化日期
         *
         */
        time(fmt, ts = null) {
            const date = ts ? new Date(ts) : new Date()
            let o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'H+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds(),
                'q+': Math.floor((date.getMonth() + 3) / 3),
                'S': date.getMilliseconds()
            }
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
            for (let k in o)
                if (new RegExp('(' + k + ')').test(fmt))
                    fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
            return fmt
        }

        /**
         * 系统通知
         *
         * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
         *
         * 示例:
         * $.msg(title, subt, desc, 'twitter://')
         * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         *
         * @param {*} title 标题
         * @param {*} subt 副标题
         * @param {*} desc 通知详情
         * @param {*} opts 通知参数
         *
         */
        msg(title = name, subt = '', desc = '', opts) {
            const toEnvOpts = (rawopts) => {
                if (!rawopts) return rawopts
                if (typeof rawopts === 'string') {
                    if (this.isLoon()) return rawopts
                    else if (this.isQuanX()) return { 'open-url': rawopts }
                    else if (this.isSurge()) return { url: rawopts }
                    else return undefined
                } else if (typeof rawopts === 'object') {
                    if (this.isLoon()) {
                        let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
                        let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
                        return { openUrl, mediaUrl }
                    } else if (this.isQuanX()) {
                        let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
                        let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
                        return { 'open-url': openUrl, 'media-url': mediaUrl }
                    } else if (this.isSurge()) {
                        let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
                        return { url: openUrl }
                    }
                } else {
                    return undefined
                }
            }
            if (!this.isMute) {
                if (this.isSurge() || this.isLoon()) {
                    $notification.post(title, subt, desc, toEnvOpts(opts))
                } else if (this.isQuanX()) {
                    $notify(title, subt, desc, toEnvOpts(opts))
                }
            }
            if (!this.isMuteLog) {
                let logs = ['', `📣${this.name}, 通知!`]
                logs.push('---')
                logs.push(title)
                subt ? logs.push(subt) : ''
                desc ? logs.push(desc) : ''
                logs.push('---')
                console.log(logs.join('\n'))
                this.logs = this.logs.concat(logs)
            }
        }

        log(...logs) {
            if (logs.length > 0) {
                this.logs = [...this.logs, ...logs]
            }
            console.log(logs.join(this.logSeparator))
        }

        logErr(err, msg) {
            const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
            if (!isPrintSack) {
                this.log('', `⚠️${this.name}, 错误!`, err)
            } else {
                this.log('', `⚠️${this.name}, 错误!`, err.stack)
            }
        }

        wait(time) {
            return new Promise((resolve) => setTimeout(resolve, time))
        }

        done(val = {}) {
            const endTime = new Date().getTime()
            const costTime = (endTime - this.startTime) / 1000
            this.log('', `🔔${this.name}, 结束!`)
            this.log('', `⏱${this.name}, ${costTime} 秒!`)
            if (this.isSurge() || this.isQuanX() || this.isLoon()) {
                $done(val)
            }
        }
    })(name, opts)
}
