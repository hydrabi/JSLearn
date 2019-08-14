function displayAbbreviations() {
    var abbreviations = document.getElementsByTagName("abbr")
    var defs = new Array()
    if (abbreviations.length < 1) return false
    for (var i = 0; i < abbreviations.length; i++) {
        var current_abbr = abbreviations[i]
        var definition = current_abbr.getAttribute("title")
            //不能用firstChild 因为可能嵌套在其他的元素里
            //获取文本
        var key = current_abbr.lastChild.nodeValue
        defs[key] = definition
    }
}