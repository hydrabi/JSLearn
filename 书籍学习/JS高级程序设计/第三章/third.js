// Undefined
var massage;
//未定义 undefined
console.log("值未初始化时 " + massage);

//产生错误 Uncaught ReferenceError: age is not defined
// console.log("值未定义时" + age);

//未初始化 typeof undefined
console.log(typeof massage);
//未声明 typeof 也是 undefined
console.log(typeof age);


// Null
// null 代表空对象指针 
var car = null;
//typeof 类型为 object
console.log(typeof car);

//判断对象是否为空
if (car != null) {
    console.log("car判断对象是否为空 不为空")
} else {
    console.log("ccar判断对象是否为空  为空")
}

//undefined 派生自null
console.log(`undefined 是否等于null ${null == undefined}`);
// 如果用全等 则答案不为true
console.log(`undefined 是否全等于null ${null === undefined}`);


// Bollean

//true 和 false 区分大小写

//转换为Boolean值 Boolean();
var message = "hello world!";
var messageAsBoolean = Boolean(message);

//各种类型值为false的情况
console.log(`字符串""时为${Boolean("")}`)
console.log(`数字为0或者NaN时为${Boolean(0)} ${Boolean(NaN)}`);
console.log(`对象为null时${Boolean(null)}`);
console.log(`变量为undefined时${Boolean(undefined)}`);

//Number
var floatNum = 3.125e2;
console.log(`科学计数法${floatNum}`);
console.log(`科学计数法极小数${3e-7}`);

//5e-324 最小数
console.log(`最小数${Number.MIN_VALUE}`);
//1.7976931348623157e+308 最大数
console.log(`最大数${Number.MAX_VALUE}`);
let max = Number.MAX_VALUE + Number.MAX_VALUE;
//判断是否能参与计算
console.log(`${max}是否是有穷的${isFinite(max)}`);

//NaN 本来要返回数值的操作数未返回数值