let API_HOST = "http://xxx.com/xxx";
let DEBUG = true;// 切换数据入口
var Mock = require('./mock/mock.js') // require是相对路径
function ajax(data = '', fn, method = "get", header = {}) {
  if (!DEBUG) {
    wx.request({
      url: config.API_HOST + data,
      method: method ? method : 'get',
      data: {},
      header: header ? header : { "Content-Type": "application/json" },
      success: function (res) {
        fn(res);
      }
    });
  } else {
    // 模拟数据
    var trad_news = Mock.mock({
      'error_code': '',
      'error_msg': '',
      'status': 200,
       'data|10' : [{
        'id|+1': 1,
         "price|50-1000": 100,
        'img': "@image('200x100', '#4A7BF7','#fff','pic')",
        'title': '@ctitle(5,12)',
         'content':'@ctitle(10,200)',
        "type|1": [
          "遗失",
          "拾到",
        ],
        "location|1": [
          "金银湖校区",
          "常青校区",
          "校外"
        ],
        "goodsType|1": [
          "饭卡",
          "手机",
          "用品"
        ],
        'userNm':'@csentence(3, 8)',
         'date': '@date("yyyy-MM-dd")',
      }]
    })
    var find_news = Mock.mock({
      'error_code': '',
      'error_msg': '',
      'status': 200,
      'data|10': [{
        'id|+1': 1,
        'img': "@image('200x100', '#4A7BF7','#fff','pic')",
        'title': '@ctitle(5,12)',
        'content': '@ctitle(10,200)',
        "type|1": [
          "遗失",
          "拾到",
        ],
        "location|1": [
          "金银湖校区",
          "常青校区",
          "校外"
        ],
        "goodsType|1": [
          "饭卡",
          "手机",
          "用品"
        ],
        'userNm': '@csentence(3, 8)',
        'date': '@date(MM-dd)',
        'time': '@time(HH:mm)'

      }]
    })
   
    switch (data) {
      case '/findNews': fn(find_news); break;
      case '/tradNews': fn(trad_news); break;
    }
 
  }
}
module.exports = {
  ajax: ajax
}