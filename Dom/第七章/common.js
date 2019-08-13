function showPic(whichPic) {
    if (!document.getElementById("placeholder")) {
        return false
    }



    var source = whichPic.href
    var placeholder = document.getElementById("placeholder")

    //nodeName总是返回一个大写字母的值
    if (placeholder.nodeName != "IMG") {
        return false
    }

    placeholder.src = source

    if (document.getElementById("description")) {
        var text = whichPic.getAttribute("title") ? whichPic.getAttribute("title") : ""
        var destription = document.getElementById("description")
            // destription.firstChild.nodeValue = getTextNode(whichPic)

        //判断是不是文本节点
        if (destription.firstChild.nodeType == 3) {
            destription.firstChild.nodeValue = text
        }

    }

    return true
}

//childNodes 用来获取任何一个元素的所有子元素
function countBodyChildren() {
    var body_element = document.getElementsByTagName("body")[0]
        // 获取body元素里面子元素数组的长度
    console.log("body子元素的个数为" + body_element.childNodes.length)
        //nodeType 判断节点的类型
        //元素节点 nodeType 1
        //属性节点 nodeType 2
        //文本节点 nodeType 3 换行符算是一个文本节点
        // console.log(body_element.nodeType)
    for (var i = 0; i < body_element.childNodes.length; i++) {
        console.log("子元素的类型" + body_element.childNodes[i].nodeType)
        getTextNode(body_element.childNodes[i])
    }

}

// nodeValue获得一个节点的值
// firstChild 访问子元素数组的第一个元素
// lastChild 访问子元素数组的最后个元素
function getTextNode(element) {
    var childs = element.childNodes
    for (var i = 0; i < childs.length; i++) {
        var child = childs[i]
        if (child.nodeType === 3) {
            console.log("文本属性为" + child.nodeValue)
            return child.nodeValue
        }
    }

}

function prepareGallery() {
    if (!document.getElementsByTagName) {
        return false;
    }

    if (!document.getElementById) {
        return false;
    }

    if (!document.getElementById("imagegallery")) {
        return false;
    }

    var gallery = document.getElementById("imagegallery")
    var links = gallery.getElementsByTagName("a")
    for (var i = 0; i < links.length; i++) {
        //鼠标点击事件
        links[i].onclick = function() {
                return !showPic(this);
            }
            //键盘按钮点击事件
            // links[i].onkeypress = links[i].onclick
    }
}

//页面加载完成时调用countBodyChildren
// window.onload = function() {
//     countBodyChildren()
//     prepareGallery()
// }

function preparePlaceholder() {

    if (!document.createElement) return false;
    if (!document.createTextNode) return false;
    if (!document.getElementById) return false;
    if (!document.getElementById("imagegallery")) return false;

    var placeholder = document.createElement("img")
    placeholder.setAttribute("id", "placeholder")
    placeholder.setAttribute("src", "images/placeholder.png")
    placeholder.setAttribute("alt", "my image gallery")

    var description = document.createElement("p")
    description.setAttribute("id", "description")
    var desctext = document.createTextNode("choose an image")
    description.appendChild(desctext)

    //直接添加在body里面的最后部分
    // document.body.appendChild(placeholder)
    // document.body.appendChild(description)

    var gallery = document.getElementById("imagegallery")
        // gallery.parentNode.insertBefore(placeholder, gallery)
        // gallery.parentNode.insertBefore(description, gallery)

    insertAfter(placeholder, gallery)
    insertAfter(description, placeholder)

}

//没有提供insertAfter这个方法 自己写
function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode
    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement)
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling)
    }
}

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

addloadEvent(countBodyChildren)
addloadEvent(prepareGallery)
addloadEvent(preparePlaceholder)