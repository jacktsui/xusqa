// ==UserScript==
// @name         有道搜题录题助手-手机版
// @namespace    hacktsui
// @version      0.213
// @description  有道搜题，录题员助手-手机版(功能有: 一键领取,任务广场任务数量角标.)
// @author       Hacktsui
// @copyright    © 2018, 徐。355088586@qq.com
// @license      MIT https://mit-license.org/
// homepageURL   https://gitee.com/jacktsui/xusqa
// @UpdateURL    https://gitee.com/jacktsui/xusqa/raw/dev/xusqam.user.js
// @supportURL   https://note.youdao.com/share/?id=39a4db993aaf76595437b445fbc1de0e&type=note#/
// @match        http://searchq-editsys.youdao.com/
// @require      https://cdn.bootcss.com/jquery/1.7.2/jquery.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

// https://cdn.staticfile.org/jquery-mobile/1.4.5/jquery.mobile.min.js
/* jshint asi: true */
/* jshint esversion: 6 */

(function() {
    'use strict'


/*->->->->->-> 配置区 ->->->->->->*/
const SE = {
    '数学-高中': 1.5,
    '理数-高中': 1.5,
    '文数-高中': 1.5,
    '英语-高中': 1.2,
    '语文-高中': 1.2,
    '物理-高中': 1.5,
    '化学-高中': 1.5,
    '生物-高中': NaN,
    '历史-高中': NaN,
    '政治-高中': NaN,
    '地理-高中': NaN,
    '理综-高中': NaN,
    '文综-高中': NaN,
    '数学-初中': 1.3,
    '英语-初中': 1.1,
    '语文-初中': 1.1,
    '物理-初中': 1.3,
    '化学-初中': 1.1,
    '生物-初中': NaN,
    '历史-初中': NaN,
    '政治-初中': NaN,
    '地理-初中': NaN,
    '数学-小学': 0.5,
    '英语-小学': NaN,
    '语文-小学': 1.1,
    '历史-小学': NaN,
    '政治-小学': NaN,
    '地理-小学': NaN,
}

const DIC = {
    AGO:[
        [60*60*3, '很久以前'],
        [60*60*2, '两小时前'],
        [60*60, '一小时前'],
        [60*45, '三刻钟前'],
        [60*30, '半小时前'],
        [60*15, '一刻钟前'],
        [60*10, '十分钟前'],
        [60*8, '八分钟前'],
        [60*5, '五分钟前'],
        [60*3, '三分钟前'],
        [60*2, '两分钟前'],
        [60*1, '一分钟前'],
        [30, '半分钟前'],
        [0,'　刚刚　'],
        [-Infinity, '你穿越了'],
    ],
}

/*<-<-<-<-<-<- 配置区结束 <-<-<-<-<-<*/

// strings ------>
const STR = {
    MODULE: {
        MY_TASK: '我的任务',
        ONEKEY_GET_TASK: '一键领取',
        TASK_SQUARE: '任务广场',
    },
    ONEKEY_GET_TASK: {
        WAITING: '正在寻找任务……',
        SUCCESS: '已领取任务“{se}”题目录入',
        NOMORE_TASK: '没有多余的任务 T_T',
    },
    RECIEVE_TASK: {
        SUCCESS: '已领取任务“{se}”题目录入',
        NOMORE_TASK: '没有多余的任务 T_T',
    },
    TASK_SQUARE: {
        REFRESH_SUCCESS: '任务广场已成功刷新',
        WAIT_APPROVAL: '未通过',
        REFRESH: '正在刷新',
    },
    CONFIG: {
        SE_NO_PRICE: '{se}没有价格',
        SUCCESS: '配置成功',
        FAILED: '配置失败',
    },
    SHAREQQ: {
        NO_TASK: '当前没有任务可以分享',
        QTIME: '查询时间: {qtime}',
        EXPIRED: '要分享的信息已过期, 刷新后重试',
    },
}

const DOM = {
    USER: '#app div.main-content header div.right span.user',
    NAV_MY_TASK: '#app nav ul.list li a[href="#/mytasks"]',
    NAV_TASk_CHOOSE: '#app nav ul.list li a[href="#/task/choose"]',

    //TASK_PAGE: '#app div.main-content div.main-wrap div.task-page',
    TASK_PAGE: '#app > div > div.main-content > div > div',
    EDIT_PAGE: '#app div.main-content div.main-wrap div.edit-page',

    //TASK_LIST: '#app div.main-content ul.task-list',
    TASK_LIST_LI: '#app div.main-content ul.task-list li',
    POSITION: '#app > div > div.main-content > div > div > div.position',
}

const URL = {
    TASK_MINE: 'http://searchq-editsys.youdao.com/editsys/task/mine?pageno={pageno}',
    TASK_REMAIN: 'http://searchq-editsys.youdao.com/editsys/task/remain?subject={subject}&education={education}',
    TASK_RECIEVE: 'http://searchq-editsys.youdao.com/editsys/task/receive?tasktype=题目录入&subject={subject}&education={education}',
    TASK_SQUARE: 'http://searchq-editsys.youdao.com/editsys/task/square',
    GET_UNREAD_MESSAGE_NUM: 'http://searchq-editsys.youdao.com/editsys/getUnreadMessageNum',
    SHAREQQ: 'http://connect.qq.com/widget/shareqq/index.html?{params}',
    QQ_SHARE_IMG: 'https://gitee.com/jacktsui/xusqa/raw/master/img/{no}.png',
}

//<------ strings end.

const TEMPLATE = {
    CONFIG_MAIN: '<div id="xusqa_div_config" style="position: absolute;left: 604px;z-index: 1001;width: 275px;' +
        'background-color: rgb(51, 122, 183);box-shadow: rgb(51, 122, 183) 3px 0px 15px;display: none;margin-top: 20px;">' +
        '<div style="width: 0px;top: -30px;z-index: 1000;left: 54px;position: absolute;height: 0px;border-width: 18px;' +
        'border-style: solid;border-color: transparent transparent #337ab7 transparent;"></div>' +
        '<span style="color: white;">调整一键领取任务顺序，用逗号分隔</span>' +
        '<textarea rows="5" cols="1000" style=" font-size: 13px; width: 95%; overflow:hidden; resize:none;"></textarea>' +
        '<div style="text-align: left;padding-left: 8px;font-size: 14px;">' +
        '<a data-v-7b90ba54 href="javascript:void(0);" class="exit header-btn" style="float: right; margin: -7px 6px 10px 20px; padding: 6px 20px 6px 20px;">确定</a></div>',
    CONFIG_BUTTON: '<a data-v-7b90ba54 id="xusqa_div_config_button" href="javascript:void(0);" class="exit header-btn" style="margin-left: 1px; padding: 6px 3px;font-family: serif;">┇</a>',
    LAST_UPDATE: '<div data-v-0544f45b id="xusqa_last_update" class="process-task-con">最后刷新时间：<a  style="padding: 0px 10px;color: #f93e53;">　刚刚　</a><a data-v-0544f45b href="javascript:;" class="enter-task xusqa-btn">分享到QQ</a></div>',
}

const $ = window.$
/*
* $S config key
* xusqa_onekeyGetTaskSEs "数学-初中,物理-高中,英语-高中,语文-初中" 一键领取科目顺序
* xusqa_onekeyGetTaskStep 一键领取任务单次发送的请求数 
* xusqa_extraSquareHide 增强任务广场隐藏列表, 0 隐藏没价格并且灰的, 1 隐藏没价格的, 2 隐藏灰的
*/
const $S = window.localStorage

let $V

// 暂存器,数据只在脚本运行期间有效,不保存
const __stage__ = {
    timer:{}, // 用来统一存放计时器,用于清理计时器,目前没有做特别处理

    last_update: new Date(),
}

// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2018-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2018-7-2 8:9:4.18
Date.prototype.format = function(format) {
    const args = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        //quarter
        "S": this.getMilliseconds()
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
    }

    for (let i in args) {
        const n = args[i]
        if (new RegExp("(" + i + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length))
        }
    }

    return format
}

