//app.js
App({
  onLaunch: function (e) {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    wx.hideTabBar()

    this.globalData = {
      userInfo: null,
      tabBar: {
        "backgroundColor": "#ffffff",
        "color": "#999999",
        "selectedColor": "#7cb9e8",
        "list": [
          {
            "pagePath": "/pages/index/index",
            "iconPath": "icon/icon_index.png",
            "selectedIconPath": "icon/icon_index_hl.png",
            "text": "首页"
          },
          {
            "pagePath": "/pages/category/category",
            "iconPath": "icon/icon_category.png",
            "selectedIconPath": "icon/icon_category_hl.png",
            "text": "版块"
          },
          {
            "pagePath": "/pages/post/post",
            "iconPath": "icon/post_icon.png",
            "isSpecial": true,
            "text": "发布"
          },
          {
            "pagePath": "/pages/collegeLib/collegeLib",
            "iconPath": "icon/icon_college.png",
            "selectedIconPath": "icon/icon_college_hl.png",
            "text": "院校库"
          },
          {
            "pagePath": "/pages/mine/mine",
            "iconPath": "icon/icon_mine.png",
            "selectedIconPath": "icon/icon_mine_hl.png",
            "text": "我的"
          }
        ]
      }
    }

    //wx.cloud.database.c
  },

  editTabbar: function () {
    let tabbar = this.globalData.tabBar;
    let currentPages = getCurrentPages();
    let _this = currentPages[currentPages.length - 1];
    let pagePath = _this.route;
    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
    for (let i in tabbar.list) {
      tabbar.list[i].selected = false;
      (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
    }
    _this.setData({
      tabbar: tabbar
    });
  }
})
