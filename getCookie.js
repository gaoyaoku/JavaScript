/*

^https:\/\/(api\.m|me-api)\.jd\.com\/(client\.action\?functionId=signBean|user_new\/info\/GetJDUserInfoUnion\?) url script-request-header getCookie.js

hostname = me-api.jd.com, api.m.jd.com

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
$done()