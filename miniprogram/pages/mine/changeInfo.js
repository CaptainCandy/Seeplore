// miniprogram/pages/mine/changeInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    changeType: null,
    userid: null,
    input: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      changeType: options.changeType,
      userid: options.userid
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

  },

  onInput: function (e) {
    this.setData({
      input: e.detail.value
    })
  },

  onChangeIntro: function (e) {
    let intro = this.data.input
    let userid = this.data.userid
    console.log(this.data.input)
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        userid: userid,
        updates: {
          introduction: intro
        }
      }
    }).then( resp => {
      console.log(resp)
      if (resp.result.stats.updated === 1) {
        wx.showToast({
          title: '修改成功',
          duration: 2000
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1,
          })
        }, 2200)
      }
      else
        wx.showToast({
          title: '修改失败',
          duration: 2000,
          icon: 'none'
        })
    },err => {
      //错误处理。
      console.log(err)
      wx.showToast({
        title: '修改失败',
        duration: 2000,
        icon: 'none'
      })
    })
  }
})