// util
const util = {
    cmt: function(f) {
        return f.toString().replace(/^[\s\S]*\/\*.*/, '').replace(/.*\*\/[\s\S]*$/, '').replace(/\r\n|\r|\n/g, '\n')
    },
    
    addStyle: function(str){
        const style = document.createElement('style')
        style.textContent = str
        document.head.appendChild(style)
        return style
    },
    
    getDefaultSEs: function() {
        const r = []
        for(let i in SE){
            if (SE[i]){
                r.push(i)
            }
        }
        return r.join(',')
    },

    timeAgo: function(milliseconds){
        const sec = milliseconds/1000
        for(let i=0; i < DIC.AGO.length; i++){
            if (sec > DIC.AGO[i][0]){
                return DIC.AGO[i][1]
            }
        }
    },
}

// util end------>

// add css sheet to header, not comment
util.addStyle(util.cmt(function(){/*!CSS
.xusqa-header-btn {
    border-left: 3px solid #f56c6c !important;
}

.xusqa-corner {
    width: 80px;
    height: 80px;
    color: #fff;
    position: absolute;
    transform: rotateZ(-45deg);
}

.xusqa-corner:after {
    content: '';
    border-width: 40px;
    width: 0;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent #d75d5a transparent;
    display: block;
    position: absolute;
    top: -60px;
    z-index: -2;
}

.xusqa-corner:before {
    content: '';
    border-width: 20px;
    width: 0;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent #fff transparent;
    display: block;
    position: absolute;
    top: -41px;
    z-index: -1;
    right: 20px;
}

.xusqa-corner-gray {
    width: 80px;
    height: 80px;
    color: #fff;
    position: absolute;
    transform: rotateZ(-45deg);
}

.xusqa-corner-gray:after {
    content: '';
    border-width: 40px;
    width: 0;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent #909399 transparent;
    display: block;
    position: absolute;
    top: -60px;
    z-index: -2;
}

.xusqa-corner-gray:before {
    content: '';
    border-width: 20px;
    width: 0;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent #fff transparent;
    display: block;
    position: absolute;
    top: -41px;
    z-index: -1;
    right: 20px;
}

.main-wrap[data-v-927a125c] {
    padding: 0 12px;
}

.user[data-v-7b90ba54] {
    display: none;
}

.nav-wrap[data-v-3f6ca4fa] {
    display: none;
}

.exit[data-v-7b90ba54] {
    margin-left: 10px;
}

.header-btn[data-v-7b90ba54] {
    padding: 6px 6px;
    font-size: 12px;
}

@media all and (orientation: landscape) { 
.task-cell[data-v-55f72dff] {
    width: 29%;
    margin: 10px 2%;
}
} 

@media all and (orientation: portrait){ 
.task-cell[data-v-55f72dff] {
    width: 45%;
    margin: 10px 2%;
}
} 

.task-list[data-v-55f72dff] {
    margin-top: 20px;
}

.position {
    margin: 16px 0;
    font-size: 14px;
}

.title a[data-v-7b90ba54] {
    font-size: 12px;
    margin-top: 6px;
}

.el-table {
    font-size: 12px;
}

header[data-v-7b90ba54] {
    margin: 0 -32px;
    padding: 10px 32px;
    height: auto;
}

#app {
    font-size: 14px;
}

.add-time[data-v-0544f45b], .enter-task[data-v-0544f45b], .return-task[data-v-0544f45b] {
    font-size: 12px;
}

.process-title[data-v-0544f45b] {
    font-size: 12px;
}

.process-task-con[data-v-0544f45b] {
    margin: 0px 0;
}

.login-con[data-v-817962a2] {
    margin: 20px auto 0;
}

.box[data-v-927a125c] {
    width: 100%;
}

.el-message {
    bottom: 0px;
    margin-bottom: 20px;
    top: auto;
}

.router-link-active[data-v-7b90ba54] {
    text-decoration: none;
    display: inline-block;
    font-weight: 500;
    padding: 6px 6px;
    font-size: 12px;
    line-height: 1.42857143;
    border-radius: 3px;
    background: #fff;
    border-color: #fff;
    color: #337ab7;
}

.el-badge__content.is-fixed {
    top: 8px;
    right: 12px;
}

.el-badge {
    margin-top: -1px;
}

.el-table td, .el-table th {
    padding: 8px 0;
}

*/
}))
//<------ css end

