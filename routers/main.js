// 引入框架
var express = require('express');
// 配置路由
var router = express.Router();
var Category=require('../models/Category');
var Content=require('../models/Content');

var data;
// 通用数据
router.use(function(req,res,next){
  data={
    userInfo:req.userInfo,
    categories:[]
  };
  Category.find().then(function(categories){
    data.categories=categories;
    next();
  });
});

// 首页
router.get('/',function(req,res,next){
  // 当前的用户信息
  // console.log(req.userInfo);

  // 用对象来存储数据：比较方便
  data.category=req.query.category || '';
  data.count=0;
  data.page=Number(req.query.page||1);
  data.limit=4;
  data.pages=0;

  // 除了首页以外，其他的要根据id来判断
  var where = {};
  if(data.category){
    // where 判断条件
    where.category = data.category
  }

  // 读取所有的分类信息
  Content.where(where).count().then(function(count){
    data.count=count;

    data.pages=Math.ceil(data.count/data.limit);
    data.page=Math.min(data.page,data.pages);
    data.page=Math.max(data.page,1);

    var skip=(data.page-1)*data.limit;

    // 读取内容
    return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({addTime:-1});
  
  }).then(function(contents){

    data.contents=contents;
    // console.log(data);
    res.render('main/index',data);
  });
});

router.get('/view',function(req,res){
  var contentId=req.query.contentid||'';
  Content.findOne({
    _id:contentId
  }).then(function(content){
    data.content=content;

    // 将阅读数+1
    content.views++;
    content.save();

    res.render('main/view',data);
  });
});

// 导出
module.exports=router;