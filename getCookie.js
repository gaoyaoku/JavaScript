/*

^https:\/\/api\.m\.jd\.com\/client\.action\?functionId=GetJDUserInfoUnion url script-request-header https://raw.githubusercontent.com/gaoyaoku/JavaScript/master/getCookie.js

hostname = api.m.jd.com

*/

if ($request.method != 'OPTIONS' && $request.headers) {
    const headersCookie = $request.headers['Cookie'] || ''
    const pt_key = headersCookie.match(/pt_key=.+?;/)[0]
    const pt_pin = headersCookie.match(/pt_pin=.+?;/)[0]
    if (pt_key && pt_pin) {
        const username = pt_pin.match(/pt_pin=(.+?);/)[1]
        console.log(`
获取cookie成功！
${decodeURIComponent(username)}
${pt_key + pt_pin}
`)
        $notify('获取cookie成功！', `${decodeURIComponent(username)}`, `${pt_key + pt_pin}`)

    } else {
        console.log(`获取cookie失败！
        ${$request.url}
        ${$request.headers}
        `)
        $notify('获取cookie失败！')
    }
}
$done({})