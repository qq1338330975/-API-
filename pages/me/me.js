const app = getApp();
Page({

  data: {
    img: [],
    nickName: [],
    hidden: true,
    historyId: [],
  },

  onShow: function () {
    this.getTabBar().setData({
      isShow_me: true,
      isShow_playing: false,
      isShow_index: false
    })

    var history = wx.getStorageSync('historyId');
    console.log(wx.getStorageSync('historyId'));
    this.setData({
      //  historyId: app.globalData.songName
      // hidden: true,
      historyId: history
    })
    if(!this.data.hidden){
      this.onGotUserInfo();
    }
  },
  
  onGotUserInfo: function (e) {
    this.setData({
      hidden: false
    })
    // console.log(e.detail.errMsg)
    // console.log(e.detail.userInfo)
    // console.log(e.detail.rawData)

    // this.setData({
    //   hidden:true
    // })
    let that = this;
    // 获取用户信息
    wx.login({
      success: function (res) {
        if (res.code) {
          let code = res.code
          let appid = "wxbf638bca60a15bfc"
          let secret = "992f56e00e051ac286b2e68b67e5618a"
          //发起网络请求
          wx.request({
            url: "https://api.weixin.qq.com/sns/jscode2session?appid=" + appid + "&secret=" + secret + "&js_code=" + code + "&grant_type=authorization_code",
            success: function (res) {
              wx.getUserInfo({
                success: function (res) {
                  // console.log(res);
                  that.setData({
                    img: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                  })
                }
              });

            }
          })
        } else {
          console.log('登录失败！')
        }
        // wx.getUserInfo({
        //   success: function (res) {
        //     // console.log(res);
        //     console.log(res.userInfo.avatarUrl);
        //     console.log(res.userInfo.nickName);
        //     that.setData({
        //       img:res.userInfo.avatarUrl,
        //       nickName:res.userInfo.nickName
        //     })
        //   }
        // });
      }
    });
  },

})