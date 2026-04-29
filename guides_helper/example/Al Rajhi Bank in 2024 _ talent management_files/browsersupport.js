// Check if the browser is Internet Explorer
function isIE() {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE '); // IE 10 or older
    const trident = ua.indexOf('Trident/'); // IE 11

    return (msie > 0 || trident > 0);
}

// Check if the browser is outdated or unsupported
function isOutdatedBrowser() {
    return isIE();
}

// Usage
if(isOutdatedBrowser()){
    document.querySelector(".browser-check-message").classList.add("show")
    console.log("Your browser is outdated or unsupported. Please consider updating for better performance and security.");
}