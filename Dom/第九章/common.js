// window.onload = function() {
//     var para = document.getElementById("example")
//     para.style.color = "red"
//     para.style.font = "2em 'Times',serif"
// }

function addloadEvent(func) {
    var onload = window.onload
    if (typeof window.onload != 'function') {
        window.onload = func
    } else {
        window.onload = function() {
            onload()
            func()
        }
    }
}

function getNextElement(node) {
    if (node.nodeType == 1) {
        return node
    }

    if (node.nextSibling) {
        return getNextElement(node.nextSibling)
    }

    return null;
}

function addClass(element, value) {
    if (!element.className) {
        element.className = value
    } else {
        var newclassName = element.className
        newclassName += " ";
        newclassName += value
        element.className = newclassName
    }
}

function styleElementSiblings(tag, theclass) {
    if (!document.getElementsByTagName) return false
    var elems = document.getElementsByTagName(tag)
    var elem;

    for (var i = 0; i < elems.length; i++) {
        elem = getNextElement(elems[i].nextSibling);
        addClass(elem, theclass)
    }
}

function scriptTables() {
    if (!document.getElementsByTagName) return false;
    var tables = document.getElementsByTagName("table")
    var rows;
    for (var i = 0; i < tables.length; i++) {
        rows = tables[i].getElementsByTagName("tr")
        for (var j = 0; j < rows.length; j++) {
            if (j % 2 == 0) {
                rows[j].style.backgroundColor = "#ffc"
            }
        }
    }
}

function higlighRows() {
    if (!document.getElementsByTagName) return false
    var rows = document.getElementsByTagName("tr")
    for (var i = 0; i < rows.length; i++) {
        //鼠标在其上悬浮时触发的事件
        rows[i].onmouseover = function() {
            this.style.fontWeight = "bold"
        }

        rows[i].onmouseout = function() {
            this.style.fontWeight = "normal"
        }
    }
}



addloadEvent(styleElementSiblings("h1", "intro"))
addloadEvent(scriptTables)
addloadEvent(higlighRows)