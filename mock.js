/**
 * Created by Administrator on 2017/3/13.
 */
var Mock = require('mockjs'),
    config = require('./config.json');

//node.js的写法
exports.data = function(){
    var arr = [];
    config.mock.forEach(function(value){
        var object = {
            route:value.route,
            handle:function (req,res,next) {
                //req   请求头
                //res   响应的数据
                // res请求头是模拟的后台数据返回告诉浏览器返回数据头，没有头的话数据出不来的
                res.writeHead(value.head.code,value.head.header);
                var Random = Mock.Random;
                value.random.forEach(function(item){
                    Random[item]();
                })
                var data = Mock.mock(value.data);
                res.write(JSON.stringify(data));
                res.end();//有开头有结尾不然数据依然无返回
            }
        }
        arr.push(object);
    })
    return arr;
};