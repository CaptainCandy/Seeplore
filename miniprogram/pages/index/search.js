// miniprogram/pages/index/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchString: '',
    searchArray: [],
    searchResult: []
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

  },

  onInput: function(e) {
    let string = e.detail.value
    this.setData({
      searchString: string
    })
  },

  onSearch: function() {
    wx.showLoading({
      title: '正在搜索',
    })
    let string = this.data.searchString
    let array = string.split(' ')
    console.log(array)
    this.setData({
      searchArray: array
    })
    let that = this
    wx.cloud.callFunction({
      name: 'getPostList', data: {
        userid: 'og8v64qQg6Ws-71AGkdAAF-wXTTk',
        //tags: ['心灵之约'], 关键词与标签检索不并存。
        words: array
      }
    }).then(
      res => { console.log(res.result.data);
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
        wx.hideLoading()
        wx.navigateTo({
          url: '../mine/myPost?isSearch=true',
        })
      } // .data is a list of posts.
    );
  }
})