//index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    tabbar:{},
    navTab: ["最新", "最热"],
    currentNavtab: "0",
    prePostListNew: [],
    prePostListHot: [],
  },

  onLoad: function(options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 自定义tabbar
    app.editTabbar()
    // 把原来的tabbar隐藏
    wx.hideTabBar()

    // 获取用户信息
    this.setData({
      userInfo: app.globalData.userInfo,
    })

    // 加载最新帖子列表
    this.fetchPostListNew()

    //判断是否是分享链接
    if (options.isPostShare === 'true') {
      wx.navigateTo({
        url: 'viewPost?curPostId=' + options.curPostId,
      })
    }
    else if (options.isCollegeShare === 'true') {
      wx.navigateTo({
        url: '../collegeLib/college?name=' + options.name,
      })
    }
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
    // 加载最新帖子列表
    //this.fetchPostListNew()
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

  //加载最新帖子列表
  fetchPostListNew() {
    wx.cloud.callFunction({
      name: 'getPostList',
      data: {
        recent: true
      }
    }).then(res => {
      console.log(res);
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
      this.setData({
        prePostListNew: res.result.data,
        prePostListHot: res.result.data,
      });
    })
  },

  //TODO: 加载最热帖子列表
  fetchPostListHot() {

  },

  switchTopTab: function (e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

  onPostList: function(e) {
    console.log(e.currentTarget.dataset.currentindex)
    let curNav = e.currentTarget.dataset.currentnavtab
    let currentPost = null
    if (curNav === 1) //因为在0的时候显示的是undefined，所以不能用0来判断
      currentPost = this.data.prePostListHot[e.currentTarget.dataset.currentindex]
    else currentPost = this.data.prePostListNew[e.currentTarget.dataset.currentindex]
    let curPostId = currentPost.postid
    wx.navigateTo({
      url: 'viewPost?curPostId=' + curPostId
    })
  },

  onUser: function(e) {
    console.log(e.currentTarget.dataset.currentindex)
    let curNav = e.currentTarget.dataset.currentnavtab
    let currentPost = null
    if (curNav === 1) //因为在0的时候显示的是undefined，所以不能用0来判断
      currentPost = this.data.prePostListHot[e.currentTarget.dataset.currentindex]
    else currentPost = this.data.prePostListNew[e.currentTarget.dataset.currentindex]
    let curUser = currentPost.author.userid
    wx.navigateTo({
      url: '../mine/userSite?isMine=' + (curUser === app.globalData.userid) + '&targetUserid=' + curUser,
    })
  },

  onSearch: function() {
    wx.navigateTo({
      url: 'search',
    })
  }
})
