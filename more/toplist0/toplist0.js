// const API_BASE_URL = 'http://neteasecloudmusicapi.zhaoboy.com';
const API_BASE_URL = 'http://localhost:3000';
// const API_BASE_URL = 'http://192.168.1.2:3000';

const app = getApp();

Page({

  data: {
    songList:[]
  },

  onLoad: function (options) {
    console.log(options);
    wx.showLoading({
      title: '加载中',
    });
    const sheetId = 2998169061;
    // console.log(sheetId)
    wx.request({
      url: API_BASE_URL + '/playlist/detail',
      data: {
        id: sheetId    //http://neteasecloudmusicapi.zhaoboy.com/song/url?id=xxx,id为必选参数
      },
      success: res => {
        // console.log(res.data.playlist.trackIds) //打印出歌曲ID数组
        // console.log(res.data.playlist.trackIds.length) //打印出歌曲ID数组长度
          // console.log(res.data.playlist.tracks);
          // console.log(res.data.playlist.trackIds[i].id)
        const waitForPlay = new Array;
        for (let i = 0; i <= res.data.playlist.trackIds.length - 1;i++){ //循环打印出其id
          waitForPlay.push(res.data.playlist.trackIds[i].id) //循环push ID 到waitForPlay数组
          app.globalData.waitForPlaying = waitForPlay  //让waitForPlay数组给全局数组
          // console.log(app.globalData.waitForPlaying)
        }
        wx.hideLoading()
        this.setData({
          songList: res.data.playlist.tracks
        })  
      }
    })
  },
  handlePlayAudio: function (event) { //event 对象，自带，点击事件后触发，event有type,target，timeStamp，currentTarget属性
    // console.log(event)
    const audioId = event.currentTarget.dataset.id; //获取到event里面的歌曲id赋值给audioId
    wx.navigateTo({                                 //获取到id带着完整url后跳转到play页面
      url: `../../play/play?id=${audioId}`
    })
    wx.navigateTo({                                 //获取到id带着完整url后跳转到love页面
      url: `../../pages/love/love?id=${audioId}`
    })
  },
})