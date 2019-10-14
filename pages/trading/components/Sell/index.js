// pages/find/components/Seek/seek.js
const db = wx.cloud.database();
var app = getApp();
var util = require('../../../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  lifetimes: {
    created() {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    },
    attached: function () {
      if (Object.keys(app.globalData.userInfo).length == 0) {  //判断用户是否登录 未登录则跳转
        wx.showModal({
          showCancel: false,
          title: '温馨提示',
          content: '请登录后再使用该功能',
          success(res) {
            wx.switchTab({
              url: '../mine/mine',
            })
            return;
          }
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: {},
    editPrice:'',
    selectPrice_index:-1,
    publishInfo: {
      title: '',
      content: '',
      location: '选择交易地点',
      goodsType: '选择交易物品',
      type: '选择交易方式',
      imgPath: [],
      price:-1
    },
    price:[5,10,20,30,50,100,200],
    typeList: ['出售', '求购'],
    itemList: ['化妆品', '手机等电子类', '书籍', '个人生活用品', '其它'],
    locationList: ['金银湖校区', '常青校区', '校外'],
    rules_num: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bind_input(e) {
      let input_value = e.detail.value;
      if (e.currentTarget.dataset.type === 'title') {
        this.setData({
          'publishInfo.title': input_value
        })
      } else {
        this.setData({
          'publishInfo.content': input_value
        })
      }
    },
    editPriceInput(e){
        this.setData({
          'publishInfo.price': e.detail.value ,
          editPrice:e.detail.value 
        })
    },
    editPriceTap(){
      this.setData({
        selectPrice_index:7
      })
    },
    selectPrice(e){
      this.setData({
        'publishInfo.price': this.data.price[e.currentTarget.dataset.index],
        selectPrice_index: e.currentTarget.dataset.index
      })
    },
    pop_selectGoodsType() {
      var that = this;
      wx.showActionSheet({
        itemList: that.data.itemList,
        success(res) {
          that.setData({
            'publishInfo.goodsType': that.data.itemList[res.tapIndex],
            rules_num: that.data.rules_num + 1
          })
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    },
    pop_selectLocation() {
      var that = this;
      wx.showActionSheet({
        itemList: that.data.locationList,
        success(res) {
          that.setData({
            'publishInfo.location': that.data.locationList[res.tapIndex],
            rules_num: that.data.rules_num + 1
          })
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    },
    pop_selectType() {
      var that = this;
      wx.showActionSheet({
        itemList: that.data.typeList,
        success(res) {
          that.setData({
            'publishInfo.type': that.data.typeList[res.tapIndex],
            rules_num: that.data.rules_num + 1
          })
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    },
    upload_photo() {
      var that = this;
      wx.chooseImage({
        count: 6,
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePaths = res.tempFilePaths
          if (tempFilePaths.length + that.data.publishInfo.imgPath.length > 6) {
            wx.showToast({
              title: '图片最多为6张',
              duration: 2000
            })
            return
          }
          tempFilePaths.forEach(img => {
            that.data.publishInfo.imgPath.push(img)
          });

          that.setData({
            'publishInfo.imgPath': that.data.publishInfo.imgPath
          })

        }
      })
    },
    delete_photo(e) {
      let index = e.currentTarget.dataset.index;
      this.data.publishInfo.imgPath.splice(index, 1);
      this.setData({
        'publishInfo.imgPath': this.data.publishInfo.imgPath
      })
    },

    pulish_info() {
      let that = this;
      const _ = db.command;
      if (this.check_input()) { //检测发布是否符合规则
        return; //不符合规则停止发布
      }
      console.log(that.data.userInfo)

      db.collection('checkout_news').add({ //往数据库添加该条发布记录
        data: { //发布记录的字段数据
          publishInfo: that.data.publishInfo, //发布记录的内容
          stuId: that.data.userInfo.stuId, //发布用户的学号
          user_wxInfo: that.data.userInfo.user_wxInfo, //发布用户的微信信息
          time: util.formatTime(new Date()),
          displayTime: util.displayTime(new Date()),
          resolve: '未解决',
          isCheckout: false,
          aduit:true
        },
        success: add_res => {
          db.collection('user_info').doc(that.data.userInfo._id).update({ //发布者添加相应的发布的信息的id 以便后期使用
            data: {
              publishList: _.push(add_res._id)
            },
            success: res => {
              app.globalData.userInfo.publishList.push(add_res._id);
            }

          })

          let path = that.data.publishInfo.imgPath; //上传的临时路径
          let temPath = []; //用于存放云存储路径

          wx.showLoading({
            title: '正在发布消息',
          })

          for (let i = 0, len = path.length; i < len; i++) { //存储图片进入云存储
            wx.cloud.uploadFile({
              cloudPath: 'news_image/find_image/' + add_res._id + '/' + i + '.png', // 上传至云端的路径和拼接文件名 以发布消息id为文件名
              filePath: path[i], // 小程序临时文件路径
              success: img_res => {
                temPath.push(img_res.fileID) //保存文件路径 fileID为文件路径
                if (temPath.length === len) { //当所有图片已经上传
                  db.collection('checkout_news').doc(add_res._id).update({ //更新当前消息的图片路径
                    data: {
                      'publishInfo.imgPath': temPath
                    },
                    success: update_res => {

                    },
                    fail: err => {
                      console.error('文件上传出错' + err)
                    }
                  })
                }
              },
              fail: console.error
            })
          }

          wx.hideLoading() //隐藏提示框
          wx.showToast({
            title: '发布成功',
          })
          that.clear_edit(); //清除输入内容

        }
      })
    },

    check_input() {
      let reg = new RegExp("^([1-9][0-9]*)$")
      if (this.data.publishInfo.title === '' || this.data.publishInfo.content === '' || this.data.rules_num < 3 ) {
        wx.showToast({
          title: '请填写正确信息',
          icon: 'none',
          duration: 1000
        })
        return true;
      }
      return false;
    },
    clear_edit() {
      for (const key in this.data.publishInfo) {
        if (key === 'imgPath') {
          this.data.publishInfo[key] = []
        } else {
          this.data.publishInfo[key] = ''
        }
      }
      this.setData({
        publishInfo: this.data.publishInfo,
        rules_num: 0
      })
    }
  }
})