// pages/find/components/lose/lose.js
// var API = require('../../../../utils/api.js')
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },


  lifetimes: {
    attached: function () {

      let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
      let windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
      this.setData({
        scroll_height: windowHeight * 750 / windowWidth - (130) - 30
      })
      this.queryList('sell_newsList', 0, this.data.fliterType);
      // API.ajax('/findNews', function(res) {
      //   if (res.status === 200) {
      //     that.setData({
      //       view_newsList: res.data,
      //       fliter_newsList: res.data
      //     })
      //   }
      // })
    }

  },
  pageLifetimes: {
    show: function () {

      // 页面被展示
    },
    hide: function () {
      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    view_newsList: [], //传入的原始数据
    fliter_newsList: [], //用以进行筛选的数据
    current_index: -1, //当前点击的筛选框
    fliterType: { 'resolve': '未解决' },  //当前用户选择的筛选条件
    scroll_height: 0, //消息列表的高度
    isloading: false,
    isAllloading: false,//判断消息是否加载完成
    tabs: [{
      index: 0,
      title: '未解决',
      downlist: [{
        index: 0,
        title: '全部'
      },
      {
        index: 1,
        title: '未解决'
      },
      {
        index: 2,
        title: '已解决'
      }

      ]
    },
    {
      index: 1,
      title: '不限校区',
      downlist: [{
        index: 0,
        title: '不限校区'
      },
      {
        index: 1,
        title: '金银湖校区'
      },
      {
        index: 2,
        title: '常青校区'
      },
      {
        index: 3,
        title: '校外'
      }
      ]
    }, {
      index: 2,
      title: '全部物品',
      downlist: [{
        index: 0,
        title: '全部物品'
      },
      {
        index: 1,
        title: '手机等电子类'
      },
      {
        index: 2,
        title: '化妆品'
      },
      {
        index: 3,
        title: '个人生活用品'
      },
      {
        index: 4,
        title: '书籍'
      },
      {
        index: 5,
        title: '其他'
      }
      ]
    }, {
      index: 3,
      title: '全部方式',
      downlist: [{
        index: 0,
        title: '全部方式'
      },
      {
        index: 1,
        title: '出售'
      },
      {
        index: 2,
        title: '求购'
      }
      ]
    }, {
      index: 4,
      title: '时间',
      downlist: [{
        index: 0,
        title: '升序'
      },
      {
        index: 1,
        title: '降序'
      }
      ]
    }
    ],

  },

  /**
   * 组件的方法列表
   */
  methods: {
    queryList(listName, skipIndex = 0, fliter = {}) { //像数据库查询数据
      var that = this;
      this.loading(true, '正在加载') //开启刷新提示
      db.collection(listName).skip(skipIndex).where(fliter).get({ //从skipindex开始加载数据
        success: res => {
          this.setData({
            isloading: false
          })
          if (res.data.length < 1) { //当数据已经全部加载完成
            wx.showToast({
              title: '已无更多消息',
            })
            return;
          }
          that.loading(false, '', '加载成功'); //异常提示框 加载完成
          this.data.fliter_newsList.push(...res.data); //添加新的数据
          this.setData({
            fliter_newsList: this.data.fliter_newsList,
          })
        }
      })
    },
    refresh(listName, fliter = {}) { //像数据库查询数据
      var that = this;
      this.loading(true) //开启加载提示
      db.collection(listName).where(fliter).get({ //从skipindex开始加载数据
        success: res => {
          this.data.fliter_newsList = res.data; //添加新的数据
          this.setData({
            isloading: false,
            fliter_newsList: this.data.fliter_newsList,
          })
          that.loading(false); //隐藏提示框 加载完成
        }
      })
    },
    loading(status, startTips = '正在刷新', endTips = '刷新成功') { //控制提示框的显示与否
      if (!this.data.isloading) {
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

    upper: function (e) { //当滚动到顶部 刷新页面数据
      this.refresh('sell_newsList', this.data.fliterType)

    },
    lower() { //下拉加载
      this.queryList('sell_newsList', this.data.fliter_newsList.length, this.data.fliterType)
    },
    show_downlist(event) {
      if (this.data.current_index != -1) {
        this.reset_downlist();
        return;
      }
      let index = event.currentTarget.dataset.index;
      this.setData({
        current_index: index
      })
    },
    reset_downlist() {
      this.setData({
        current_index: -1
      })
    },
    sortNewsList(msg1, msg2, index = 0) {
      let time1 = msg1.time.split('/')[index]; //获取当前需要对比的时间
      let time2 = msg2.time.split('/')[index];

      if (time1 > time2) {
        return -1
      } else if (time1 < time2) {
        return 1
      } else {
        index++;
        if (index > 6) { //当匹配到最后一个数的时间为一样时,返回0 不进行排序
          return 0;
        }
        return this.sortNewsList(msg1, msg2, index); //递归调用,返回最后对比出来的值 
      }
    },
    sortForTime(index) {
      this.data.fliter_newsList.sort((msg1, msg2) => {
        if (index === 1) { //假如为降序
          return this.sortNewsList(msg1, msg2);
        } else {
          return -this.sortNewsList(msg1, msg2);
        }

      });
      this.setData({ fliter_newsList: this.data.fliter_newsList });
      this.reset_downlist();
    },


    fliter(event) {
      let cur_index = this.data.current_index; //获得当前用户点击的下标
      let option = this.data.tabs[cur_index].downlist[event.currentTarget.dataset.index]; //用户点击的筛选内容
      let fliterType = this.data.fliterType;
      let fliter_key = '';
      let fliter_value = option;
      switch (cur_index) {
        case 0: fliter_key = 'resolve'; break;
        case 1: fliter_key = 'publishInfo.location'; break;
        case 2: fliter_key = 'publishInfo.goodsType'; break;
        case 3: fliter_key = 'publishInfo.type'; break;
        case 4: this.sortForTime(fliter_value.index); return;
      }

      if (JSON.stringify(fliterType) == "{}") {
        fliterType[fliter_key] = fliter_value
      }
      for (const key in fliterType) {
        if (fliter_key === key) {  //当存在相同的筛选选项
          fliterType[key] = fliter_value.title;  //若是需要筛选的选项,添加相应的筛选选项
        } else {   //当不存在该筛选选项,则添加新的筛选选项
          fliterType[fliter_key] = fliter_value.title
        }
      }
      if (fliter_value.index === 0) {  //判断是否是全部选择 无需筛选的选项
        let len = Object.keys(fliterType).length;  //获取全部已选择的筛选项长度
        if (len === 1) {  //当为最后一个筛选项
          fliterType = {}  //清空所有筛选条件
        } else {  //若不是,则删除当前的筛选条件
          delete fliterType[fliter_key]
        }
      }
      this.queryList('sell_newsList', 0, fliterType)
      this.data.tabs[cur_index].title = option.title; //更新用户点击后的筛选栏的内容
      this.setData({
        fliterType: fliterType,
        fliter_newsList: [],
        tabs: this.data.tabs
      })
      this.reset_downlist();
    },
  }
})