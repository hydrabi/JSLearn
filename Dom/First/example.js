// alert("about 5'10\" tall");
//数组
// var betales = Array()
// betales[0] = "john"
// betales[1] = "paul"
// betales[2] = "George"

// var betales = Array("1", "2", "3")
// var years = [1, 2, 3, 4]
// alert(betales)
// alert(years)

//关联数组
// var lennon = Array();
// lennon["name"] = "john";
// lennon["year"] = 1940;
// lennon["living"] = false;

//对象
var lennon = Object();
lennon.name = "john";
lennon.year = 1940;
lennon.living = false;

lennon = { name: "john", year: 1940, living: false }

//直接通过.赋值
var beatles = {};
beatles.vocalist = lennon;

//字符串拼接
// var message = "I am feeling" + "happy"

//通过变量拼接
var mood = "happy"
var message = "I am feeling" + mood

//字符串和数值拼接在一起 结果是一个更长的字符串
// alert("10" + 20)
// alert(10 + 20)

//全等操作符 不仅比较值 而且会比较变量的类型
// var a = false
// var b = "";
// if (a === b) {
//     alert("a equals b")
// } else {
//     alert("a not equals b")
// }

//严格不相等 就用使用!==

//while循环
var count = 1
while (count < 11) {
    alert(count)
    count++
}