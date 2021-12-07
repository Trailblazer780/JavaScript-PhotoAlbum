class CookieManager {

    writeCookie(name, value, days) {
        // construct date object - will be today's date by default
        let date = new Date();
        // set time to be today plus how many days specified
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        // concatenate the expires name/value pair with expiry date converted to GMT 
        let expires = "expires=" + date.toGMTString();
        // assemble cookie
        document.cookie = name + "=" + value + ";" + expires + ";";
    }
    
    readCookie(name) {
        // return undefined if no cookie stored
        if (document.cookie === "") return undefined;
        // value to be returned is undefined by default
        let value;
        // put cookie name/value pairs into an array split on the ; delimiter (since there could be multiple cookies in the file)
        let cookieArray = document.cookie.split(";");
        // remove blank spaces from all elements of cookieArray
        cookieArray = cookieArray.map(cookie => cookie.trim());
        // find cookie with name and set value
        cookieArray.forEach(cookie => {
            if (cookie.split("=")[0] == name) {
                value = cookie.split("=")[1];
            }    
        });
        return value;
    }  
    
}

export {CookieManager};