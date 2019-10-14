// pages/index/index.js

const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'http://www.whpu.edu.cn/img/banner07.jpg',
      'http://www.whpu.edu.cn/img/banner02.jpg',
      'http://www.whpu.edu.cn/img/banner03.jpg'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    all_newsList: [],
    isloading:false,  //判断是否正在加载
    isAllloading: true,//判断消息是否加载完成
  },
  changeIndicatorDots: function(e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function(e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function(e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function(e) {
    this.setData({
      duration: e.detail.value
    })
  },
  handleToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.queryList('find_newsList',0)  //加载消息
  },

  loading(status, startTips = '正在刷新', endTips = '刷新成功') { //控制提示框的显示与否
    if (!this.data.isloading) {  //假如当前显示了加载框,则不再显示,控制每次只显示一个加载框
      if (status) {
        wx.showLoading({
          title: startTips,
        })
        this.setData({
          isloading: true
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: endTips,
        })
      }
    }
  },

  queryList(listName, skipIndex = 0) { //向数据库查询数据
    var that = this;
    this.loading(true, '正在加载') //开启刷新提示
    db.collection(listName).skip(skipIndex).get({ //从skipindex开始加载数据
      success: res => {
        this.setData({  //隐藏加载框
          isloading: false
        })
        if (res.data.length < 1) { //当无数据或已全部加载
          wx.showToast({
            title: '已无更多数据',
          })
          return;
        }
        this.queryList('sell_newsList', this.data.all_newsList.length)  //下拉加载功能
        that.loading(false, '', '加载成功'); //隐藏提示框 加载完成
        this.data.all_newsList.push(...res.data); //添加新的数据
        this.setData({
          all_newsList: this.data.all_newsList,
        })
      }
    })
  },


/**
 * 生命周期函数--监听页面初次渲染完成
 */
onReady: function() {

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
  this.queryList('find_newsList', this.data.all_newsList.length)  //下拉加载功能
},

/**
 * 用户点击右上角分享
 */
onShareAppMessage: function() {

}
})