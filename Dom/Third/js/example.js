// alert(typeof document.getElementById("purchases"))
// alert(document.getElementsByTagName("li").length)
// console.log(document.getElementById("purchases"))
// console.log(document.getElementsByTagName("li"))

// var array = document.getElementsByTagName("li")
// for (var i = 0; i < array.length; i++) {
//     alert(typeof array[i])
// }

var shopping = document.getElementById("purchases")
var items = shopping.getElementsByTagName("*")
console.log("pruchases 里面的元素个数" + items.length)

//根据类名返回包含元素的数组 
console.log("类名为important sale的元素数量为 " + document.getElementsByClassName("sale").length)

//适用于新老浏览器的getElementsByClassName
function getElementsByClassName(node, classname) {
    if (node.getElementsByClassName) {
        return node.getElementsByClassName(classname)
    } else {
        var results = new Array()
        var elems = node.getElementsByTagName("*")
        for (var i = 0; i < elems.length; i++) {
            if (elems[i].classname.indexOf(classname) != -1) {
                results[results.length] = elems[i]
            }
        }
        return results
    }
}

//getAttribute 通过元素节点对象调用获取元素的属性
//null “没有值”
var paras = document.getElementsByTagName("p")
for (var i = 0; i < paras.length; i++) {
    var title = paras[i].getAttribute("title")
        // if (title != null) {
        //     console.log(title)
        // }

    //等价于上面
    if (title) {
        console.log(title)
    }

}

//setAttribute 对属性节点的值作出修改
function setAttributeSample() {
    var shopping = document.getElementById("purchases")
    console.log(shopping.getAttribute("title"))
    shopping.setAttribute("title", "a list of goods")
    console.log(shopping.getAttribute("title"))
}

setAttributeSample()