// extend------>

// "I'm {0}, {1} years old.".format('xu', 25)
// "I'm {name}, {age} years old.".format({name: 'xu', age: 25})
String.prototype.format = function(args) {
    let result = this
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (let key in args) {
                if (args[key] != undefined) {
                    let reg = new RegExp("({" + key + "})","g")
                    result = result.replace(reg, args[key])
                }
            }
        } else {
            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    let reg = new RegExp("({)" + i + "(})","g")
                    result = result.replace(reg, arguments[i])
                }
            }
        }
    }
    return result
}
//<------extend end.

/**
* 功能: 增强任务广场
* 为任务广场学科列表添加角标,
* 角标显示剩余的任务数,如果该学科没有通过审核,灰色显示
*/

function recCheckTaskList() {
    let timer
    if ($(DOM.TASK_LIST_LI).length == 0) {
        clearTimeout(timer)
        timer = setTimeout(recCheckTaskList, 300)
    } else {
        doExtraTaskList()
    }
}

function extraTaskList() {
    if (location.hash != '#/task/choose') {
        $(DOM.NAV_TASk_CHOOSE)[0].click()
    } else {
        doExtraTaskList()
    }
}

function doExtraTaskList() {
    let finishedcount = 0, totalcount = 0, lis = $(DOM.TASK_LIST_LI)
    let qssumary = ''

    let ds = $('#xusqa_last_update')
    if (!ds.length){
        ds = $(TEMPLATE.LAST_UPDATE).insertAfter($(DOM.POSITION))
    }

    function resetRefresh(qssumary){
        if (location.hash.indexOf('#/task/choose') == -1){
            return
        }

        __stage__.last_update = new Date()

        clearInterval(__stage__.timer.last_update)
        ds.children('a:first-child').text(DIC.AGO[DIC.AGO.length - 2][1])

        __stage__.timer.last_update = setInterval(function(){
            ds = $('#xusqa_last_update')
            if (ds.length){
                const now = new Date()
                const ta = util.timeAgo(now - __stage__.last_update)
                ds.children('a:first-child').text(ta)
            } else {
                clearInterval(__stage__.timer.last_update)
            }
        }, 1000*30)

        ds.children('a:last-child').click(function(){
            if (!qssumary){
                $V.$message.error(STR.SHAREQQ.NO_TASK)
                return
            }

            if (new Date() - __stage__.last_update > 1000*60*10){ // 超过10分钟,过期
                $V.$message.error(STR.SHAREQQ.EXPIRED)
                return
            }

            const ranno = Math.floor(Math.random()*(123-1+1)+1)

            const p = {
                url: location.href,
                desc: '',
                title: STR.SHAREQQ.QTIME.format({qtime: __stage__.last_update.format('hh:mm:ss')}),
                summary: qssumary,
                pics: URL.QQ_SHARE_IMG.format({no:ranno}),
                site: document.title, //flash: '', style: '203', width: 16, height: 16
            };
            const s = [];
            for(let i in p){
                s.push(i + '=' + encodeURIComponent(p[i]||''));
            }
            const qhref = URL.SHAREQQ.format({params: s.join('&')});
            ds.children('a:last-child').attr({href: qhref, target: "_blank"});
        })
    }

    function setLiCorner(li) {
        const [s,e] = li.lastChild.innerText.split('-')

        $.get(encodeURI(URL.TASK_REMAIN.format({subject: s, education: e})), function(data, status) {
            const js = data.data[0]
            const se = s + '-' + e

            if (li.childNodes.length == 2){
                li.firstChild.remove()
            }

            if (js.count != 0 || js.permission != 1) {
                const dom_corner_a = $('<div class="xusqa-corner' + (js.permission == 1 ? '">' : '-gray">') +
                    '<a style="position: absolute;top: -10px;left: 20px;width: 40px;font-size: ' +
                    (js.permission == 1 ? '15' : '12') + 'px;text-align: center;color: white;"' +
                    (js.permission == 1 ? ' href="javascript:void(0);">' : '>') +
                    ((js.permission == 1 || js.count > 0) ? js.count : STR.TASK_SQUARE.WAIT_APPROVAL) +
                    '</a></div>').prependTo(li)

                if (js.permission == 1) {
                    dom_corner_a.click(function() {
                        $.get(encodeURI(URL.TASK_RECIEVE.format({subject: s, education: e})), function(data, status) {
                            if (data.code == 200) {
                                $V.$message.success(STR.ONEKEY_GET_TASK.SUCCESS.format({se: se}))
                                $(DOM.NAV_MY_TASK)[0].click()
                            } else {
                                $V.$message.error(data.code == 20001 ? data.message : '“' + se + '”' + data.message)
                            }
                        })
                    })
                }
            }

            if (js.count != 0 && SE[se]){
                qssumary += li.lastChild.innerText + ': ' + js.count + ' 个;'
            }

            finishedcount++
            if (finishedcount == totalcount) {
                $V.$message.success(STR.TASK_SQUARE.REFRESH_SUCCESS)

                resetRefresh(qssumary)
            }
        })
    }

    $.get(URL.TASK_SQUARE, function(data, status){
        if(data.code == 200){
            const tasks = data.data
            const h = $S.xusqa_extraSquareHide ? $S.xusqa_extraSquareHide : 0
            for(let i = 0, l = tasks.length; i < l; i++){
                const t = tasks[i]
                const li = lis[i]

                if (lis[i].lastChild.innerText != t.name ){
                    $V.$message.warning(STR.ERROR.STOP)
                    throw new Error(STR.ERROR.STOP)
                }

                if (t.task){
                    totalcount++
                    setLiCorner(li)

                    $(li).show()
                } else {
                    if (li.childNodes.length == 2){
                        li.firstChild.remove()
                    }

                    if (h == 0) { // 隐藏灰的并且没有价格的
                        if (!SE[li.lastChild.innerText]){
                            $(li).hide()
                        }
                    }

                    if (h == 2) { // 隐藏灰色
                        $(li).hide()
                    }
                }

                if (h == 1){ // 隐藏没价格的
                    if (!SE[li.lastChild.innerText]){ // 只隐藏没有价格的
                        $(li).hide()
                    }
                }
            }
        } else if (data.code == 30000){
            location.reload()
        }
    })
}

