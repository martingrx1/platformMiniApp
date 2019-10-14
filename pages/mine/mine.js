// pages/mine/mine.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogined: false,
    wx_userInfo: {},
    db_userInfo: {},
    stuId: '',
    userPassword: '',
    location: '金银湖校区',
    items: [{
        name: '金银湖校区',
        value: '金银湖校区',
        checked: 'true'
      },
      {
        name: '常青校区',
        value: '常青校区',
      }
    ],
    optionsList: [{
        methods: "nav",
        path: '../Mynews/mynews',
        icon: 'wxreply',
        title: '我的回复',
        badge_count: 0
      },
      {
        methods: "nav",
        path: '../Mypublish/mypublish',
        icon: 'wxfabu',
        title: '已发布消息'
      },
      {
        methods: "nav",
        path: '../audit/audit',
        icon: 'wxshenhe',
        title: '正在审核'
      },
      // {
      //   methods: "nav",
      //   icon: 'wxshoucang',
      //   title: '最近浏览'
      // },
      // {
      //   methods: "nav",
      //   icon: 'wxkefu',
      //   title: '联系客服'
      // },
    ]

  },
  bind_input(e) {
    let input_value = e.detail.value;
    if (e.currentTarget.dataset.type === 'stuId') {
      this.setData({
        stuId: input_value
      })
    } else {
      this.setData({
        userPassword: input_value
      })
    }
  },
  radioChange(e) {
    this.setData({
      location: e.datail.value
    })
  },

  registered(e) { //注册
    new Promise((resolve, reject) => {
        wx.getUserInfo({
          success: res => {
            console.log('获取信息成功')
            resolve();
          },
          fail: err => {
            wx.showModal({
              title: '提示',
              content: '授权失败',
            })
            console.log('拒绝授权')
            reject();
          }
        })
      }

    ).then(() => {
      if (!this.login_rules()) { //判断用户注册的学号是否符合规则
        this.errTips(300);
        return;
      }
      var that = this;
      db.collection('login_info').where({ //查询当前用户是否已经注册过
          stuId: this.data.stuId
        })
        .get({
          success: function(res) {
            if (res.data.length < 1) { //当前用户未注册过时
              db.collection('login_info').add({ //添加新的注册信息
                data: {
                  stuId: that.data.stuId,
                  password: that.data.userPassword
                },
                success: res => {
                  wx.showToast({
                    title: '注册成功',
                    icon: 'success'
                  })
                }
              });
              db.collection('user_info').add({ //添加新的用户信息,不是注册信息
                data: {
                  stuId: that.data.stuId, //用户的学号
                  // password:that.data.userPassword,  用户信息中不添加密码,保证安全
                  // location: that.data.location,
                  user_wxInfo: e.detail.userInfo, //用户的头像 用户名等信息
                  permissions: "user", //用户权限
                  location: that.data.location
                }
              })
            } else { //用户已注册过时取消本次注册
              wx.showToast({
                title: '该用户已存在',
                icon: 'none',
              })
            }
          }
        })
    }, () => {
      return;
    })

  },
  errTips(errCode) {
    let errTipsWord = "";
    let errIcon = 'none';
    switch (errCode) {
      case 100:
        errTipsWord = '该学号未注册';
      case 200:
        errTipsWord = '用户名或密码错误';
        break;
      case 300:
        errTipsWord = '请输入正确的轻工大学号';
        break;
    }
    wx.showToast({
      title: errTipsWord,
      icon: errIcon
    })
  },

  login_rules() { //判断用户的学号是否符合规则
    let reg = new RegExp('^(14|15|16|17|18|19)[0-9]{4}0[0-9]{3}$');
    if (reg.test(this.data.stuId)) { //符合规则
      return true;
    }
     return false;
  },

  checkoutLogin(e) { //登录验证
    new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: res => {
          console.log('获取信息成功')
          resolve();
        },
        fail: err => {
          wx.showModal({
            title: '提示',
            content: '授权失败',
          })
          console.log('拒绝授权')
          reject();
        }
      })
    }).then(() => {
      var that = this;
      let stuId = this.data.stuId;
      let password = this.data.userPassword;

      db.collection('login_info').where({ //查询是否已经注册
        stuId: stuId, //匹配用户名和密码
      }).get({
        success: function(res) {
          if (res.data.length < 1) { //当该用户未注册 提示用户注册
            that.errTips(100);
          } else { //当用户已经注册  
            db.collection('login_info').where({
              stuId: stuId,
              password: password
            }).get({
              success: login_res => { //判断用户名和密码是否正确
                if (login_res.data.length < 1) {
                  that.errTips(200); //不正确取消登录
                } else {
                  that.onGotUserInfo(e); //进行登录查询信息
                }
              }
            })
          }
        }
      })
    }, () => {
      return
    })
  },

  onGotUserInfo(e) { //点击登录按钮  登录功能
    var that = this;

    db.collection('user_info').where({ //查询该用户的个人信息
      stuId: this.data.stuId
    }).get({
      success: db_res => {
        let id = db_res.data[0]._id //获取当前用户id
        let token = that.randomString(); //获得一个随机token


        that.setData({ //更改当前页面的数据 显示用户信息
          isLogined: true,
          wx_userInfo: e.detail.userInfo,
          db_userInfo: db_res.data[0]
        })

        db.collection('user_info').doc(id).update({ //更新用户信息中的token
          data: {
            token: token
          },
          success: res => {
            wx.setStorage({ //往storage存储token
              key: 'token',
              data: token,
            });
            app.globalData.userInfo = db_res.data[0]; //更新当前登录的用户信息
          },
          fail: err => {
            console.error('[数据库] [更新记录] 失败：', err)
          }
        })
      }
    })
  },


  signout() {
    var that = this;
    that.setData({
      isLogined: false
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
    if (Object.keys(app.globalData.userInfo).length != 0 || JSON.stringify(app.globalData.userInfo) == 'undefined') {
      this.setData({
        isLogined: true,
        db_userInfo: app.globalData.userInfo,
        wx_userInfo: app.globalData.userInfo.user_wxInfo
      });
    }
  },


  randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
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