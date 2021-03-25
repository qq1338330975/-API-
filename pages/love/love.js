
const API_BASE_URL = 'http://localhost:3000';
const app = getApp();

Page({
  data: {
    isPlay: " ",
    song: [],
    innerAudioContext: {},
    show: true,
    showLyric: true,
    songid: [],
    history_songId: [],
    PreSrc: " ",
    minute: 0, //分钟
    second: 0, //秒
    timer: null,
    score: 0,
    fristminute: 0,
    fristsecond: 0,
    scoreX:0,
    key:true
  },


  // onLond,第一次进入则获取到index.js传来的歌曲id --> id传给wx.request的URL，获取到歌曲详情 -->
  onShow: function (options) {   //onShow监听页面显示
    console.log(this.data.isPlay)
    this.getTabBar().setData({
      isShow_playing: true,
      isShow_me: false,
      isShow_index: false
    })
    this.play();
    this.stopTimer();
    this.startTimer();
  },
  play(audioid) {
    const audioId = audioid == undefined ? app.globalData.songId : audioid; //从全局变量中获取

    const innerAudioContext = wx.createInnerAudioContext()
    this.setData({
      innerAudioContext,
      // isPlay: true
    })
    wx.request({
      url: API_BASE_URL + '/song/url',
      data: {
        id: audioId
      },
      success: res => {
        // console.log('歌曲音频url:',res)
        if (res.data.data[0].url === null) {  //如果是MV 电台 广告 之类的就提示播放出错，并返回首页
          // console.log('播放出错')
          wx.showModal({
            content: '服务器开了点小差~~',
            cancelColor: '#DE655C',
            confirmColor: '#DE655C',
            showCancel: false,
            confirmText: '返回',
            complete() {
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          })
        } else {
          this.createBgAudio(res.data.data[0]);

          // this.frontAudio(res.data.data[0])
        }
      }
    })


    //获取到歌曲音频，则显示出歌曲的名字，歌手的信息，即获取歌曲详情；如果失败，则播放出错。
    wx.request({
      url: API_BASE_URL + '/song/detail',
      data: {
        ids: audioId    //必选参数ids
      },
      success: res => {
        // console.log('歌曲详情', res);
        if (res.data.songs.length === 0) {
          // console.log('无法获取到资源')
          wx.showModal({
            content: '服务器开了点小差~~',
            cancelColor: '#DE655C',
            confirmColor: '#DE655C',
            showCancel: false,
            confirmText: '返回',
            complete() {
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          })
        } else {
          var musicTime = parseInt(res.data.songs[0].dt / 1000),
          minute = parseInt(musicTime / 60),
          second = musicTime - minute * 60;

        this.setData({
          song: res.data.songs[0],  //获取到歌曲的详细内容，传给song
          minute: minute,
          second: second
        })
        console.log(this.data.minute + ":" + this.data.second);
        app.globalData.songName = res.data.songs[0].name;
      }

      },
    })
  },
  // // 设置后台音乐
  createBgAudio(res) {
    console.log(res);
    const bgAudioManage = wx.getBackgroundAudioManager(); //获取全局唯一的背景音频管理器。并把它给实例bgAudioManage
    app.globalData.bgAudioManage = bgAudioManage;         //把实例bgAudioManage(背景音频管理器) 给 全局
    bgAudioManage.title = 'title';                        //把title 音频标题 给实例
    if(this.data.PreSrc != res.url){
      bgAudioManage.src = res.url;
    }
    this.setData({
      PreSrc : res.url,
    })
    const history_songId = this.data.history_songId
    const historySong = {
      // id: res.id
      id: app.globalData.songId,
      songName: app.globalData.songName
    }
    history_songId.push(historySong)
    // res.url 在createBgAudio 为 mp3音频  url为空，播放出错

    bgAudioManage.onPlay(res => {                         // 监听背景音频播放事件
      
      console.log(1111);
      this.setData({
        history_songId
      })
    });
    bgAudioManage.onEnded(() => {                  //监听背景音乐自然结束事件，结束后自动播放下一首。要注意的是，要传入url,再然后play(),才能成功。
      const bgAudioManage = app.globalData.bgAudioManage;
      bgAudioManage.pause();
      this.stopTimer();
      const { isPlay } = this.data;
      if (isPlay) {
        this.setData({
          isPlay: !isPlay,
          scoreX:0,
          fristminute:0,
          fristsecond:0
        })
      }
    })
    wx.setStorageSync('historyId', history_songId); //把historyId存入缓存
  },



  // 播放和暂停
  handleToggleBGAudio() {
    // const innerAudioContext = app.globalData.innerAudioContext;
    const bgAudioManage = app.globalData.bgAudioManage;
    const { isPlay } = this.data;
    if (isPlay) {
      bgAudioManage.pause();
      this.stopTimer();
      // innerAudioContext.pause();handleToggleBGAudio
    } else {
      bgAudioManage.play();
      if(this.data.key){
        this.setData({
          key : false
        })
        this.startTimer();
      }
      
      // innerAudioContext.play();
    }
    this.setData({
      isPlay: !isPlay
    })
    console.log(this.data.isPlay)
  },

  // 点击切换歌词和封面
  showLyric() {
    const { showLyric } = this.data;
    this.setData({
      showLyric: !showLyric
    })
  },

  go_index: function () {
    // console.log(1)
    // wx.reLaunch({
    //   url:'../pages/index/index'
    // })
    wx.navigateBack({
      delta: 1
    })
  },

  go_lastSong: function () {
    this.stopTimer();
    let that = this;
    const lastSongId = app.globalData.waitForPlaying;
    console.log(lastSongId.length);
    for (var i = 0; i < lastSongId.length; i++) {
      lastSongId[i] == app.globalData.songId;
    }
    const songId = lastSongId[Math.floor(Math.random() * lastSongId.length)]; //随机选取lastSongId数组的一个元素
    console.log(songId)
    that.data.songid = songId;
    this.play(songId)//传进play()方法中
    app.globalData.songId = songId;

  },

  //音乐播放控制：
  // stopSlider: function (e) {

  // },
  onmove:function(){
      this.stopTimer();
  },
  onChange(e) {
    this.data.score = parseInt(e.detail.x);
  },
  timeSliderChanged: function () {
    const bgAudioManage = app.globalData.bgAudioManage;
    var seekTime = bgAudioManage.duration * this.data.score / 278;
    bgAudioManage.seek(seekTime);
    this.startTimer();
    // console.log('当前值', e.detail.value, "isplay = " + this.data.isPlay);

  },
  //开始定时器
  startTimer() {
    var that = this;
    that.timer = setInterval(function () {
      that.timeRun();
    }, 1000)
  },

  //清除定时器
  stopTimer() {
    clearInterval(this.timer);
    this.setData({
      key : true
    })
  },

  // targetTime(){
  //   // console.log(this.data.x);
  //   console.log(this.data.score);
  // }

  timeRun() {
    var that = this;
    var bgAudioManage = app.globalData.bgAudioManage;
    var minute = parseInt(bgAudioManage.currentTime / 60),
        second = parseInt(bgAudioManage.currentTime) - minute * 60, 
        scoreX = (bgAudioManage.currentTime * 278) / bgAudioManage.duration; //
     that.setData({
          fristminute: minute,
          fristsecond: second,
          scoreX:scoreX
        })
  }
})