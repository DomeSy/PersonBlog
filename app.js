// swig模板
// 应用程序的启动(入口)文件

// 加载express模块
var express = require('express');
// 加载模板处理模块
var swig=require('swig');
// 加载数据块模块
var mongoose=require('mongoose');
// 加载body-parse，用来处理post提交过来的数据
var bodyParser=require('body-parser');
// 加载kooies模块
var cookies =require('cookies');
// 创建app应用  等同于 Nodejs Http.createServer()
var app=express();

var User=require('./models/User');

// 设置静态文件托管
// 当文件名以public开头的,那么直接返回对应的__dirname开头下
app.use('/public',express.static(__dirname+'/public'));


// 配置应用模板
// 定义当前应用的模板引擎
// 第一个参数：模板引擎的名称，同时也是模板文件的后缀，第二个参数：表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);
// 设置模板文件存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views','./views');
// 注册所使用的模板引擎,第一个参数必须是 view engine ，第二个参数：app.engine这个方法中定义的模板引擎的名称(第一个参数) 是一致的
app.set('view engine','html');

// 在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

// bodyparser设置
// 会自动给req增加一个属性:body
app.use(bodyParser.urlencoded({extended:true}));

// 设置cookie
app.use(function(req,res,next){
  req.cookies = new cookies(req,res);

  req.userInfo={};

  // 解析登录用户的cookie信息
  if(req.cookies.get('userInfo')){
    try{
      req.userInfo=JSON.parse(req.cookies.get('userInfo'));

      // 获取当前登录用户的类型，是否是管理员
      User.findById(req.userInfo._id).then(function(userInfo){
        // 通过强制转换为布尔值，进行判断
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
        next();
      })
    }catch(e){
      next();
    }
  }else{
    // console.log(typeof req.cookies.get('userInfo'));

    next();
  }
});

// 分模块开发，根据不同的功能划分模块
app.use('/admin', require('./routers/admin'));// 用于管理后台
app.use('/api', require('./routers/api'));// 用于管理api
app.use('/', require('./routers/main'));// 用于管理前台   

// 链接数据库
mongoose.connect('mongodb://localhost:27018/blog',{useNewUrlParser:true},function(err){
  if(err){
    console.log('数据库连接失败');
  }else{
    console.log('数据库连接成功');
    // 当数据库连接失败的时候没有必要再监听
    // 监听http请求
    app.listen(8520);
  }
});


