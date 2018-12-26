// miniprogram/pages/category/category.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabbar:{},
    tagList: [
      {
        category: '国家',
        tags: [
          {
            name: "美国",
            url: '../../images/usa.png'
          },
          {
            name: "英国",
            url: '../../images/uk.png'
          },
          {
            name: "澳大利亚",
            url: '../../images/aus.png'
          },
          {
            name: "香港",
            url: '../../images/hk.png'
          },
          {
            name: "加拿大",
            url: '../../images/ca.png'
          },
          {
            name: "新加坡",
            url: '../../images/sg.png'
          }]
      },
      {
        category: '考试',
        tags: [
          {
            name: "托福",
            url: '../../images/toefl.png'
          },
          {
            name: "雅思",
            url: '../../images/ielts.png'
          },
        ]
      },
      {
        category: '求职',
        tags: [
          {
            name: "任天堂",
            url: '../../images/pikachu.jpg'
          },
        ]
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.editTabbar()
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

  test: function(e) {
    console.log(e.currentTarget)
  }
})