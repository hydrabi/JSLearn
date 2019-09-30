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