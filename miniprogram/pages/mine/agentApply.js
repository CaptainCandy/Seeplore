// miniprogram/pages/mine/agentApply.js
const app = getApp()
const utils = require('../../utils/utils.js')

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
    let isCompleted = true;
    console.log(app.globalData.userid)
    agentInfo.userid = app.globalData.userid;
    for (var i in agentInfo) {
      if (agentInfo[i] === '') {
        wx.showModal({
          title: '错误信息',
          content: '请填写所有内容后再尝试提交审核',
          showCancel: false,
        })
        isCompleted = false
        break
      }
    }
    console.log(agentInfo)
    if (isCompleted) {
      this.setData({
        agentInfo
      })
      utils.submitApplication(agentInfo).then(
        res => {
          if (res.isSubmitted) {
            console.log(res)
            wx.showToast({
              title: '提交成功',
              duration: 2000,
            })
            setTimeout(function () {
              wx.navigateBack({
                delta: 1
              })
            }, 2200)
          }
          else {
            wx.showToast({
              title: '提交失败',
              icon: 'none',
              duration: 2000
            })
          }
        } // true: 提交成功 false: 提交失败（userid/name 重复）
      );
    }
    console.log(this.data.agentInfo)
  }
})