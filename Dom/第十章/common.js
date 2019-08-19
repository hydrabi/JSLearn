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

function positionMessage() {
    if (!document.getElementById) return false
    if (!document.getElementById("message")) return false
    var elem = document.getElementById("message")
    elem.style.position = "absolute"
    elem.style.left = "50px"
    elem.style.top = "100px"
    movement = setTimeout("moveMessage()", 5000)
}

function moveMessage() {
    if (!document.getElementById) return false
    if (!document.getElementById("message")) return false
    var elem = document.getElementById("message")
    elem.style.left = "200px"
}

addloadEvent(positionMessage)