# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

# 代码文件架构

- cloudfunctions 存放用于云开发的自定义云函数
- miniprogram 存放用于小程序本体开发的代码
  - components 组件，可以直接在小程序中调用
  - icon 一些图标的存放
  - images 一些必要图片的存放
  - pages 存放小程序的页面文件，基本上每一个页面会有一个文件夹，每一个页面均有WXML, WXSS, JS以及JSON配置文件
  - styles 本用于控制全局样式，但我们没有用到
  - utils 抽象出一些开发过程中需要有的方法，写在JS文件中供调用
  - app开头的文件，存放全局相关的东西，如用户信息就存放在app.js的globalData中
  - plan.md 记录开发过程中前后端人员的工作以及约定的数据格式、函数调用格式等
