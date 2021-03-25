const API = require('../../API/api');
const app = getApp();


Page({
  
  data: {
    toplists0:[],
    toplists1:[],
    toplists2:[],
    toplists3:[],
    songsheet: []
  },

 
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    });
    this.getTopList();
    this.getsongsheet();
  },
  getsongsheet: function () {
    
    API.getsongsheet({
      order: 'hot'
    }).then(res => {
      wx.hideLoading()
      if (res.code === 200) {
        console.log(res.playlists)
        this.setData({
          songsheet: res.playlists
        })
      }
    })
  },
  
  getTopList: function () {
    
    API.getTopList({
      idx:0,
    }).then(res => {
      wx.hideLoading()
      console.log(res)
        this.setData({
          toplists0: res.list[0]
        })
    })

    API.getTopList({
      idx:1,
    }).then(res => {
      // console.log(res)
        this.setData({
          toplists1: res.list[1]
        })
    })

    API.getTopList({
      idx:2,
    }).then(res => {
      // console.log(res)
        this.setData({
          toplists2: res.list[2]
        })
    })


    API.getTopList({
      idx:3,
    }).then(res => {
      // console.log(res)
        this.setData({
          toplists3: res.list[3]
        })
    })
  },

  go_toplist0:function(){
    wx.navigateTo({
      url: '../toplist0/toplist0',
    })
  },
  go_toplist1:function(){
    wx.navigateTo({
      url: '../toplist1/toplist1',
    })
  },
  go_toplist2:function(){
    wx.navigateTo({
      url: '../toplist2/toplist2',
    })
  },
  go_toplist3:function(){
    wx.navigateTo({
      url: '../toplist3/toplist3',
    })
  },
  handleSheet: function (event) { //event 对象，自带，点击事件后触发，event有type,target，timeStamp，currentTarget属性
    // console.log(event)
    const sheetId = event.currentTarget.dataset.id; //获取到event里面的歌曲id赋值给audioId
    wx.navigateTo({                                 //获取到id带着完整url后跳转到play页面
      url: `./moremore_sheet?id=${sheetId}`
    })
  },
})