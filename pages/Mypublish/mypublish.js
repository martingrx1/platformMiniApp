// pages/Mypublish/mypublish.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titleIndex:0,
    myPublish: [],
    block: [{ title: '失物招领', toLoad: 'find_newsList' }, 
            { title: '二手交易', toLoad: 'sell_newsList' }, 
            // {title: '悬赏跑腿', toLoad: 'find_newsList' }
            ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    this.queryList('find_newsList',0)
  },

  changeShow(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
     titleIndex:index
    })
    this.refresh(this.data.block[index].toLoad)
  },


  queryList(listName, skipIndex = 0) { //像数据库查询数据
    var that = this;
    db.collection(listName).where({
      stuId: app.globalData.userInfo.stuId
    }).skip(skipIndex).get({   //从skipindex开始加载数据
      success: res => {
        if (res.data.length < 1) {  //当数据已经全部加载完成
          wx.showToast({
            title: '加载成功',
          })
          return;
        }
        this.data.myPublish.push(...res.data);  //添加新的数据
        this.setData({
          myPublish: this.data.myPublish,
        })
     
      }
    })
  },

  refresh(listName) { //像数据库查询数据
    this.loading(true) //开启加载提示
    db.collection(listName).where({
      stuId: app.globalData.userInfo.stuId
    }).get({ //从skipindex开始加载数据
      success: res => {
        this.data.myPublish = res.data; //添加新的数据
        this.setData({
          isloading: false,
          myPublish: this.data.myPublish,
        })
        this.loading(false); //隐藏提示框 加载完成
        wx.stopPullDownRefresh();
      }
    })
  },
  loading(status) {  //控制提示框的显示与否
    if (!this.data.isloading) {
      if (status) {
        wx.showLoading({
          title: '正在刷新',
        })
        this.setData({
          isloading: true
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '刷新成功',
        })
      }
    }
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
    let index = this.data.titleIndex;
    this.refresh(this.data.block[index].toLoad)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.queryList('find_newsList', this.data.myPublish.length)
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})