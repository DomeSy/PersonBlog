// 引入框架
var express = require('express');
// 配置路由
var router = express.Router();
// 引入模型module
var User = require('../models/User');
var Content = require('../models/Content');

// 统一的返回格式
var responseData;

router.use(function (req, res, next) {
  // code:0  无任何错误
  // message:错误信息
  responseData = {
    code: 0,
    message: ''
  }

  next();
});

// 用户注册
/*
  注册逻辑(非数据库的验证)
    1>用户名不能为空
    2>密码不能为空
    3>两次输入密码必须一致

  数据库的验证：
    1>用户名是否已被注册了
      数据库查询
*/
router.post('/user/register', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var repassword = req.body.repassword;

  // 用户名是否为空
  if (username == '') {
    // 代表错位类型
    responseData.code = 1;
    // 错误提示信息
    responseData.message = '用户名不能为空';
    // 通过json形式返回给前端
    res.json(responseData);
    return;
  }
  // 密码不能为空
  if (password == '') {
    responseData.code = 2;
    responseData.message = '密码不能为空';
    res.json(responseData);
    return;
  }
  // 两次输入的密码不一致必须一致
  if (password != repassword) {
    responseData.code = 3;
    responseData.message = '两次输入的密码不一致';
    res.json(responseData);
    return;
  }

  // 用户名是否以被注册，如果数据库中已存在和我们要注册的用户名同名的数据，表示该用户名已经被注册
  // findOne:查找到一条
  User.findOne({
    username: username
  }).then(function (userInfo) {
    // userInfo:用户的数据
    if (userInfo) {
      // 存在则表示数据库中有该记录
      responseData.code = 4;
      responseData.message = '用户名已被注册';
      res.json(responseData);
      return;
    }
    // 保存用户注册的信息到数据库中
    var user = new User({
      username: username,
      password: password
    });
    return user.save();
  }).then(function (newUserInfo) {
    // console.log(newUserInfo);
    responseData.message = '注册成功';
    res.json(responseData);
  });
});

// 登录
router.post('/user/login', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  if (username == '' || password == '') {
    responseData.code = 1;
    responseData.message = '用户名和密码不能为空';
    res.json(responseData);
    return;
  }

  // 查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
  User.findOne({
    username: username,
    password: password
  }).then(function (userInfo) {
    if (!userInfo) {
      responseData.code = 2;
      responseData.message = '用户名或密码错误';
      res.json(responseData);
      return;
    }
    // 用户名和密码都正确
    responseData.message = '登录成功';
    responseData.userInfo = {
      _id: userInfo._id,
      username: userInfo.username
    }
    // 发送cookie信息，会保存起来
    req.cookies.set('userInfo', JSON.stringify({
      _id: userInfo._id,
      username: userInfo.username
    }));
    res.json(responseData);
    return;
  });
});

// 退出
router.get('/user/logout', function (req, res) {
  req.cookies.set('userInfo', null);
  res.json(responseData);
});

// 获取指定文章的所有评论
router.get('/comment', function(req, res) {
  var contentId = req.query.contentid || '';

  Content.findOne({
      _id: contentId
  }).then(function(content) {
      responseData.data = content.comments;
      res.json(responseData);
  })
});

// 评论提交
router.post('/comment/post', function (req, res) {
  //内容的id
  var contentId = req.body.contentid || '';
  var postData = {
    username: req.userInfo.username,
    postTime: new Date(),
    content: req.body.content
  };

  //查询当前这篇内容的信息
  Content.findOne({
    _id: contentId
  }).then(function (content) {
    content.comments.push(postData);
    return content.save();
  }).then(function (newContent) {
    responseData.message = '评论成功';
    responseData.data = newContent;
    res.json(responseData);
  });
});

// 导出
module.exports = router;