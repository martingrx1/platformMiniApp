 // pages/index/components/NewsList/newsList.js
 Component({
   /**
    * 组件的属性列表
    */
   lifetimes: {
      //适应性计算消息列表的高度,以供scroll-view可以滚动
   },

   properties: {
     newsList: {   //父组件传来的消息列表
       type: Array
     },
     isAllloading:{
       type:Boolean
     },
     newsType:{  //消息的类型
       type:String
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
     handleTo_detailPage(event) {  //点击跳转函数
       let that = this;
       wx.navigateTo({
         url: '../DetailPage/detailPage',
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
             data: event.currentTarget.dataset.item,  //往详情页传入当前单条信息
             newsType:that.data.newsType  //消息类型
           })
         }
       })
     },
     previewImg(e) {
       let that = this;
       wx.previewImage({
         current: e.currentTarget.dataset.path, // 当前显示图片的http链接
         urls: e.currentTarget.dataset.pathlist // 需要预览的图片http链接列表
       })
     },

   }
 })