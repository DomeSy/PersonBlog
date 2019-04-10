var mongoose = require('mongoose');

// 内容的表结构
module.exports = new mongoose.Schema({

  // 关联字段：和其他表上有关联
  // 内容分类的id
  category:{
    // 类型
    // mongoose.Schema.Types.ObjectId：数据库中的ObjectiD
    type:mongoose.Schema.Types.ObjectId,
    // 引用
    ref:'Category'
  },

  // 分类标题
  title:String,

  // 关联-用户id
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },

  // 添加事件
  addTime:{
    type:Date,
    // 当前时间
    default:new Date()
  },

  // 阅读量
  views:{
    type:Number,
    default:0
  },

  // 简介
  description:{
    type:String,
    default:''
  },

  // 内容
  content:{
    type:String,
    default:''
  },

  // 评论内容
  comments:{
    type:Array,
    default:[]
  }
});
