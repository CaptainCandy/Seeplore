// miniprogram/pages/mine/applyFeedback.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    apply: null,
    feedback: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let apply = {}
    apply._id = options.applyid
    console.log(apply._id)
    apply.name = options.name
    apply.index = options.applyindex
    this.setData({
      apply: apply
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
      feedback: e.detail.value
    })
  },

  onCheck: function () {
    let feedback = this.data.feedback
    let apply = this.data.apply
    let pages = getCurrentPages()
    let prePage = pages[pages.length - 2]
    let applyList = prePage.data.applyList
    wx.showLoading({
      title: '正在保存',
    })
    wx.cloud.callFunction({
      name: 'manageApplication',
      data: {
        toViewList: false,
        userid: app.globalData.userid,
        isApproved: false,//管理员是否通过这个机构的申请。
        appliactionid: apply._id,//上一个函数的返回的list里面元素的_id
        message: feedback
      }
    }).then(
      res => {
        console.log(res)
        if (res.result.updated) {
          applyList.splice(apply.index, 1)
          prePage.setData({
            applyList: applyList
          })
          wx.hideLoading()
          wx.showToast({
            title: '删除成功！',
            duration: 2000,
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          }, 2200)
        }
        else {
          wx.hideLoading()
          wx.showToast({
            title: '删除失败，可能是已经被删除了！',
            duration: 2000,
            icon: "none"
          })
        }
      },
      err => {
        wx.showToast({
          title: '删除失败，请重试！',
          duration: 2000,
          icon: "none"
        })
      }
    )
  }
})