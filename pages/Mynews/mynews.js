// pages/Mynews/mynews.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatList: [],
    curStu_id: ""
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
    var that = this;
    const _ = db.command;

    db.collection("user_info").where({
      stuId: app.globalData.userInfo.stuId  //查询当前用户的对话记录
    }).get({
      success: userInfo => {

        db.collection('chatList').where({ //用户当前登录的用户的对话记录列表
          _id: _.in(userInfo.data[0].chatList) //_.in查询指令
        }).get({
          success: get_res => {
            that.setData({ //成功之后保存
              chatList: get_res.data,  //当前用户的对话记录
              curStu_id: app.globalData.userInfo.stuId //保存当前用户的id
            })
          }
        })
      }
    })
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

  }
})