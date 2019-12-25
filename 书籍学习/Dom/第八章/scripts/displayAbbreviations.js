function displayAbbreviations() {

    if (!document.getElementsByTagName) return false
    if (!document.createElement) return false
    if (!document.createTextNode) return false

    //取得所有缩略词
    var abbreviations = document.getElementsByTagName("abbr")
    var defs = new Array()
    if (abbreviations.length < 1) return false

    //遍历 保存在数组
    for (var i = 0; i < abbreviations.length; i++) {
        var current_abbr = abbreviations[i]
        var definition = current_abbr.getAttribute("title")
            //不能用firstChild 因为可能嵌套在其他的元素里
            //获取文本
        var key = current_abbr.lastChild.nodeValue
        defs[key] = definition
    }

    //创建定义列表
    var dlist = document.createElement("dl")
    for (key in defs) {
        var definition = defs[key]
        var dttile = document.createElement("dt")
        var dtitle_text = document.createTextNode(key)
        dttile.appendChild(dtitle_text)

        var ddesc = document.createElement("dd")
        var ddesc_text = document.createTextNode(definition)
        ddesc.appendChild(ddesc_text)

        dlist.appendChild(dttile)
        dlist.appendChild(ddesc)
    }

    var header = document.createElement("h2")
    var header_text = document.createTextNode("Abbreviations")
    header.appendChild(header_text)
    document.body.appendChild(header)
    document.body.appendChild(dlist)
}

addloadEvent(displayAbbreviations)