function insertParagraph(text) {
    var str = "<p>"
    str += text
    str += "<p>"
        //写入html文档
    document.write(str)
}

// insertParagraph("This is inserted")

// window.onload = function() {
//     var testdiv = document.getElementById("testdiv")

//     // console.log(testdiv.innerHTML)
//     //直接插入一段HTML内容
//     // testdiv.innerHTML = "<p>I inserted <em>this</em> content</p>"

//     //创建一个新的元素 createElement
//     var para = document.createElement("p")
//         // var info = "nodeName:"
//         // info += para.nodeName
//         // info += " nodeType "
//         // info += para.nodeType
//         // alert(info)

//     //创建文本节点createTextNode
//     var txt = document.createTextNode("hello world")
//     para.appendChild(txt)
//         //添加一个子节点 appendChild
//     testdiv.appendChild(para)


// }

window.onload = function() {
    var testdiv = document.getElementById("testdiv")
    var para = document.createElement("p")
    testdiv.appendChild(para)

    var txt1 = document.createTextNode("This is ")
    para.appendChild(txt1)

    var emphasis = document.createElement("em")
    var txt2 = document.createTextNode("my")
    emphasis.appendChild(txt2)
    para.appendChild(emphasis)

    var txt3 = document.createTextNode(" content")
    para.appendChild(txt3)

}