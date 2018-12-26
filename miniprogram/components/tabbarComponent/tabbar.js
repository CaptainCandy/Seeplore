// tabBarComponent/tabBar.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabbar: {
      type: Object,
      value: {
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
            "text": "发帖"
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
  },

  /**
   * 组件的初始数据
   */
  data: {
    //isIphoneX: app.globalData.systemInfo.model == "iPhone X" ? true : false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
