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

function moveElement(elementId, final_x, final_y, interval) {
    if (!document.getElementById) return false
    if (!document.getElementById(elementId)) return false
    var elem = document.getElementById(elementId)
    var xpos = parseInt(elem.style.left)
    var ypos = parseInt(elem.style.top)

    if (xpos == final_x && ypos == final_y) {
        return true
    }

    if (xpos < final_x) {
        xpos++;
    }

    if (xpos > final_x) {
        xpos--;
    }

    if (ypos < final_y) {
        ypos++;
    }

    if (ypos > final_y) {
        ypos--;
    }

    elem.style.left = xpos + "px"
    elem.style.top = ypos + "px"
    var repeat = "moveElement('" + elementId + "'," + final_x + "," + final_y + "," + interval + ")"
    movement = setTimeout(repeat, interval)
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
    movement = setTimeout("moveMessage()", 1000)
}

function moveMessage() {
    if (!document.getElementById) return false
    if (!document.getElementById("message")) return false
    var elem = document.getElementById("message")
    var xpos = parseInt(elem.style.left)
    var ypos = parseInt(elem.style.top)

    if (xpos == 200 && ypos == 100) {
        return true
    }

    if (xpos < 200) {
        xpos++;
    }

    if (xpos > 200) {
        xpos--;
    }

    if (ypos < 100) {
        ypos++;
    }

    if (ypos > 100) {
        ypos--;
    }

    elem.style.left = xpos + "px"
    elem.style.top = ypos + "px"
    movement = setTimeout("moveMessage()", 10)
}

addloadEvent(positionMessage)