/**
* 功能: 一键领取任务
* 按照配置区的学科顺序一键领取任务
*/
function oneKeyGetTask() {
    let _finishcount = 0, _status = 0 // -1 身上有任务, 1 领取成功

    let _ses = $S.xusqa_onekeyGetTaskSEs ? $S.xusqa_onekeyGetTaskSEs : util.getDefaultSEs()
    _ses = _ses.split(',')
    const _step = $S.xusqa_onekeyGetTaskStep ? $S.xusqa_onekeyGetTaskStep : 10
    
    const times = Math.ceil(_ses.length/_step)
    const _all = []
    for(let i=0; i<times; i++){
        _all[i] = _ses.slice(i*_step, (i+1)*_step)
    }

    function q(se){
        const [s,e ] = se.split('-')
        /*\
        >    {"code":200,"data":"","message":"SUCCESS"}
        >    {"code":20000,"data":"","message":"没有多余的任务"}    
        >    {"code":20001,"data":"","message":"当前有任务尚未完成，无法领取新任务"}
        >    {code: 600, data: "", message: "没有权限"}
        \*/
        $.get(encodeURI(URL.TASK_RECIEVE.format({subject: s, education: e})), (function(se){
            return function(data, status){
                if (data.code == 200){
                    _status = 200
                    $V.$message.success(STR.ONEKEY_GET_TASK.SUCCESS.format({se: se}))
                    $(DOM.NAV_MY_TASK)[0].click()
                } else if(data.code == 20001){ // 身上有任务
                    _status --
                    if (_status == -1){ // 不是刚领的任务,提示一次
                        $V.$message.error(data.message)
                    }                    
                } else if (data.code == 30000) { // 异常，没登录，终止
                    throw new Error(STR.ERROR.STOP)
                } else { // 可能没权限
                    _finishcount ++
                    const gr = _finishcount % _step
                    const gi = _finishcount / _step
                    if (gr == 0 && gi < _all.length){ // 查询下一分组
                        qgroup(gi)
                    }
                    if (_finishcount == _ses.length){ // 查询完毕, 没有多余的任务
                        //const _end = new Date().getTime();
                        //console.log(_end - _start)
                        $V.$message.error(STR.ONEKEY_GET_TASK.NOMORE_TASK)
                    }
                }
            }
        })(se))
    }

    function qgroup(index){
        for(let i=0; i < _all[index].length; i++){
            q(_all[index][i])          
        }
    }
    //const _start = new Date().getTime();

    $V.$message.info(STR.ONEKEY_GET_TASK.WAITING)
    qgroup(0)
}

