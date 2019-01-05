// miniprogram/pages/post/post.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    html: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 
   */
  finish: function (e) {
    console.log(e.detail.title);
    console.log(e.detail.content);
  },

  createPost: function(e){
    let content = null;
    console.log(e.detail);

    wx.cloud.callFunction({
      name: 'createPost',
      data: {
        title: e.detail.title,
        abstract: e.detail.abstract,
        content: e.detail.content,
        tags: e.detail.tags, //? 仅保存至tag collection;; String可用db.RegExp
        userid: app.globalData.userid //_id in 'user' collection
      }
    }).then(function (resp) {
      console.log(resp.result.postid);//TODO 此时应当跳转发帖结束页面。
      wx.hideLoading()
      wx.redirectTo
        ({
          url: '../index/viewPost?curPostId=' + resp.result.postid,
          success: function () {
            // 暂时不需要
          },
          fail: function () {
            wx.switchTab({
              url: '../index/index',
            })
          }
        })
    },
      function (err) {
        console.log(err)
        wx.showToast({
          title: '发帖失败！',
          duration: 2000,
          icon: 'none'
        })
      })
  }
})