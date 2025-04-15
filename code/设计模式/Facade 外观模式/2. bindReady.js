var obj = {
    bindReady: function () {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            window.addEventListener("load", jQuery.ready, false);
        } else if (document.attactEvent) {
            document.attactEvent("onreadystatechange", DOMContentLoaded);
            window.attactEvent("onload", jQuery.ready);
        }
    }
};