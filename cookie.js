let cookies = []

if (process.env.JD_COOKIE) {
    if (process.env.JD_COOKIE.indexOf('&') > -1) {
        cookies = process.env.JD_COOKIE.split('&');
    } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
        cookies = process.env.JD_COOKIE.split('\n');
    } else {
        cookies = [process.env.JD_COOKIE];
    }
}

cookies = cookies.map(cookie => cookie.trim());

module.exports = {
    cookies
}
