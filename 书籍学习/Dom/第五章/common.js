// 创建新的浏览器窗口
function popUp(url) {
    window.open(url, "popup", "width=320,height=480")
}

window.onload = function() {
    if (!document.getElementsByTagName) return false
    var links = document.getElementsByTagName("a")
    for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute("class") == "popUp") {
            links[i].onclick = function() {
                popUp(this.getAttribute("href"));
                return false;
            }
        }
    }
}