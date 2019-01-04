// miniprogram/pages/mine/agentApply.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    agentInfo: {
      userid: '',
      name: '',
      unicode: '',
      legalperson: '',
      address: '',
      introduction: '',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo,
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

  onInput: function(e) {
    let agentInfo = this.data.agentInfo
    let type = e.currentTarget.dataset.type
    if (type === 'unicode') {
      agentInfo.unicode = e.detail.value
      this.setData({
        agentInfo
      })
    } else if (type === 'legalperson') {
      agentInfo.legalperson = e.detail.value
      this.setData({
        agentInfo
      })
    } else if (type === 'address') {
      agentInfo.address = e.detail.value
      this.setData({
        agentInfo
      })
    } else if (type === 'intro') {
      agentInfo.introduction = e.detail.value
      this.setData({
        agentInfo
      })
    } else if (type === 'name') {
      agentInfo.name = e.detail.value
      this.setData({
        agentInfo
      })
    }
  },

  onSubmit: function(e) {
    let agentInfo = this.data.agentInfo;
    agentInfo.userid = app.globalData.userid;
    this.setData({
      agentInfo
    })
    console.log(this.data.agentInfo)
  }
})