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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //是否有获取信息的权限。;;
    wx.getSetting({
      success(resp) {
        if (resp.authSetting["scope.userInfo"]){
          wx.getUserInfo({
            success(resp){
              app.globalData.userInfo = resp.userInfo;
              wx.cloud.callFunction({
                name: 'login',
                data: {
                  myUserInfo: resp.userInfo
                }
              }).then(retval => {
                console.log(retval);
                app.globalData.openid = retval.result.openid;
                app.globalData.userid = retval.result.userid;
                wx.switchTab({
                  url: '../index/index',
                });
                wx.cloud.callFunction({
                  name: 'getUserInfo',
                  data: {
                    feilds: null,
                    userid: app.globalData.userid
                  }
                }).then(
                  res => {
                    console.log('DONE');
                    app.globalData.user = res.result;
                  },
                  err => { console.log('ERROR |||', err); }
                )
              },
                error => {
                  console.log(error);
                  throw error;
                });
            }
          })
        }
      }
    })
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