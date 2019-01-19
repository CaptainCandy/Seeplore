// miniprogram/pages/mine/applyCheck.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyList: [],
    unCheckedCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    let unCheckedCount = this.data.unCheckedCount
    wx.showLoading({
      title: '正在加载',
    })
    wx.cloud.callFunction({
      name: 'manageApplication',
      data: {
        toViewList: true, 
        userid: app.globalData.userid
      }
    }).then(
      res => {
        console.log(res.result.data)
        res.result.data.map(apply => {
          if (!apply.isChecked) {
            //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
            let now = new Date();
            let createTime = new Date(apply.createTime);
            if (now.getFullYear() == createTime.getFullYear() && now.getDate() == createTime.getDate() && now.getMonth() == createTime.getMonth()) {
              let strTime = null;
              if (createTime.getMinutes() <= 9 && createTime.getMinutes() >= 0) strTime = createTime.getHours() + ':0' + createTime.getMinutes();
              else strTime = createTime.getHours() + ':' + createTime.getMinutes();
              createTime = strTime;
            }
            else {
              let strTime = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate();
              createTime = strTime;
            }
            apply.createTime = createTime;
            unCheckedCount = unCheckedCount + 1
          }
        })
        that.setData({
          applyList: res.result.data.reverse(),
          unCheckedCount: unCheckedCount
        })
        wx.hideLoading()
      },
      err => {
        wx.showToast({
          title: '加载失败，请重试！',
          icon: "none",
          duration: 2000
        })
      }
    )
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

  onCheck: function (e) {
    let approve = e.currentTarget.dataset.approve
    let apply = this.data.applyList[e.currentTarget.dataset.index]
    console.log(apply)
    if (approve === "1") {
      wx.showModal({
        title: '确认',
        content: '您确定要通过 ' + apply.name + ' 的申请吗',
        success: res => {
          if (res.confirm) {
            wx.showLoading({
              title: '正在保存',
            })
            wx.cloud.callFunction({
              name: 'manageApplication',
              data: {
                toViewList: false, 
                userid: app.globalData.userid,
                isApproved: true,//管理员是否通过这个机构的申请。
                appliactionid: apply._id,//上一个函数的返回的list里面元素的_id
                message: '恭喜您通过申请，欢迎入驻Seeplore！'
              }
            }).then(
              res => {
                console.log(res)
                if (res.result.updated) {
                  wx.hideLoading()
                  wx.showToast({
                    title: '成功通过！',
                    duration: 2000,
                  })
                }
                else {
                  wx.showToast({
                    title: '通过失败，请稍后再处理！',
                    duration: 2000,
                    icon: "none"
                  })
                }
              },
              err => {
                wx.showToast({
                  title: '通过失败，请稍后再处理！',
                  duration: 2000,
                  icon: "none"
                })
              }
            )
          }
        }
      })
    }
    else if (approve === "0") {
      wx.navigateTo({
        url: 'applyFeedback?name=' + apply.name + '&applyid=' + apply._id + '&applyindex=' + e.currentTarget.dataset.index,
      })
    }
  }
})