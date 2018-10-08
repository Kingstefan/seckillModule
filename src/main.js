// 导入JS模块
import judgeMobile from './static/js/judgemobile'
import lazyload from 'jquery-lazyload';
import { canSessionStorage } from './static/js/storage';
import context from './components/index';
import productlistDatas from './datas/productlist.json'
// 导入全局样式
import './scss/index.scss';
import './scss/index-m.scss';

(function ($, win) {
    judgeMobile();
    const Seckill = function (ele, opts) {
        this.$element = ele;
        this.spieltag = 3; //默认为3场
        this.timetamp = 0; //时间差的秒数
        this.currentIndex = 0; //当天显示的下标
        this.newDateArr = [];
        this.systemTime = new Date().getTime(); //系统当前的时间戳
        this.defaults = {
            seckill_time: [
                '2018-09-26 10:00:00/2018-09-28 18:00:00,2018-09-28 19:00:00/2018-09-28 22:00:00,2018-09-28 23:00:00/2018-09-28 24:00:00',
                '2018-09-29 10:00:00/2018-09-29 20:00:00,2018-09-29 21:00:00/2018-09-29 22:00:00,2018-09-29 23:00:00/2018-09-29 24:00:00',
                '2018-10-08 14:25:00/2018-10-08 14:26:00,2018-10-08 14:27:00/2018-10-08 14:28:00,2018-10-08 14:29:00/2018-10-08 14:30:00'
            ],/********
                * 设置秒杀时间: 注意以下：
                * 数组的每个子元素代表一天的秒杀场次及时间
                * 每个子元素的长度（也就是秒杀的场次）必须相同
                * 时间按照必须从小到大的排列，不能交叉设置
                *
               ***** */
            seckill_title: '十一国庆大放送秒杀商品',//自定义标题内容
            seckill_date: ['9月28日', '9月29日', '10月08日'],/**
                   * 设置秒杀的天数: 注意以下：
                   * 子元素的长度不能小于seckill_time.length,只能大于或者等于它的长度
                   * 当seckill_date.length大于seckill_time.length时， 默认取seckill_date.slice(0, seckill_time.length)
            ****** */
            coundown_texts: [
                {
                    countdown_text: ['第一场11', '第二场11', '第三场11', '第三场11']
                },
                {
                    countdown_text: ['第一场22', '第二场22', '第三场22']
                },
                {
                    countdown_text: ['第一场33', '第二场33', '第三场33']
                }
            ]/**
                * 设置倒计时横条的内容: 注意以下：
                * 数组coundown_texts的子元素的长度不能小于seckill_time.length, 只能大于或者等于它的长度
                * 当coundown_texts.length大于seckill_time.length时， 默认取coundown_texts.slice(0, seckill_time.length)
                * 数组coundown_text的子元素的长度不能小于, 只能大于或者等于它的长度秒杀场次spieltag的长度
                * 当coundown_text.length大于spieltag时， 默认取coundown_text.slice(0, spieltag)
                */
        }
        this.opts = $.extend({}, this.defaults, opts);
        this.init()
    }
    Seckill.prototype = {
        constructor: Seckill,
        init: function () {
            this.dealSeckillTime();
            this.$element.html(`<div class="product-wrap">${this.views()}</div>`);
            this.eleObj = {
                $countdowns: this.$element.find('.seckill-countdown'),
                $countdownItem: this.$element.find('.countdown-item'),
                $dates: this.$element.find('.seckill-date'),
                $productNode: this.$element.find('.seckill-products'),
            }
            this.timeSort();
            this.eventListen();
        },
        eventListen: function () {
            let that = this;
            this.eleObj.$dates.on('click', '.date-item', function () {
                var thisIndex = $(this).index(),
                    index = that.eleObj.$countdowns.eq(thisIndex).find('.countdown-item.current').index();
                $(this).addClass('current').siblings().removeClass('current');
                that.eleObj.$countdowns.removeClass('current').eq(thisIndex).addClass('current');
                that.toggleClassCur(thisIndex * that.spieltag + index);
                $('.lazy-product').lazyload({
                    effect: "fadeIn"
                });
            });
            this.eleObj.$countdownItem.on('click', function () {
                var index = $(this).index();
                $(this).addClass('current').siblings().removeClass('current');
                var thisIndex = that.eleObj.$dates.find('.date-item.current').index() * that.spieltag + index;
                that.toggleClassCur(thisIndex);
                $('.lazy-product').lazyload({
                    effect: "fadeIn"
                });
            });
        },
        views: function () {
            const STORAGE_KEY = 'view_html',
                isStorage = canSessionStorage && !sessionStorage.getItem(STORAGE_KEY) || !canSessionStorage;
            const productsView = context.products({
                data: productlistDatas.slice(0, this.spieltag * this.opts.seckill_time.length)
            }),
                coundownView = context.coundwonbar({
                    data: this.opts.coundown_texts.slice(0, this.opts.seckill_time.length).map(item => {
                        return {
                            countdown_text: item.countdown_text.slice(0, this.spieltag)
                        }
                    })
                }),
                dateView = context.datebar({
                    data: this.opts.seckill_date.slice(0, this.opts.seckill_time.length)
                }),
                titleView = `<div class="title">${this.opts.seckill_title}</div>`;

            const views = titleView + dateView + coundownView + productsView;
            if (canSessionStorage) {
                sessionStorage.setItem(STORAGE_KEY, views);
            }
            return isStorage ? views : sessionStorage.getItem(STORAGE_KEY);
        },
        countdownTamp: function (timetamp, indexInt, indexFloat) {
            let that = this;
            var time = window.setInterval(function () {
                var day = 0,
                    hour = 0,
                    minute = 0,
                    second = 0,
                    str = ''; //时间默认值
                if (timetamp > 0) {
                    day = Math.floor(timetamp / (60 * 60 * 24));
                    hour = Math.floor(timetamp / (60 * 60)) - (day * 24);
                    minute = Math.floor(timetamp / 60) - (day * 24 * 60) - (hour * 60);
                    second = Math.floor(timetamp) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
                } else {
                    window.location.reload();
                    clearInterval(time);
                }
                if (hour <= 9) hour = '0' + hour;
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                if (day === 0) str = hour + ':' + minute + ':' + second;
                if (day > 0) str = day + '天 ' + hour + ':' + minute + ':' + second;
                that.eleObj.$countdowns.eq(indexInt).find('.countdown-item').eq(indexFloat).find('.countdown').html('距秒杀结束 ' + str);
                timetamp--;
            }, 1000);
        },
        dealSeckillTime: function () {
            let dateArr = [];
            this.opts.seckill_time.map((item) => {
                dateArr.push(item.replace(/,\s*/g, ',').split(','));
            })
            dateArr.map((items) => {
                this.spieltag = items.length;
                items.map(item => {
                    this.newDateArr.push(item.replace(/\/\s*/g, '/').split('/'));
                });
            });
        },
        timeSort: function () {
            let startTimeArr = [],
                endTimeArr = [],
                dateNum = this.opts.seckill_time.length;
            this.newDateArr.map((item, i) => {
                var startTime = item[0].replace(/-\s*/g, '/'),
                    endTime = item[1].replace(/-\s*/g, '/'),
                    startTimeS = new Date(startTime).getTime(),
                    endTimeS = new Date(endTime).getTime();
                startTimeArr.push(startTimeS);
                endTimeArr.push(endTimeS);
                this.eleObj.$countdownItem.eq(i).data('start', startTimeS).data('end', endTimeS);
                if ((i + 1) % this.spieltag === 0) {
                    if (this.systemTime > endTimeS) {
                        this.currentIndex = i + 1 >= dateNum ? dateNum - 1 : i + 1;
                    }
                }
            });
            for (var i = 0; i < startTimeArr.length; i++) {
                if (startTimeArr[i + 1] < endTimeArr[i] || startTimeArr[i] > endTimeArr[i]) {
                    throw new Error('时间格式设置错误!')
                }
            }
            let startTimeArrClone = startTimeArr.slice();
            startTimeArrClone.push(this.systemTime);
            startTimeArrClone.sort(function (a, b) {
                return a - b;
            });
            let curIndexStart = startTimeArrClone.indexOf(this.systemTime) - 1;
            if (curIndexStart < 0) {
                //this.seckillNotStart(curIndexStart);
            } else if (curIndexStart > startTimeArr.length - 1) {
                //this.seckillOver(curIndexStart);

            } else {
                this.seckillBeing(curIndexStart);
            }
            this.toolgeShow(endTimeArr);
        },
        seckillBeing: function (index) { //秒杀中
            this.toggleClassCur(index);
            this.toggleClassOver(index);
            this.eleObj.$productNode.eq(index).find('.product-btn').html('立即抢购');
            var indexInt = parseInt((index / this.spieltag), 10),
                indexFloat = parseInt((index % this.spieltag), 10),
                tamp = this.currentIndex * this.spieltag;
            this.eleObj.$countdowns.eq(indexInt).find('.countdown-item').removeClass('current').eq(indexFloat).addClass('current').prevAll().find('.countdown').html('已结束');
            if (this.systemTime >= this.eleObj.$countdownItem.eq(index).data('start') && this.systemTime <= this.eleObj.$countdownItem.eq(index).data('end')) {
                var endTotalS = this.eleObj.$countdownItem.eq(index).data('end');
                this.timetamp = parseInt((endTotalS - this.systemTime) / 1000, 10);
                this.countdownTamp(this.timetamp, indexInt, indexFloat);
            } else if (this.systemTime < this.eleObj.$countdownItem.eq(tamp).data('start')) {
                this.toggleClassCur(tamp);
                this.toggleClassOver(tamp);
                var criticalVal1 = this.eleObj.$countdownItem.eq(tamp).data('start');
                this.timetamp = parseInt((criticalVal1 - this.systemTime) / 1000, 10);
                this.countdownTamp(this.timetamp);
            } else {
                this.eleObj.$countdowns.eq(indexInt).find('.countdown-item').eq(indexFloat).find('.countdown').html('已结束');
                this.eleObj.$productNode.eq(index).find('.goods-link').addClass('seckillover');
                this.eleObj.$productNode.eq(index).find('.product-btn').addClass('over').html('已结束');
                var criticalVal2 = this.eleObj.$countdownItem.eq(index + 1).data('start');
                this.timetamp = parseInt((criticalVal2 - this.systemTime) / 1000, 10);
                let max = this.spieltag * this.opts.seckill_time.length;
                if (index < max - 1) this.countdownTamp(this.timetamp);
            }
        },
        toggleClassCur: function (index) {
            this.eleObj.$productNode.removeClass('current').eq(index).addClass('current');
        },
        toggleClassOver: function (index) {
            this.eleObj.$productNode.eq(index).prevAll().find('.goods-link').addClass('seckillover');
            this.eleObj.$productNode.eq(index).prevAll().find('.product-btn').addClass('over').html('已结束');
        },
        toolgeShow: function (endTimeArr) {
            let tamp = this.currentIndex * this.spieltag,
                s = new Date(endTimeArr[tamp]);
             if (this.systemTime < s) {
                this.eleObj.$productNode.removeClass('current').eq(tamp).addClass('current');
             }
             //显示对应的第几天
             this.eleObj.$dates.find('.date-item').removeClass('current').eq(this.currentIndex).addClass('current');
             this.eleObj.$countdowns.removeClass('current').eq(this.currentIndex).addClass('current');
             this.eleObj.$countdowns.eq(this.currentIndex).prevAll().find('.countdown').html('已结束');
        }
    }
    $.fn.Seckilling = function (options, callback) {
        return new Seckill(this, options);
    }
    $('.seckill-module').Seckilling({
        seckill_time: [
            '2018-10-08 10:00:00/2018-10-08 18:00:00,2018-10-08 19:00:00/2018-10-08 22:00:00,2018-10-08 23:00:00/2018-10-08 24:00:00',
            '2018-10-09 10:00:00/2018-10-09 18:00:00,2018-10-09 19:00:00/2018-10-09 22:00:00,2018-10-09 23:00:00/2018-10-09 24:00:00'
        ],
        seckill_title: '国庆大放送秒杀商品',
        seckill_date: ['10月08日', '10月09日', '10月10日'],
        coundown_texts: [{
                countdown_text: ['第一场秒杀11', '第二场秒杀11', '第三场秒杀11', '第三场秒杀11']
            },
            {
                countdown_text: ['第一场22', '第二场22', '第三场22']
            },
            {
                countdown_text: ['第一场33', '第二场33', '第三场33']
            }
        ]
    });
    if (navigator.userAgent.match(/iphone|ipod|ipad|Android/gi)) {
        $('.seckill-module').addClass('seckill-module-m')
    }
    $('.lazy-product').lazyload({
        effect: "fadeIn"
    });
})($,window)

