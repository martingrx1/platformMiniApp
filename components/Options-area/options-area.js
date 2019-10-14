// pages/index/components/Options-area/options-area.js
const db = wx.cloud.database();
const _ = db.command;
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */

  lifetimes: {
    created() { //获取当前登录的用户信息
      this.setData({
        fq_info: app.globalData.userInfo
      })
    }
  },

  properties: {
    optionsList: {
      type: Array
    },
    js_info: {
      type: Object //发布信息的用户 === 接收对话者
    },
    msgInfo: { //进入审核页面传给tabbar处理的信息
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    fq_info: "", //当前登录的用户的信息 === 发起会话者
  },

  /**
   * 组件的方法列表
   */
  methods: {

    auditYes(msgInfo) { //审核成功
      let msgType = 'find_newsList';
      if (msgInfo.publishInfo.type != '遗失' && msgInfo.publishInfo.type != '拾取') {
        msgType = 'sell_newsList'
      }
      //有一个坑,_openid无法赋值
      db.collection(msgType).add({ //往向用户显示的 找寻表添加响应的记录
        data: {
          publishInfo: msgInfo.publishInfo,
          user_wxInfo: msgInfo.user_wxInfo,
          stuId: msgInfo.stuId,
          time: msgInfo.time,
          displayTime: msgInfo.displayTime,
          isCheckout: true,
          resolve: '未解决'
        },
        success: res => {
          db.collection('user_info').where({ //查询被审核的用户的信息
            stuId: msgInfo.stuId
          }).get({
            success: get_res => {
              let list = get_res.data[0].publishList; //获取用户发布信息的审核列表
              let index = list.indexOf(msgInfo._id); //该条审核消息的index
              list.splice(index, 1);
              //从该用户的审核列表删除该条记录
              wx.cloud.callFunction({ //通过云函数给对话双方添加对话信息   
                name: 'update_publishList',
                data: {
                  list: list,
                  userid: get_res.data[0]._id
                },
                success: function(cloud_res) {
                  wx.showToast({
                    title: '审核成功',
                  })
                  wx.cloud.callFunction({ //通过云函数给更新openid    
                    name: 'update_openid',
                    data: {
                      collectionName: msgType,
                      _id: res._id,
                      _openid: msgInfo._openid
                    },
                    success: function(cloud_res) {
                      console.log('更新_openid成功')
                    },
                    fail: console.error
                  })
                  wx.cloud.callFunction({ //通过移除审核消息      
                    name: 'remove_checkoutNews',
                    data: {
                      collectionName: 'checkout_news',
                      _id: msgInfo._id,
                    },
                    success: function(cloud_res) {
                      console.log('移除成功');
                      wx.navigateBack({
                        delta: 1
                      })
                    },
                    fail: console.error
                  })
                },
                fail: console.error
              })
            }
          })
        },
        fail: err => {
          console.log(err)
        }
      })
    },
    auditNo(msgInfo) { //审核不通过


      console.log(msgInfo._id)

      wx.cloud.callFunction({ //通过云函数给对话双方添加对话信息   
        name: 'audit_false',
        data: {
          collectionName: 'checkout_news',
          _id: msgInfo._id
        },
        success: function(cloud_res) {
          wx.showToast({
            title: '审核成功',
          })
          wx.navigateBack({
            delta: 1
          })
          fail: console.error
        },
        fail: console.error
      })


    },
    nav(path) { //导航功能
      wx.navigateTo({
        url: path,
      })
    },
    chat() {
      let chatInfo = {};
      let that = this;
      db.collection("chatList").where(_.or([{ //查询当前用户和消息发布者是否产生对话
        "fq_info.stuId": that.data.fq_info.stuId, //匹配已经发布的对话记录
        "js_info.stuId": that.data.js_info.stuId
      }, { //情况1 用户a发起对话请求   情况2 用户b发起的对话请求   他们所发起的对话请求属于相同的对话记录
        "fq_info.stuId": that.data.js_info.stuId,
        "js_info.stuId": that.data.fq_info.stuId
      }])).get({
        success: chatList_res => {
          if (chatList_res.data.length === 0) { //当没有产生过对话记录时
            db.collection("chatList").add({ //添加新的对话记录
              data: {
                fq_info: that.data.fq_info, //发起者信息
                js_info: that.data.js_info, //接收者信息
                chat: [] //聊天记录
              },
              success: add_res => {
                db.collection("chatList").doc(add_res._id).get({
                  success: get_chatInfo => {
                    wx.cloud.callFunction({ //通过云函数给对话双方添加对话信息
                      name: 'updata_chatList',
                      data: {
                        stuInfo: [that.data.fq_info._id, that.data.js_info._id, add_res._id] //传入数组更新
                      },
                      success: function(cloud_res) {
                        chatInfo = get_chatInfo.data; //数据库对话记录信息
                        wx.navigateTo({
                          url: '../chat/chat',
                          success: function(res) {
                            // 通过eventChannel向被打开页面传送数据
                            res.eventChannel.emit('acceptDataFromOpenerPage', {
                              data: chatInfo
                            })
                          }
                        })
                      },
                      fail: console.error
                    })
                  }
                })
              }
            })
          } else { //当已存在聊天记录时
            chatInfo = chatList_res.data[0]
            wx.navigateTo({
              url: '../chat/chat',
              success: function(res) {
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromOpenerPage', {
                  data: chatInfo
                })
              }
            })
          }
        }
      })
    },
    resolve(msgInfo) {
      let msgType = 'find_newsList';
      if (msgInfo.publishInfo.type != '遗失' || msgInfo.publishInfo.type != '拾到') {
        msgType = 'sell_newsList'
      }
      let that = this;
      wx.showModal({
        title: '提示',
        content: '确定该问题已解决',
        success(res) {
          if (res.confirm) {
            db.collection(msgType).doc(that.data.msgInfo._id).update({
              data: {
                resolve: '已解决'
              },
              success: res => {
                wx.navigateBack({
                  delta: 1
                })
                wx.showToast({
                  title: '操作成功',
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    handleTo_pubPage(e) {
      if (Object.keys(app.globalData.userInfo).length == 0) { //判断用户是否登录 未登录则跳转
        wx.showModal({
          showCancel: false,
          title: '温馨提示',
          content: '请登录后再使用该功能',
          success(res) {
            wx.switchTab({
              url: '../mine/mine',
            })
          }
        })
        return;
      }
      switch (e.currentTarget.dataset.iteminfo.methods) {
        case 'nav':
          this.nav(e.currentTarget.dataset.iteminfo.path);
          break;
        case 'chat':
          this.chat();
          break;
        case 'resolve':
          this.resolve(this.data.msgInfo);
          break;
        case 'auditYes':
          this.auditYes(this.data.msgInfo);
          break;
        case 'auditNo':
          this.auditNo(this.data.msgInfo);
          break;
        case 'disable':
          break;
      }
    }
  }
})