function myTask(){
    $(DOM.NAV_MY_TASK)[0].click()
}

//****** 添加功能按钮 ******
function tryAddHeaderButton() {
    function addHeaderButton(title) {
        return $('<a data-v-7b90ba54 href="javascript:void(0);" class="exit header-btn xusqa-header-btn">' +
            title + '</a>').insertAfter(DOM.USER)
    }

     $.get(URL.GET_UNREAD_MESSAGE_NUM, function(data, status) {
        let timer
        if (data.code == 30000 || $(DOM.USER).length == 0 || !($V._isMounted)) {
            //console.log(new Date())
            // 未登录1秒后重试
            clearTimeout(timer)
            timer = setTimeout(tryAddHeaderButton, 1000)
        } else {
            //console.log($('#app > div > div.main-content > div > header > div.title > a').text())
            $('#app div.main-content header div.right > a:last-child').hide()
            $('#app > div > div.main-content > div > header > div.title > a').text('首页')
            $('#app > div > div.main-content > div > header > div.right > div.el-badge > a').removeAttr('target')
            //console.log($('#app > div > div.main-content > div > header > div.title > a').text())
            addHeaderButton(STR.MODULE.MY_TASK).click(myTask)
            addHeaderButton(STR.MODULE.TASK_SQUARE).click(extraTaskList)
            const btnOneKeyGetTask = addHeaderButton(STR.MODULE.ONEKEY_GET_TASK).click(oneKeyGetTask)
            const btnConfig = $(TEMPLATE.CONFIG_BUTTON).insertAfter(btnOneKeyGetTask)
            $(TEMPLATE.CONFIG_MAIN).insertAfter(btnConfig)
            btnConfig.click(function(){
                const sel = $('#xusqa_div_config')
                if (sel[0].style.display == 'none'){
                    $('#xusqa_div_config textarea').val($S.xusqa_onekeyGetTaskSEs ? $S.xusqa_onekeyGetTaskSEs : util.getDefaultSEs())
                    sel.css('left', '{0}px'.format(btnOneKeyGetTask[0].offsetLeft)).show()

                    $(document).on('click.xusqa_event', function(e) {
                        e = e || window.event
                        let elem = e.target || e.srcElement
                        while (elem) {
                            if (elem.id && (elem.id == 'xusqa_div_config' || elem.id == 'xusqa_div_config_button')) {
                                return
                            }
                            elem = elem.parentNode
                        }
                        $('#xusqa_div_config').hide()
                        $(document).off('click.xusqa_event')
                    })
                } else {
                    $('#xusqa_div_config').hide()
                }
            })

            $('#xusqa_div_config a').click(function(){
                let err = ''
                const ses = $('#xusqa_div_config textarea').val()
                const a = ses.split(/\s*[,，]\s*/)
                const r = []
                a.forEach(se => {
                    if (se && SE.hasOwnProperty(se) && SE[se]){
                        r.push(se)
                    } else {
                        err = err + se ? '“' + se + '”' : ''
                    }
                })

                if (err){
                    $V.$message.error(STR.CONFIG.SE_NO_PRICE.format({se : err}))
                } else{
                    const s = r.join(',')
                    if (s){
                        $S.xusqa_onekeyGetTaskSEs = s
                        $('#xusqa_div_config').hide()
                        $V.$message.success(STR.CONFIG.SUCCESS)
                    } else {
                        $('#xusqa_div_config textarea').val(util.getDefaultSEs())
                    }
                }
            })
        }
    })
}

