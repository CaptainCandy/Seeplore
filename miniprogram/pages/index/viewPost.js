// miniprogram/pages/index/myPost.js
var utils = require('../../utils/utils.js'); 
const app = getApp();

//使用严格模式，为了使用let
"use strict";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPost: null,
    postImageList: [], //fileid
    replyList: [],
    currentPage: 1,
    pageCount: 1,
    isPullUp: false,
    loading: false, //"上拉加载"的变量，默认false，隐藏  
    loaded: false, //"已经没有数据"的变量，默认false，隐藏 
    isFirstLoading: true,  //第一次加载，设置true ,进入该界面时就开始加载
    userInfo: {},
  },  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //接受帖子信息
    wx.showLoading({
      title: '正在获取...',
    })
    let curPostId = options.curPostId
    let currentPost = null;
    let imageList = []
    wx.cloud.callFunction({
      name: 'getPostDetail',
      data: {
        postid: curPostId,
      },
    }).then(res => {
      console.log(res);
      currentPost = res.result;
      //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
      let now = new Date();
      let createTime = new Date(currentPost.createTime);
      if (now.getFullYear() == createTime.getFullYear() && now.getDate() == createTime.getDate() && now.getMonth() == createTime.getMonth()) {
        let strTime = null;
        if (createTime.getMinutes() <= 9 && createTime.getMinutes() >= 0) strTime = createTime.getHours() + ':0' + createTime.getMinutes();
        else strTime = createTime.getHours() + ':' + createTime.getMinutes();
        createTime = strTime;
      }
      else {
        let strTime = (createTime.getMonth() + 1) + '-' + createTime.getDate();
        createTime = strTime;
      }
      currentPost.createTime = createTime;
      //预设好图片列表以供放大预览
      for (var n = 0; n < currentPost.content.length; n++) {
        if (currentPost.content[n].img == true) imageList.push(currentPost.content[n].fileid)
      }
      
      this.setData({
        currentPost: currentPost,
        postImageList: imageList,
      })
      wx.hideLoading()
    })

    //获取用户信息
    this.setData({
      userInfo: app.globalData.userInfo,
    })
    
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    }); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;

    utils.showLoading();
    that.setData({
      isPullUp: true,
      isFirstLoading: false, // 上拉触发后，不再是初始数据加载，按页码加载
      loading: true //把"上拉加载"的变量设为false，显示 
    });
    //获取帖子
    this.fetchReply();
    utils.hideLoading();
    that.setData({
      currentPage: that.data.currentPage + 8, 
      //loading: false
    })
  }, 

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    if (e.from === 'button') {
      // 来自页面内转发按钮
      console.log(e.target)
    }
    return {
      title: this.data.currentPost.title,
      path: '/miniprogram/pages/index/viewPost?curPostId=' + this.data.currentPost.postid,
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
        wx.showToast({
          title: '转发成功！',
          duration: 2000,
        })
        var shareTickets = res.shareTickets;
        // if (shareTickets.length == 0) {
        //   return false;
        // }
        // //可以获取群组信息
        // wx.getShareInfo({
        //   shareTicket: shareTickets[0],
        //   success: function (res) {
        //     console.log(res)
        //   }
        // })
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
        wx.showToast({
          title: '转发失败！\n请检查网络后重新尝试',
          icon: 'none',
          duration: 2000,
        })
      }
    }
  },

  test: function() {
    console.log("fffk");
  },

  imagePreview: function(e) {
    let src = e.currentTarget.dataset.src;
    console.log(src)
    wx.previewImage({
      current: src,
      urls: this.data.postImageList,
    })
  },

  onHeart: function(e) {
    
  },

  onCollect: function(e) {

  },

  onShare: function(e) {
    console.log("onshare clicked.");
  },

  onReport: function(e) {

  },

  onDelete: function(e) {
    
  },

  fetchReply: function () {
    let that = this;
    let currentPage = that.data.currentPage;
    console.log("currentPage == ", currentPage);
  },

  onComment: function(e){

  },

  onReplyHeart: function(e) {

  },

  onReplyCollect: function(e) {

  },

  onReplyShare: function (e) {

  },

  onReplyReport: function (e) {

  },

  onReplyDelete: function (e) {

  },
})