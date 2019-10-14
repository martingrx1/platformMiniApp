// pages/DetailPage/detailPage.js
const db = wx.cloud.database();
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    singleMsg:{},
    publisher_info:{},
    optionsList_index:0,
    /*
    配置说明:
必填: 1.methods: 该选项点击后的效果
        nav:路由跳转
        audit:审核发布与否
        disable:无法点击,点击没效果

     2.title:该选项的标题名称
选填: 
    1.path:nav跳转的路径
    2.color:该选项的背景颜色
    3.icon:该选项的icon图标
    4.flex:flex所占据的宽度
     */
    optionsList: [
      [
        // {methods: "remaker", icon: 'wxreply', title: '收藏', flex: 1 },
        // {methods: "nav", path: '../Mypublish/mypublish', icon: 'wxreply', title: '转发', flex: 1 },
        // {methods: "comments", path: '../Mypublish/mypublish', icon: 'wxreply', title: '评论', flex: 1 },
        {methods: "chat",path: '../chat/chat', title: '联系发布者', flex: 1 }
      ],
      [
        // {methods: "nav", path: '../Mypublish/mypublish', icon: 'wxreply', title: '转发', flex: 3 },
        {methods: "resolve", color:'skyblue', title: '问题已解决', flex: 7 }
      ],
      [
        {methods: 'auditNo', path: '',icon: 'wxreply', title: '审核不通过', flex: 1 },
        {methods: 'auditYes', path: '',title: '审核通过', flex: 1 }
      ],
      [
        { methods: 'disable',color:'rgb(155, 151, 151)', title: '消息正在审核' }
      ],
      [
        { methods: 'disable',color:'rgb(155, 151, 151)', title: '该问题已解决' }
      ],
      [
        { methods: 'disable', color: 'red', title: '审核不通过' }
      ]
     
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */


  onLoad: function(option) {
    var that = this;
   
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      let index = 0;

      if(data.data.resolve === '已解决'){index = 4}
     
      else if (Object.keys(app.globalData.userInfo).length != 0){
        index = app.globalData.userInfo.stuId === data.data.stuId ? 1 : 0;  //判断当前页面是又哪个用户进入的,默认为审核状态的用户
      }

      if (data.newsType === 'audit_user'){  //审核状态的用户
        index = 3
        if (data.data.audit === false) { index = 5 }
      }else if (data.newsType === 'audit_admin'){  //审核状态的管理员
        index = 2
        if (data.data.audit === false) { index = 5 }
      }
     
      db.collection("user_info").where({   
        stuId:data.data.stuId
      }).get({
        success:get_res=>{
          that.setData({
            singleMsg: data.data,   //获得该条信息的内容
            publisher_info:get_res.data[0], //获取信息发布者的信息
            optionsList_index: index  //判断当前页面是不是登录的用户所发布,是就更改底部tabbar栏的内容
          })
        },
        fail:err=>{
          console.log(err)
        }
      
      })
     
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})