function tryModifyColumnWidth(){
    const t = $('#app div.main-content div.list div.el-table div.el-table__body-wrapper table.el-table__body')
    let timer
    if (t.length != 0 && t[0].__vue__ && t[0].__vue__.columns){
        const c = t[0].__vue__.columns
        c[0].minWidth = 82
        c[1].minWidth = 68
        c[2].minWidth = 140
        c[3].minWidth = 45
        c[4].minWidth = 45
        c[6].minWidth = 80
        c[6].width = 80
        c[8].minWidth = 70  
    } else {
        clearTimeout(timer)
        setTimeout(tryModifyColumnWidth, 100)
    }
}

function init(){
    let timer
    if (window.app && window.app.__vue__ && window.app.__vue__.$router) {
        $V = window.app.__vue__
        $V.$router.afterEach((to, from) => {
            try{
                if (from.name == 'Login'){
                    //tryAddHeaderButton()
                    //location.reload()
                }
        
                if (to.name == 'Mytasks') {
                    tryModifyColumnWidth()
                }

                if (to.name == 'TaskChoose') {
                    recCheckTaskList()
                }
            }catch(error){
                console.error(error)
            }
        })

        tryAddHeaderButton()

        $(document).ready(function(){
            if (location.hash.indexOf('#/task/choose') != -1 ){
                recCheckTaskList()
            } else if (location.hash.indexOf('#/mytasks') != -1 ){
                tryModifyColumnWidth()
            }
        })

    } else {
        clearTimeout(timer)
        timer = setTimeout(init, 200)
    }
}

init()

})()

/*!
 * 本脚本使用 MIT 协议
 *
 * MIT许可证（MIT）
 * 版权所有 © 2018 徐。355088586@qq
 * 在此授予任何获得此软件和相关文档文件（“软件”）副本的人免费许可，以无限制地处理本软件，包括
 * 但不限于使用，复制，修改，合并，发布，分发，再授权和/或出售本软件的副本，
 * 并允许本软件的授予人员遵从以下情况：
 *
 * 上述版权声明和本许可声明应包含在本软件的所有副本或重要部分中。
 *
 * 本软件按“原样”提供，不提供任何以表达或暗示，包括但不限于销售，适用于特定用途和不侵权的保证。
 * 在任何情况下，作者或版权所有人不对因软件或软件的使用或其他事宜产生的任何索赔，损害或其他责任
 * （无论是在合同，侵权或其他方面的诉讼中）负责。
 *
 * The MIT License (MIT)
 * Copyright © 2018 2018 Hacktsui,355088586@qq
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the “Software”), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */