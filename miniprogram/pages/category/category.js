// miniprogram/pages/category/category.js
const app = getApp()

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
        category: '交流',
        tags: [
          {
            name: "心灵之约",
            url: '../../images/chat_heart.png'
          },
        ]
      },
    ],
    searchResult: [],
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

  onTag: function(e) {
    console.log(e.currentTarget.dataset)
    let tags = []
    let tag = this.data.tagList[e.currentTarget.dataset.aindex].tags[e.currentTarget.dataset.bindex].name
    console.log(tag)
    tags.push(tag)
    let that = this
    wx.showLoading({
      title: '正在获取',
    })
    wx.cloud.callFunction({
      name: 'getPostList', data: {
        userid: app.globalData.userid,
        tags: tags,
        //words: ['王逸群']
      }
    }).then(
      res => {
        res.result.data.map(post => {
          //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
          let now = new Date();
          let createTime = new Date(post.createTime);
          if (now.getFullYear() == createTime.getFullYear() && now.getDate() == createTime.getDate() && now.getMonth() == createTime.getMonth()) {
            let strTime = null;
            if (createTime.getMinutes() <= 9 && createTime.getMinutes() >= 0) strTime = createTime.getHours() + ':0' + createTime.getMinutes();
            else strTime = createTime.getHours() + ':' + createTime.getMinutes();
            createTime = strTime;
          }
          else {
            let strTime = (createTime.getMonth() + 1) + '-' + createTime.getDate();
            createTime = strTime;
          }
          post.createTime = createTime;
        })
        console.log(res.result.data);
        that.setData({
          searchResult: res.result.data.reverse()
        })
        wx.navigateTo({
          url: '../mine/myPost?isSearch=true',
        })
        wx.hideLoading()
      } // .data is a list of posts.
    );
  }
})