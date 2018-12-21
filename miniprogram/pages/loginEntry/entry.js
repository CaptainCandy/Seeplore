// miniprogram/pages/loginEnrty/entry.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLogin: function (event) {//demo的获取按钮是空白头像。
    if (/* !app.globalData.logged && */ event.detail.userInfo) {
      //console.log(event.detail.userInfo)
      app.globalData.userInfo = event.detail.userInfo
      //app.globalData.logged = true
    }
    wx.cloud.callFunction({
      name:'login',
      data:{
        myUserInfo: event.detail.userInfo
      }
    }).then(retval => {
      console.log(retval);
      app.globalData.openid = retval.result.openid;
      app.globalData.userid = retval.result.userid;
      wx.switchTab({
        url: '../index/index',
      })
      //TODO 将后台返回的用户状态保存到app全局变量
    }).catch(error => {
      console.log(error)
    })
  },

  onTap: function(event){
    console.log(event)
    wx.cloud.callFunction({
      name:'updateUserInfo',
      data:{
        userid: null,
        updates: {
          email: 'sos@fuckme.com'
        }
      }
    }).then(retval=>{
      console.log(retval)
      console.log('We make it!!!!!!!')
    }).catch(retval=>{
      console.log('someting wrong.')
      console.log(retval)
    })
  },

  onTest:function(e){
    console.log('onTest');
    wx.cloud.callFunction({
      name: 'test',
      data: {
        myUserInfo: e.detail.userInfo,
        whereFrom: 'client'
      }
    }).then(retval => console.log(retval.result))
  },

  onHelpMe:function(e){
    console.log('onTap');
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        myUserInfo: e.detail.userInfo
      }
    }).then(retval => console.log(retval.result))
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*wx.showModal({
      title: '提示',
      content: '你还未登录，登录后可获得完整体验 ',
      confirmText: '一键登录',
      success(res) {
        // 点击一键登录，去授权页面
        if (res.confirm) {
          wx.navigateTo({
            url: 'entry',
          })
        }
      },
      fail: res => {
      }
    })*/
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

  }
})