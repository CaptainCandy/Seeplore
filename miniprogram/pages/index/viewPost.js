// miniprogram/pages/index/myPost.js
var utils = require('../../utils/utils.js'); 
const app = getApp();

//使用严格模式，为了使用let
"use strict";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPost: null,
    postImageList: [], //fileid
    replyList: [],
    currentPage: 1,
    pageCount: 1,
    isPullUp: false,
    loading: false, //"上拉加载"的变量，默认false，隐藏  
    loaded: false, //"已经没有数据"的变量，默认false，隐藏 
    isFirstLoading: true,  //第一次加载，设置true ,进入该界面时就开始加载
    userInfo: {},
  },  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //接受帖子信息
    wx.showLoading({
      title: '正在获取...',
    })
    let curPostId = options.curPostId
    let currentPost = null;
    let imageList = []
    wx.cloud.callFunction({
      name: 'getPostDetail',
      data: {
        postid: curPostId,
      },
    }).then(res => {
      console.log(res);
      currentPost = res.result;
      //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
      let now = new Date();
      let createTime = new Date(currentPost.createTime);
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
      currentPost.createTime = createTime;
      //预设好图片列表以供放大预览
      for (var n = 0; n < currentPost.content.length; n++) {
        if (currentPost.content[n].img == true) imageList.push(currentPost.content[n].fileid)
      }
      
      this.setData({
        currentPost: currentPost,
        postImageList: imageList,
      })
      wx.hideLoading()
    })

    //获取用户信息
    this.setData({
      userInfo: app.globalData.userInfo,
    })
    
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    }); 
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
    let that = this;

    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      isPullUp: true,
      isFirstLoading: false, // 上拉触发后，不再是初始数据加载，按页码加载
      loading: true //把"上拉加载"的变量设为false，显示 
    });
    //获取帖子
    new Promise(function (resolve, reject) {
      let currentPage = that.data.currentPage;
      let replyList = that.data.replyList
      console.log("currentPage == ", currentPage);
      wx.cloud.callFunction({
        name: 'getReplies',
        data: {
          postid: that.data.currentPost.postid,
          userid: app.globalData.userid,
        }
      }).then(resp => {
        console.log(resp.result.data)
        let replyList = resp.result.data
        replyList.map(reply => {
          //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
          let now = new Date();
          let createTime = new Date(reply.createTime);
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
          reply.createTime = createTime;
          reply.comments.map(comment => {
            //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
            let now = new Date();
            let createTime = new Date(comment.createTime);
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
            comment.createTime = createTime;
            //存入每一个回复回复的楼层的人的nickName
            for (var i = reply.comments.length - 1; i > 0; i--) {
              if (comment.parentid == reply.comments[i]._id) {
                comment.parentNickname = reply.comments[i].replier.nickName
                console.log('parentNickname found.')
                break
              }
            }
          })
        })
        that.setData({
          replyList: replyList.reverse(),
        })
        console.log(that.data.replyList)
        resolve()
      }
      )
    }).then(res => {
      that.setData({
        currentPage: that.data.currentPage + 8,
        loading: false
      })
      if (that.data.replyList.length == 0) that.setData({ loaded: true })
      console.log(that.data.loaded)
      wx.hideLoading()
    })
    //this.fetchReply();
  }, 

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    if (e.from === 'button') {
      // 来自页面内转发按钮
      console.log(e.target)
    }
    return {
      title: this.data.currentPost.title,
      path: '/pages/index/viewPost?curPostId=' + this.data.currentPost.postid,
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
        wx.showToast({
          title: '转发成功！',
          duration: 2000,
        })
        var shareTickets = res.shareTickets;
        // if (shareTickets.length == 0) {
        //   return false;
        // }
        // //可以获取群组信息
        // wx.getShareInfo({
        //   shareTicket: shareTickets[0],
        //   success: function (res) {
        //     console.log(res)
        //   }
        // })
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
        wx.showToast({
          title: '转发失败！\n请检查网络后重新尝试',
          icon: 'none',
          duration: 2000,
        })
      }
    }
  },

  test: function() {
    console.log("fffk");
  },

  imagePreview: function(e) {
    let src = e.currentTarget.dataset.src;
    console.log(src)
    wx.previewImage({
      current: src,
      urls: this.data.postImageList,
    })
  },

  onReply: function(e) {
    //先进行特殊字符的转义
    let postid = escape(this.data.currentPost.postid)
    let title = escape(this.data.currentPost.title)
    let author = escape(this.data.currentPost.author.nickName)
    wx.navigateTo({
      url: '../reply/reply?curPostId=' + postid + '&curPostTitle=' + title + '&curPostAuthor=' + author,
    })
  },

  onHeart: function(e) {
    let undo = false;
    let currentPost = this.data.currentPost
    if (this.data.currentPost.isHearted) {
      undo = true
      currentPost.isHearted = false
      this.setData({
        currentPost: currentPost
      })
      wx.showToast({
        title: '取消成功！',
        duration: 1000,
      })
    }
    else {
      currentPost.isHearted = true
      this.setData({
        currentPost: currentPost
      })
      wx.showToast({
        title: '点赞成功！',
        duration: 1000,
      })
    }
    console.log('undo '+undo)
    console.log('currentPost.isHearted ' + currentPost.isHearted)
    wx.cloud.callFunction({
      name: 'doPostAction',
      data: {
        heart: true,
        undo: undo,
        postid: this.data.currentPost.postid,
        userid: app.globalData.userInfo.userid,
      }
    }).then(
      function (resp) {
        if (resp.result.added)
          console.log("heart added")
        else if (resp.result.removed)
          console.log("heart removed")
        else{
          console.log("unmatched")
          if (currentPost.isHearted) currentPost.isHearted = false
          else currentPost.isHearted = true
          console.log(currentPost.isHearted)
        }
        this.setData({
          currentPost: currentPost
        })
      },//result 三个属性中只有一个true；unmatched表示“撤销不存在的赞”或者“收藏已收藏的帖子”。
      /*result = {
          added:true,
          removed: true,
          unmatched: true
        }*/
      function (err) {
        console.log("heart error")
        if (currentPost.isHearted) currentPost.isHearted = false
        else currentPost.isHearted = true
        console.log(currentPost.isHearted)
        this.setData({
          currentPost: currentPost
        })
       }//错误需要处理：可能是“撤销不存在的赞”或者“收藏已收藏的帖子”。;;
    )
  },

  onCollect: function(e) {

  },

  onReport: function(e) {

  },

  onDelete: function(e) {
    wx.showModal({
      title: '删除帖子',
      content: '确定要删除这篇帖子吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.database().collection('posts').doc(this.data.currentPost.postid).remove().then(
            function (resp) {
              console.log(resp)
              //说明删除成功，否则 removed == 0.
              if (resp.stats.removed == 1) {
                wx.showToast({
                  title: '删除成功',
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
                  title: '删除失败\n请检查网络后重试',
                  duration: 2000,
                  icon: 'none'
                })
            },
            function (err) {
              //错误处理。
              wx.showToast({
                title: '删除失败\n请检查网络后重试',
                duration: 2000,
                icon: 'none'
              })
            }
          )
        }
      }
    })
  },

  /*fetchReply: function () {
    let currentPage = this.data.currentPage;
    let replyList = this.data.replyList
    console.log("currentPage == ", currentPage);
    wx.cloud.callFunction({
      name: 'getReplies',
      data: {
        postid: this.data.currentPost.postid,
        userid: app.globalData.userInfo.userid,
      }
    }).then(resp => {
      console.log(resp.result.data)
      let replyList = resp.result.data
      replyList.map(reply => {
        //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
        let now = new Date();
        let createTime = new Date(reply.createTime);
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
        reply.createTime = createTime;
        reply.comments.map(comment => {
          //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
          let now = new Date();
          let createTime = new Date(comment.createTime);
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
          comment.createTime = createTime;
          //存入每一个回复回复的楼层的人的nickName
          for (var i = reply.comments.length - 1; i > 0; i--){
            if (comment.parentid == reply.comments[i]._id) {
              comment.parentNickname = reply.comments[i].replier.nickName
              console.log('parentNickname found.')
              break
              }
          }
        })
      })
      this.setData({
        replyList: replyList,
      })
      }
    )
  },*/

  onComment: function(e){

  },

  onReplyHeart: function(e) {

  },

  onReplyCollect: function(e) {

  },

  onReplyShare: function (e) {

  },

  onReplyReport: function (e) {

  },

  onReplyDelete: function (e) {
    let that = this
    let curreplyid = e.currentTarget.dataset.curreplyid
    let replyList = this.data.replyList
    wx.showModal({
      title: '删除回帖',
      content: '确定要删除这篇回帖吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.database().collection('replies').doc(curreplyid).remove().then(
            function (resp) {
              //说明删除成功，否则 removed == 0.
              if (resp.stats.removed == 1) {
                wx.showToast({
                  title: '删除成功',
                  duration: 2000
                })
                for (var i = 0; i < replyList.length; i++){
                  if (replyList[i]._id == curreplyid) {
                    replyList.splice(i, 1)
                    that.setData({ replyList: replyList })
                    break
                    }
                }
              }
              else
                wx.showToast({
                  title: '删除失败\n请检查网络后重试',
                  duration: 2000,
                  icon: 'none'
                })
            },
            function (err) {
              //错误处理。
              console.log(err)
              wx.showToast({
                title: '删除失败\n请检查网络后重试',
                duration: 2000,
                icon: 'none'
              })
            }
          )
        }
      }
    })
  },
})