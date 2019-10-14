// pages/search/search.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchWord: '',
    searchList: []
  },

  inputSearchWord(e) {
    this.setData({
      searchWord: e.detail.value
    })
  },

  search() {
    wx.showLoading({
      title: '正在进行搜索',
    });  
    db.collection('find_newsList').where({    //使用正则查询，实现对搜索的模糊查询
      'publishInfo.title': db.RegExp({    
        regexp: this.data.searchWord,
             //从搜索栏中获取的value作为规则进行匹配。
            options: 'i',
             //大小写不区分
           
      })  
    }).get({   
      success: res => {
        db.collection('find_newsList').where({    //使用正则查询，实现对搜索的模糊查询
          'publishInfo.title': db.RegExp({
            regexp: this.data.searchWord,
            //从搜索栏中获取的value作为规则进行匹配。
            options: 'i',
            //大小写不区分

          })
        }).get({
          success:res =>{
            this.data.searchList.push(...res.data)
            this.setData({
              searchList: res.data
            })   
          }
        })




        wx.hideLoading();
        wx.showToast({
          title: '搜索完成',
        });    
        this.data.searchList.push(...res.data)
      this.setData({     
          searchList: res.data    
        })   
      }  
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    console.log('d')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})