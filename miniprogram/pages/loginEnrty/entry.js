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
      console.log(event.detail.userInfo)
      app.globalData.userInfo = event.detail.userInfo
      //app.globalData.logged = true
    }
    wx.cloud.callFunction({
      name:'login',
      data:{
        userInfo: null//event.detail.userInfo
      }
    }).then(retval => {
      console.log(retval)
      wx.navigateTo({
        url: 'index',
      })
      //TODO 将后台返回的用户状态保存到app全局变量
    }).catch(error => {
      console.log(error)
    })
  },

  onHelpMe: function(event){
    console.log(event)
    wx.cloud.callFunction({
      name:'login',
      data:{}
    }).then(retval=>{
      console.log(retval)
      console.log('We make it!!!!!!!')
    }).catch(retval=>{
      console.log('someting wrong.')
      console.log(retval)
    })
  },

  onTest:function(){
    wx.cloud.callFunction({
      name:'test',
      data:{}
    }).then(retval=>console.log(retval)).catch((err)=>{
      console.log(err)
    })
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

  }
})