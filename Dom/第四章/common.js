function showPic(whichPic) {
    var source = whichPic.getAttribute("href")
    var placeholder = document.getElementById("placeholder")
    placeholder.setAttribute("src", source)
    var text = whichPic.getAttribute("title")
    var destription = document.getElementById("description")

    destription.firstChild.nodeValue = getTextNode(whichPic)
        // destription.firstChild.nodeValue = text
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

//页面加载时调用countBodyChildren
window.onload = countBodyChildren