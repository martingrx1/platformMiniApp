// pages/index/components/NewsList/newsList.js

Component({
  /**
   * 组件的属性列表
   */
  lifetimes: {
    attached: function() {}
  },
  pageLifetimes: { //用户每次退出或者进入就刷新一次消息
    show: function() {

    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  },
  properties: {
    chatList: {
      type: Array
    },
    curStu_id: {
      type: String
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleTo_chatPage(event) {
      wx.navigateTo({
        url: '../chat/chat',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          // acceptDataFromOpenedPage: function(data) {
          //   console.log(data)
          // },
          // someEvent: function(data) {
          //   console.log(data)
          // }
        },
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            data: event.currentTarget.dataset.item
          })
        }
      })
    },

  }
})