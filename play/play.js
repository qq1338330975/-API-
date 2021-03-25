// play.js
const API_BASE_URL = 'http://localhost:3000';
// const API_BASE_URL = 'http://192.168.1.2:3000';
const app = getApp();

Page({

  data: {
    isPlay: '',
    song: [],
    innerAudioContext: {},
    show: true,
    showLyric: true,
    songid: [],
    history_songId: [],
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

  onLoad: function (options) {
    console.log(options.id);
    wx.navigateTo({
      url: `../pages/me/me?song=` + options.id
    })
    const audioid = options.id; // onLoad()后获取到歌曲视频之类的id
    this.play(audioid); //把从wxml获取到的值传给play()
  },

  play: function (audioid) {
    console.log(this.data.timer);
    const audioId = audioid;
    // console.log(that.data.songid)
    app.globalData.songId = audioId;  //让每一个要播放的歌曲ID给全局变量的songId
    console.log('把', app.globalData.songId, '传入全局变量中')

    const innerAudioContext = wx.createInnerAudioContext();
    this.setData({
      innerAudioContext,
      isPlay: true
    })

    // 请求歌曲音频的地址，失败则播放出错，成功则传值给createBgAudio(后台播放管理器，让其后台播放)
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
  createBgAudio(res) {

    const bgAudioManage = wx.getBackgroundAudioManager(); //获取全局唯一的背景音频管理器。并把它给实例bgAudioManage
    app.globalData.bgAudioManage = bgAudioManage;         //把实例bgAudioManage(背景音频管理器) 给 全局
    bgAudioManage.title = 'title';                        //把title 音频标题 给实例
    bgAudioManage.src = res.url;                          // res.url 在createBgAudio 为 mp3音频  url为空，播放出错
    // console.log(res)

    const history_songId = this.data.history_songId
    const historySong = {
      // id: res.id
      id: app.globalData.songId,
      songName: app.globalData.songName
    }
    history_songId.push(historySong)
    if(this.data.key){
      this.setData({
        key : false
      })
      this.startTimer();
    }
    bgAudioManage.onPlay(res => {
      // 监听背景音频播放事件
      this.setData({
        isPlay: true,
        history_songId
      })
    });

    bgAudioManage.onEnded(() => {                  //监听背景音乐自然结束事件，结束后自动播放下一首。自然结束，调用go_lastSong()函数，即歌曲结束自动播放下一首歌
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
  //开始定时器



  // 播放和暂停
  handleToggleBGAudio() {
    // const innerAudioContext = app.globalData.innerAudioContext;
    const bgAudioManage = app.globalData.bgAudioManage;
    const { isPlay } = this.data;
    if (isPlay) {
      this.stopTimer();
      bgAudioManage.pause();
      // innerAudioContext.pause();handleToggleBGAudio
    } else {
      this.startTimer();
      bgAudioManage.play();
      if(this.data.key){
        this.setData({
          key : false
        })
        
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