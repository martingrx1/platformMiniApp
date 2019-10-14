// pages/chat/chat.js
const db = wx.cloud.database()
const app = getApp();
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatInfo: {}, //当前聊天页面的内容
    replyContent: '', //当前回复输入内容
    user_Id: "", //当前登录的用户id
    scrollTop: 0,
    watcher:{}
  },


  edit_reply(e) {
    this.setData({
      replyContent: e.detail.value //更新输入框的内容
    })
  },

  confirmReply() {
    let stuId = this.data.user_Id; //获取当前用户学号
    const _ = db.command;

    let single_msg = { //单条消息
      content: this.data.replyContent, //消息内容
      time: util.displayTime(new Date()), //时间
      role: stuId //发消息的人id
    }

    wx.cloud.callFunction({  //通过云函数给对话添加新的聊天记录
      name: 'update_chatMsg',
      data: {
        chat_msg: single_msg,
        id: this.data.chatInfo._id
      },
      success: function (cloud_res) {
        console.log('上传聊天记录成功')
      },
      fail: console.error
    })

    // this.data.chatInfo.chat.push(single_msg) //插入当前发的单条回复消息  用于实时显示当前用户发的消息
    // this.data.scrollTop += 80;
    this.setData({ //保存
      replyContent: "", //清空输入内容
      // chatInfo: this.data.chatInfo, //更新当前页面聊天内容
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) { //接收聊天条发送的聊天内容

      const watcher = db.collection('chatList').where({
        _id: data.data._id
      }).watch({
        onChange: function (snapshot) {
          that.setData({
            chatInfo: snapshot.docChanges[0].doc,
            scrollTop: snapshot.docChanges[0].doc.chat.length * 80  //获取最新的聊天记录数据
          })
          console.log('docs\'s changed events', snapshot.docChanges)
          console.log('query result snapshot after the event', snapshot.docs)
          console.log('is init data', snapshot.type === 'init')
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
      that.setData({
        watcher:watcher,
        // chatInfo: data.data,
        // scrollTop: data.data.chat.length * 80  //获取最新的聊天记录数据
      })

    })
  },

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;

    that.setData({
      user_Id: app.globalData.userInfo.stuId  //当前登录用户的id
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
   
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.data.watcher.close();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})