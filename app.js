 //app.js
 wx.cloud.init({
   env: 'whpu-ugbay'
 })
 const db = wx.cloud.database();
 App({

   /**
    * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
    */
   onLaunch: function() {
    //  wx.checkSession({　　　　
    //    success: function(res) {　　　　　　
    //      console.log("处于登录态");　　　　
    //    },
    //    fail: function(res) {　　　　　
    //      wx.removeStorage({
    //        key: 'token',
    //        success: function(res) {console.log('移除token成功')},
    //      })　　　　
    //    }　　
    //  })

     let that = this;
     wx.getStorage({ //获取当前用户是否有token 若无token则需要重新登录
       key: 'token',
       success(res) { //当存在token
         wx.getUserInfo({ //当用户有token 获取用户的微信信息 跳转至用户页面
           success: function(wx_res) {
             db.collection('user_info').where({ //查询当前用户的信息
               token: res.data
             }).get({ //查询成功 赋值给页面的数据
               success: db_res => {
                 that.globalData.userInfo = db_res.data[0];
               }
             })
           },
           fail:err=>{
             wx.showModal({
               title: '提示',
               content: '需要重新授权',
             })
           }
         })
       }
     })
   },

   /**
    * 当小程序启动，或从后台进入前台显示，会触发 onShow
    */
   onShow: function(options) {

   },

   /**
    * 当小程序从前台进入后台，会触发 onHide
    */
   onHide: function() {

   },

   globalData: {
     userInfo: {}  //当前登录的用户信息
   },


   /**
    * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
    */
   onError: function(msg) {

   }
 })