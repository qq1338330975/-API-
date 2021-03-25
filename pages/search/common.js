//common.js

/*函数节流*/
function throttle(fn, interval) {
  var enterTime = 0; //触发的时间
  var gapTime = interval || 300; //间隔时间，如果interval不传值，默认为300ms
  return function() {
	var that = this;
	var backTime = new Date(); //第一次函数return即触发的时间
	if(backTime - enterTime > gapTime) {
	  fn.call(that, arguments);
	  enterTime = backTime; //赋值给第一次触发的时间 保存第二次触发时间
    }
  };
}

/*函数防抖*/
function debounce(fn, interval) {
  var timer;
  var gapTime = interval || 1000; //间隔时间 不传值默认为1000ms
  return function() {
    clearTimeout(timer);
    var that = this;
    var args = arguments; //保存arguments setTimeout是全局的 arguments不是防抖函数需要的
    timer = setTimeout(function() {
    console.log(11111)
	  fn.call(that, args);
    }, gapTime);
  };
}

/*导出*/
export default {
  throttle,
  debounce
};
