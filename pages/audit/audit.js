// pages/Mypublish/mypublish.js
const db = wx.cloud.database();
const _ = db.command;
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkoutList: [],
    conditions: { 'isCheckout': false},
    auditType: "audit_user"
  },

  queryList(listName,skipIndex = 0) { //像数据库查询数据
    this.data.checkoutList = [];
    db.collection(listName).skip(skipIndex).where(this.data.conditions).get({ //从skipindex开始加载数据
      success: res => {
         this.queryList('sell_news', 0)
        this.data.checkoutList.push(...res.data)//添加新的数据
          // this.data.checkoutList = [...new Set(this.data.checkoutList)];  //去重
        this.setData({
          checkoutList: this.data.checkoutList,
        })
        wx.showToast({
          title: '加载成功',
        })
       
        wx.stopPullDownRefresh();
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    let that = this;
    if (app.globalData.userInfo.permissions === 'admin') {
      this.setData({
        auditType: "audit_admin"
      })
    }
    if (this.data.auditType === "audit_user") {
      this.setData({
        'conditions._id': _.in(app.globalData.userInfo.publishList)
      })
    }
    this.queryList('checkout_news',0)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // if (app.globalData.userInfo.permissions === 'admin') {
    //   this.queryList('find_newsList', this.data.checkoutList.length)
    // }else{
      
    // }
    this.queryList('checkout_news',0)
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