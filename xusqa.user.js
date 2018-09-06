// ==UserScript==
// @name         有道搜题录题助手
// @namespace    jacktsui
// @version      1.0.045
// @description  有道搜题，录题员助手(一键领取任务,广场任务数量角标显示,任务报告,一键整理,定位答案,框选截图,放大镜,题目保存和恢复,优化系统行为等)
// @author       Jacktsui
// @copyright    © 2018, 徐。355088586@qq.com
// @license      MIT https://mit-license.org/
// @homepageURL  https://github.com/jacktsui/xusqa
// @supportURL   https://github.com/jacktsui/xusqa/issues
// @UpdateURL    https://github.com/jacktsui/xusqa/raw/master/xusqa.user.js
// @require      https://cdn.bootcss.com/jquery/3.3.1/jquery.js
// @require      https://cdn.bootcss.com/imgareaselect/0.9.10/js/jquery.imgareaselect.min.js
// @match        http://searchq-editsys.youdao.com/
// @grant        none
// @run-at       document-start
// @note         一键整理为实验性功能
// @note         编写原则: 助手尽量保持系统原有行为和样貌,修改过的地方都打了标记
// @note         未来计划: 重点维护一键整理功能,提高录题效率是脚本的终极目标
// @note         最近更新：2018.09.04 添加个人中心脚本配置(护眼色等)),本月报告及其他优化和bug修复
// @note         最近更新：2018.08.11 框的准自动切割答案和解析
// @note         最近更新：2018.08.05 添加题目保存和恢复功能及其他小功能
// @note         最近更新：2018.07.23 添加万能点(`)功能
// @note         最近更新: 2018.07.21 添加化学整理规则,优化一键整理排版,判题按钮添加规则提示,添加[框的准]功能
// @note         最近更新：2018.07.17 添加放大镜功能，题目页和答案页框选后可以放大；优化缩小体验，现在点缩小滚动条会自动追随选框
// @note         最近更新：2018.07.13 优化题目页“新增框选”可以直接定位题目，优化答案页“新增框选”保证框总在可视区。修复答案页在右靠时，框选按钮消失的问题
// @note         最近更新：2018.07.10 添加框选截图功能。题目图片上可以直接拖框截图，题目页和答案页可以用原来的框选截图
// @note         最近更新: 2018.07.07 定位答案添加定位到“上次位置”
// ==/UserScript==

(function() {
    'use strict';

    const ver = 'Ver 1.0.045'

/**
 * 放前面方便统一更换
 * 8月19号bootcss广州部分地区不能访问
 * 8月1号staticfile出过问题,部分地区不能访问
 * 备用cdn服务器
 * https://cdn.bootcss.com/
 * https://cdn.staticfile.org/
 * https://cdnjs.cloudflare.com/ajax/libs
 *
 */
const CDN = 'https://cdn.bootcss.com/'

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
    '英语-小学': 0.4,
    '语文-小学': 1.1,
    '历史-小学': NaN,
    '政治-小学': NaN,
    '地理-小学': NaN,
}

const DIC = {
    TONE: {
        a:'āáǎà', o:'ōóǒò', e:'ēéěè', i:'īíǐì', u:'ūúǔù', v:'ǖǘǚǜ',
    },
    OCR: {
        A: {
            'a':'α', 'B':'β', '3':'β', 'y':'γ',
        },
        R: {
            'L':'⊥', 'n':'∩', '//':'∥', 'C':'⊂',
        },
    },
    PUN:{
        ',':'，', '.':'。', ':':'：', ';':'；', '?':'？', '!':'！',
    },
    SN:{ // \u2460-\u2469
        '1':'①','2':'②','3':'③','4':'④','5':'⑤','6':'⑥','7':'⑦','8':'⑧','9':'⑨','0':'⑩',
    },
    RN:{ // \u2160-\u2169
        '1':'Ⅰ','2':'Ⅱ','3':'Ⅲ','4':'Ⅳ','5':'Ⅴ','6':'Ⅵ','7':'Ⅶ','8':'Ⅷ','9':'Ⅸ','0':'Ⅹ',
    },
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
    TAB: '&nbsp;&nbsp;&nbsp;&nbsp;',
    US6: '______',
    US3: '___',
    HR: '</p><hr/><p>',
    P: '</p><p>',
    ULB: '<span style="text-decoration: underline;">', ULE: '</span>',
}
let RULEFLAG
function setRuleFlag(html){
    if (/数列/.test(html)){
        RULEFLAG = 1001
    }
}
const USRRULE = []
const RULE = [
    /*\
       正则表达式语法参考:
     > http://www.runoob.com/jsref/jsref-obj-regexp.html
       ECMA
     > http://www.ecma-international.org/ecma-262/5.1/#sec-15.10
       MDN(需要翻墙)
     > https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
       JavaScript Regular Expression Visualizer.
     > https://jex.im/regulex/
       Unicode 11.0 Character Code Charts
     > http://www.unicode.org/charts/
       完整的CJK Unicode范围（5.0版）
     > https://blog.oasisfeng.com/2006/10/19/full-cjk-unicode-range/
    \*/

    /*\
     * ^ 或 -: 排除
     * uid: 0-题目,1-答案,2-解析,3-点评,4-知识点
     *
     * 特别注意:
     * - 在[]里是特殊字符,要么放在开头,要么放在结尾,要么转义,容易进坑
     *
     * html 转义:
     * https://dev.w3.org/html5/html-author/charref
     * https://developer.mozilla.org/en-US/docs/Glossary/Entity#Reserved_characters
     * "   &#34;   &quot;
     * &   &#38;   &amp;
     * <   &#60;   &lt;
     * >   &#62;   &gt;
     * 不断开空格(non-breaking space)   &#160;  &nsp;
    \*/
    // 清理
    [/\|$/g, '', '英语'], // |竖线
    [/([、•,.:?!\(\)=+-])\s+/g, '$1', '^英语'], // 去掉标点符号和(,),=,+,-两边的空格,排除英语.
    [/;\s+/g, ';', '^英语', '^1'], // 答案后面的;空格不去
    [/\s+([、•,.;:?!\(\)=+-])/g, '$1', '^英语'],
    //[/\s+$/, ''], // 去掉结尾的空格,意义在哪,忘了，先弃用
    [/\(\s*\d+\s*分\s*\)/g, ''], // 去掉分数(3 分)
    [/(图测*)\s*[\s0-9A-Z\.-]{2,}/g, '$1', '数学,物理,化学'], // 去掉如图所示中间的代号
    [/(\d)\s+\.\s*(\d)/g, '$1.$2', '数学,物理,化学'], // 去掉小数点前后空格
    [/(\d)\.\s+(\d)/g, '$1.$2', '数学,物理,化学'],
    [/-([A-Z\s])/g, '—$1', '英语'], //- ->— 待测试
    [/-+([\u4E00-\u9FA5])/g, '——$1', '英语'],
    [/（/g, '(', '数学,物理,化学,英语'], // 懒得切换输入法,所以...
    [/）/g, ')', '数学,物理,化学,英语'],

    // 简单替换
    //[\u2E80-\u9FFF]中文字符, [\u4E00-\u9FA5]中文汉字; '好'.charCodeAt(0).toString(16) "597d"
    [/[,:!?]/g, function(_){ // 中文标点符号
        return DIC.PUN[_]
    }, '语文'],
    [/([^tp]);/g, '$1；', '语文'], // ;可能被用作html转义
    [/([^A-Z0-9a-z])\./g, '$1。', '语文'], // .也单独处理
    [/…+/g, '……', '语文'],
    [/([\u2E80-\u9FFF\uFF00-\uFFEF]|”|)-(“|[\u2E80-\u9FFF\uFF00-\uFFEF])/g, '$1——$2', '语文'], // 修正破折号识别错误
    [/&quot;([\u2E80-\u9FFF\uFF00-\uFFEF]+)”/g, '“$1”', '语文'], // 修正全角双引号识别成半角双引号
    [/“([\u2E80-\u9FFF\uFF00-\uFFEF]+)&quot;/g, '“$1”', '语文'],

    [/\s*“\s*/g, '"', '英语,数学,物理,化学'], // 理科和英语用半角
    [/\s*”\s*/g, '"', '英语,数学,物理,化学'],
    [/。/g, '.', '英语,数学,物理,化学'],

    // 上下文有关联性
    [/([A-Z]{2})\s*\/\//g, '$1∥', '数学'], // 平行
    [/([A-Z]{2})\s*L/g, '$1⊥', '数学'], // 垂直
    [/[LZ<\/]([A-Z]{3})/g, '∠$1', '数学'], // 角∠
    [/([\u4E00-\u9FA5.,+=-])\s*[LZ\/]([1-9A-Z])/g, '$1∠$2', '数学'], // ∠1,∠2,∠A,∠B 需要测试
    [/口([A-Z]{4})/g, '▱$1', '数学'],
    [/(∠[0-9A-Z]+=\d+)&quot;/g, '$1°', '数学'], // &quot;->°
    [/(∠[0-9A-Z]+=\d+)[0%]([^°])/g, '$1°$2', '数学'],
    [function(str){ //
        let m
        const rt = []

        m = str.match(/∠/g)
        if (m && m.length > 2){ // TODO:待调整和优化,先占坑
            const dic = {
                '300' : '30°',
                '600' : '60°',
                '900' : '90°',
                '1200' : '120°',
                '1800' : '180°',
                '3600' : '360°',
            }
            rt.push([/([=+-])(\d+)/g, function(_,$1,$2){
                return $1 + (dic[$2] || $2)
            }])
            rt.push(/(∠[0-9A-Z]+=)(\d{2,3})([^\d°])/g, '$1$2°$3')
        }

        if(!str.match(/梯形|方形|菱形|边形|矩形/)){
            rt.push([/A([A-Z]{3})/g, '△$1']) // A->△
        }

        m = str.match(/[圆心]/g) // 特征码
        if (m && m.length > 1){
            rt.push([/(\D)00/g, '$1⊙O']) // 0->O, 00->⊙O
        }

        m = str.match(/线/g)
        if (m){
            rt.push([/0([A-Z])/g, 'O$1']) // 直线 0A->OA
            rt.push([/([A-Z])0/g, '$1O'])
        }

        if (rt.length){
            return rt
        }
    }, '数学'],
    [/线\s*1/g, '线 l', '数学'], // 线1->线l
    [/00\s*([内上中与于的])/g, '⊙O $1', '数学'],
    [/([在与于是])\s*00/g, '$1 ⊙O', '数学'],
    [/([圆点心过])\s*0/g, '$1 O', '数学'], // 点 0->点 O
    [/[0。]\s*([做是为点])/g, 'O $1', '数学'],
    [/(角|sin|cos|tan)\s*a/g, '$1 α', '数学'],
    [/又\s*[:.]{2,}/g, '又∵ ', '数学'],
    [/^[:.]{2,}/g, '∴', '数学'], // TODO:因为所以,待测试
    [/,*[:.]{2,}/g, ', ∴', '数学'],
    [/([\(\[][+-]*\d+)\,\s*\+[0o]+\)/g, '$1,+∞)', '数学'], // A.(-1,+0) B.(1,+o) C.(-1,1)
    [/\(-[0o]+\,\s*([+\-]*\d+[\)\]])/g, '(-∞,$1', '数学'], // D.(-00,1)
    [/([A-Z])n([A-Z])/, '$1∩$2', '数学'], // MnN
    [/\b([a-z]|B|3)([LnC]|\/\/)([a-z]|B|3)/g,
        function(_, $1, $2, $3){ // 纠正α(a),β(B,3),γ(y)识别错误
            $1 = DIC.OCR.A[$1] || $1
            $2 = DIC.OCR.R[$2] || $2
            $3 = DIC.OCR.A[$3] || $3
            return $1 + $2 + $3
        }, '数学'],

    [/kW\.h/g, 'kW·h', '物理'], // 单位TODO:需要收集更多的单位,形成字典

    [/(L)\.(s|min)/g, '$1·$2', '化学'],
    [/(\d)\s*x\s*(\d)/g, '$1×$2', '化学'], // x->×
    [/H20/g, 'H2O', '化学'], // H20->H2O
    [/CI/g, 'Cl', '化学'], // CI->Cl
    [/([a-zA-Z])0/g, '$1O', '化学'], // 修正O被识别为0
    [/AH([=<>])/, 'ΔH$1', '化学'],
    //[/[A-Z][2-9]*4/g, ] // TODO:修正↑被识别成4，需要更多样本，占个坑
    [/([\d\)])[xX]\s*([\d\()])/g, '$1×$2', '物理,化学'],
    [/([A-Za-z])([xX])(\d+)/g, '$1×$2', '物理,化学'],

    [function(str){ // 电子结构式?忘了是个什么东西了,长这样的1s22s22p63s2
        const r = /([1-4][sp][1-6])/g
        let sm = '', sp = ''
        let t = 0

        let e = r.exec(str)
        while (e){
            t++
            sm += e[0]
            sp += e[0][0] + e[0][1] + DIC.SUPB + e[0][2] + DIC.SUPE
            e = r.exec(str)
        }

        if (t > 1) { // 至少出现两次
            return str.replace(sm, sp)
        }
    }, '化学'],
    [function(/*str*/){
        if( RULEFLAG === 1001){
            return [[/([abS])([n]|\d+)/g, '$1<sub>$2</sub>'], ]
        }
    },'数学'],
    [/(log)(\d+)/g, '$1<sub>$2</sub>', '数学'],
    [/10(-[1-9][0-9]*)\s*([a-zA-Z])/g, '10<sup>$1</sup>$2'], // 10-2 mol
    [/([m])([2-3])/g, '$1<sup>$2</sup>', '物理'],
    [/(\d+)\s*[Xx×]\s*10([1-9][0-9]*)/g, '$1×10<sup>$2</sup>', '物理,化学'], // 识别科学计数法
    [/(\([a-z])([0-2])(\s*,\s*[a-z])([0-2])(\s*\))/g, '$1<sub>$2</sub>$3<sub>$4</sub>$5', '数学'], // D(x1 ,x2) 识别坐标
    [/(\([\da-zA-Z+-]{2,}\))(\d+)/g, '$1<sup>$2</sup>', '数学'], // 括号角标,认为是上角标
    [/([a-z])([2-9][0-9]*)/g, '$1<sup>$2</sup>', '数学'], // 上下角标,执行简单规则:2以上认为是上角标,0和1认为是下角标,后续优化根据上下文关系
    [/([A-Z][A-Z])([2-9])/g, '$1<sup>$2</sup>', '数学'], // 比如直角三角形:AC2=AB2+BC2,上角标
    [/([a-z])([0-1])/g, '$1<sub>$2</sub>', '数学,物理'], // 下角标
    [/([A-Z])([0-9])/g, '$1<sub>$2</sub>', '数学,物理'],
    [/([xyzabcnk])E([RN])([\*\"]*)/g, '$1∈$2<sup>*</sup>', '数学'], // xER->x∈R, nEN"

    [/mol\.L[-1]{1,2}/g, 'mol·L<sup>-1</sup>', '化学'],
    [/[\.•]mol[-1]{1,2}/g, '·mol<sup>-1</sup>', '化学'],
    [/\.(s|min)[-1]{1,2}/g, '·$1<sup>-1</sup>', '化学'], // 上标

    [/\(([a-zA-Z])([2-9]*[+-])\)/g, '($1<sup>$2</sup>)', '化学'], // 括号里的离子上标,放前头先处理
    [/([a-zA-Z])([2-9]*[+-])([\u2E80-\u9FFF,.+=-])/g, '$1<sup>$2</sup>$3', '化学'], // 离子上标 Cu2++
    [/([a-zA-Z])([2-9]*[+-])$/g, '$1<sup>$2</sup>', '化学'], // 末尾的离子上标

    [/(\([A-Z][1-9a-zA-Z]+\))([2-9]|[1-9][0-9])/g, '$1<sub>$2</sub>', '化学'], // 化学分子符号下标
    [/([a-zA-Z]+)([2-9])/g, '$1<sub>$2</sub>', '化学'], // 下标

    // 整理括号
    [/\(\s*\)/g, '(&nbsp;&nbsp;&nbsp;&nbsp;)', 0, '0'], // ( )->(    )

    // 分段
    [/\s*([AB]\:)/g, DIC.P + '$1', '英语', '0'], // A和B对话
    [/\s*([MW]\:)/g, DIC.P + '$1', '英语', '2'], // 听力解析W和M对话
    [/(\([A-G]\))/g, DIC.P + '$1', '英语,物理,化学', '0'], // ex: A.goodB.better (A)good(B)better(1)
    [/([^A-Z])\s*([A-G]\.)/g, '$1' + DIC.P + '$2', '^英语', '0'], // ex: A.goodB.better 排除:ABC.

    // 统一格式
    [/([0-9a-zA-Z>])([\u4E00-\u9FA5])/g, '$1 $2'], // 汉字前面的字符和汉字之间加空格 >上下标符号等特殊处理
    [/([\u4E00-\u9FA5])([0-9a-zA-Z])/g, '$1 $2'], // 汉字后面的字符和汉字之间加空格

    [/(\d+\.)\s+([A-Za-z]+)/g, '$1$2', '英语', '12'], // 统一去掉答案和解析点后面的空格
    //[/(\d+\.)([A-D])(\s+)/g, '$1$2' + DIC.TAB, '英语', '2'], // 英语解析
    //[/(\d+\.)([A-Za-z]+)(\s+)([\u4E00-\u9FA5])/g, '$1$2' + DIC.TAB + '$4', '英语', '2'], // 5.sleepy 此处 look 为连系动词,后面应跟形容词; sleep 的形容词形式为 sleepy,意为 "欲睡的,困乏的".
    [/【*解析:*】*/g, '', '英语', '2'], // 删除解析字样

    // 试用,看看效果
    [/([^\.])\.\s*\.\s*\.*([^\.])/g, '$1...$2', '英语'],
    [/…+/g, '……', '英语','2'],
    [/,$/,'.','英语','2'],
    [/([\u4E00-\u9FA5])[\s…]+([\u4E00-\u9FA5])/g, '$1……$2', '英语', '2'], // 英语解析
    [/([\u4E00-\u9FA5])\s+([\u4E00-\u9FA5])/g, '$1……$2', '语文', '^1'], // 语文排除答案
]

/**
 * 处理的是ORC返回的结果,最先执行,只对框的狠有效,自动执行
 * 先留出接口,备用,暂时用不到
 */
const ORCRULE = [
    //
]
/**
 * 一键整理预处理规则
 */
const PRERULE = [ // 处理的是html全文,主要处理需要上下文关系的规则,尽量不要在此处添加规则
    [/([\u4E00-\u9FA5])(<br><\/p><p>|<br>)([\u4E00-\u9FA5])/g, '$1$3', '语文,英语,物理,化学'], // 去掉两个汉字之间的多余换行,主要是OCR识别引入的无效换行
    [/([a-z]+)(<br><\/p><p>|<br>)([0-9a-z]+)/g, '$1 $3', '英语'], // 两个单词之间除了空格没有别的,判定换行多余
    [/(<p><br><\/p>)/g, ''], // 清除空行
    [/(<p><br>)/g, '<p>'],

    // 万能点`·
    // 英语数字前面`: `1->___1___,相关代码在上面f里
    [/`{2}([\u4E00-\u9FA5]{2})/g, DIC.ULB + '$1' + DIC.ULE, '语文'], // 两个点后面两个汉字加下划线
    [/`([\u4E00-\u9FA5])/g, DIC.ULB + '$1' + DIC.ULE, '语文'], // 语文里面`代表给后面的汉字加下划线
    [/`([0-9])/g, function(_,$1){ // 语文数字前面加`:`1->①
        return DIC.SN[$1] || $1
    }, '语文'],
    [/`([\u2460-\u2469])/g, '<sup>$1</sup>', '语文'], // \u2460-\u2469表示:①->⑩,语文序号前面加`变上标:`①-><sup>①</sup>
    [/`/g, '______'], // 最后`代表一个空

    [/([1-4])([aoeiuv])/g, function(_,$1,$2){ // 语文声调
        const i = parseInt($1)
        return DIC.TONE[$2][i-1]
    }, '语文'],
    [/\(\s*\d{4}\s*[\u4E00-\u9FA5·]+\)/, '', '^', '0'], // (2018山东青岛黄岛区期中)
    [/\(\s*\d{4}.+☆\)/, '', '^', '0'],
    [function(str){ // 如果就一道题的话,去掉题号
        let m = str.match(/\d+[·.,]*\s*([\u4E00-\u9FA5])/)
        if (m && m.index < 7){ //
            str = str.slice(0,m.index) + str.slice(m.index + m[0].length - m[1].length)
            return str
        }
    }, '^英语', '0'],

    [function(str){ // 如果就一道题的话,去掉题号
        let m = str.match(/\d+[·.,]*\s*([A-Za-z])/)
        if (m && m.index < 7){ //
            str = str.slice(0,m.index) + str.slice(m.index + m[0].length - m[1].length)
            return str
        }
    }, '英语', '0'],

    [/(\d)[·,]([\u4E00-\u9FA5])/g,'$1.$2', '语文'], // 纠正ocr点识别错误,将1.识别为1·,1,

    // 加分割线hr
    [/<hr>/g, ''], // 先清空hr,避免重复添加,TODO:寻找更优雅的办法
    [/<p><\/p>/g, ''],
    [/(\(*[1-9]\)|\(*[1-3][0-9]\))/g, DIC.HR + '$1', '英语', '0'], // (1),(2),1),2)
    [/(\(*[2-9]\)|\(*[1-3][0-9]\))/g, DIC.HR + '$1', '英语', '^0'],
    [/(\([1-9]\))/g, DIC.HR + '$1', '语文,数学,物理,化学', '0'], // (1),(2)
    [/(\([2-9]\))/g, DIC.HR + '$1', '语文,数学,物理,化学', '^0'],
    [function(str, uid){ // 语文分割线
        const b = O.newNum
        const ra = []
        const r = /([^0-9\()])(\d{1,2})([\.,·]*)([^0-9\)])/g
        const m = str.match(r)
        if (m && m.length > 2){
            let start = util.getStartFromMatch(m), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur - start === num - 1){ // 效验
                    ra.push([e[0], e.index, e[1] + ((uid !== 0 && num === 1) ? '' : DIC.HR) + (b ? num : e[2]) + '.' + e[4]])
                    num++
                }
                e = r.exec(str)
            }
            if (num > 3){
                return util.replByMatch(str, ra)
            }
        }
    }, '语文'],
    [function(str){
        const b = O.newNum

        str = str.replace(/\(\s+\)/g, '\(\)')
        str = str.replace(/<p><br><\/p>/g, '')

        let r, m
        let type //0.普通 1.补全对话2.完型填空
        const ra = []

        r = /`(\d+)\.*/g // 优先处理点,数字前面加点->___1___
        m = str.match(r)
        if (m && m.length > 2){
            let start = -1, cur = -1
            let num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[1])
                if (num === 1){
                    start = cur
                }
                if (cur - start === num - 1){
                    ra.push([e[0], e.index, DIC.US3 + (b ? num : cur) + DIC.US3])
                    num++
                }
                e = r.exec(str)
            }
            if (num > 3){
                str = util.replByMatch(str, ra)
                type = 0
            }
        }

        ra.splice(0,ra.length)
        let is = false
        r = /([A-Za-z]+:\s)/g
        m = str.match(r)
        if (m && m.length > 2){// 判断是不是补全对话
            is = true
        } else {
            r = /\s\d{1,2}\s\(/g
            m = str.match(r)
            if (m && m.length > 2){ //单词填空
                is =true
            }
        }
        if (is){ // (考虑根据题目要求“根据对话内容,从方框内选出能填入空白处的最佳选项。其中有两项为多余选项。”判断是不是补全对话)
            //r = /([A-Za-z]+:\s)(\d{1,2})\.*(\s)/g
            r = /(\s)(\d{1,2})[,?\.\s]/g
            let start = util.getStartFromMatch(str.match(r)), cur = -1
            let num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur === start && num > 2){
                    break
                }
                if (cur - start === num - 1){
                    ra.push([e[0], e.index, e[1] + DIC.US3 + (b ? num : cur) + DIC.US3])
                    num++
                }
                e = r.exec(str)
            }
            if (num > 3){
                str = util.replByMatch(str, ra)
                type = 1
            }
        }

        ra.splice(0, ra.length)
        str = str.replace(/&nbsp;(\d+)/g, ' $1') // 发现数字前面有&nbsp;的题目,影响解析
        m = str.match(/[a-z]\s\d{1,2}\.*\s[a-z]/g)
        if (m && m.length > 2){ // TODO:判断是不是完型填空,算法需要优化
            //r = /(\D)(\d{1,2})\.*(\D)/g
            //r = /([^0-9#:%>])(\d{1,2})\.*([^0-9#:%])/g
            r = /([\s,.])(\d{1,2})\.*([\s,.])/g

            let start = util.getStartFromMatch(str.match(r)), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur === start && num > 2){ // 完形填空主文结束,下面是选项,跳出去处理选项
                    break
                }
                if (cur - start === num - 1){ // 效验
                    ra.push([e[0], e.index, e[1] + DIC.US3 + (b ? num : cur) + DIC.US3 + e[3]])
                    num++
                }
                e = r.exec(str)
            }
            if (num > 3){
                str = util.replByMatch(str, ra)
                str = str.replace(/___\s\(/g, '___(')
                type = 2
            }
            // 处理小题,借用下面小题的代码,不return.
        }

        // 小题
        ra.splice(0, ra.length) // 清空
        //r = /([^0-9_]])(\(*\)*)(\d{1,2})([\.,]*)([^0-9_])/g
        //r = /([^_#3])(\(*\)*)(\d{1,2})([\.,]*)([^_#:])/g //'3': &#39;单引号,':'排除时间
        str = str.replace(/\(&nbsp;&nbsp;&nbsp;&nbsp;\)/g, '()')
        r = /([^_#:0-9])(\(*\)*)\s*(\d+)([\.,]*)([^_:])/g //'3': &#39;单引号,':'排除时间
        m = str.match(r)
        if (m && m.length > 2){ // 匹配超过3个以上
            let start = util.getStartFromMatch(str.match(r)), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[3])
                if (cur - start === num - 1){ // 严格模式
                    ra.push([e[0], e.index, e[1] + DIC.HR + (e[2].length === 1 ? '()' : e[2]) + (b ? num : cur) + '.' + (~[',','.'].indexOf(e[5]) ? '' : e[5])])
                    num++
                }
                e = r.exec(str)
            }

            if (num > 3){
                str = util.replByMatch(str, ra)
            }
        }

        if (type === 1){ // 补全对话
            str = str.replace(/([A-Za-z]+:)/g, DIC.P + '$1')
            str = str.replace(/([A-G]\.)/g, DIC.P + '$1')
        } else if (type === 2){ // 完型填空,选项用4个空格隔开
            str = str.replace(/&nbsp;&nbsp;&nbsp;&nbsp;([B-D]\.)/g, '$1') //先清理,防止重复添加
            str = str.replace(/([B-D]\.)/g, DIC.TAB + '$1')
        } else { // 非完形填空,分段换行
            str = str.replace(/([A-G]\.)/g, DIC.P + '$1')
        }

        str = str.replace(/(\s[b-z])\s(___)/g, '$1$2')
        r = /(\s)([b-z])(\s)/g
        m = str.match(r)
        if (m && m.length > 2){ // 单词首字母补全
            str = str.replace(r, '$1$2' + DIC.US6 + '$3')
        }

        return str
    }, '英语', '0'],

    [function(str){ // 答案页分隔符
        const b = O.newNum
        const r = /(\D)(\d{1,2})([\.,]*)(\D)/g
        const ra = []
        const m = str.match(r)
        if (m && m.length > 2){
            let start = util.getStartFromMatch(m), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur - start === num - 1){ //答案也加入序列号验证
                    ra.push([e[0], e.index, e[1] + (num === 1 ? '' : DIC.HR) + (b ? num : cur) + '.' + e[4]])
                    num++
                }
                e = r.exec(str)
            }
            return util.replByMatch(str, ra)
        }
    }, '英语', '^0'],

    [function(str){ // (汉字)->______(汉字),(few)->______(few)
        //const r = /(\([\u4E00-\u9FA5]+\)|\([a-z]{2,}\))/g
        const r = /([^_])(\([a-z]+\)|\([a-z]+\s[a-z]+\))/g
        const m = str.match(r)
        const ra = []
        if (m && m.length > 2) { // 匹配超过3个以上
            let e = r.exec(str)
            while(e){
                ra.push([e[0], e.index, e[1] + DIC.US6 + e[2]])
                e = r.exec(str)
            }

            return util.replByMatch(str, ra)
        }
    }, '英语', '0'],

    [/[A-GT]{4,}/,function(_){ // 英语答案 ABCDABCD,多于4个开始执行
        let str = '1.' + _[0]
        for(let i = 1, l = _.length; i < l; i++){
            str += DIC.HR + (i+1) + '.' + _[i]
        }
        return str
    }, '英语', '1'],
]

const AFTRULE = [ // 清理空段
    [/<p><\/p>/g, ''],
]
/*<-<-<-<-<-<- 配置区结束 <-<-<-<-<-<*/

// strings ------>
const STR = {
    MODULE: {
        TASK_TODAY: '今日战绩',
        TASK_REPORT: '本月报告',
        TASK_PREMONTH: '上月结算',
        TASK_PAST: '往期结算',
        EXTRA_TASK_SQUARE: '任务广场',
        EXTRA_OCR: '框的狠',
        ONEKEY_GET_TASK: '一键领取',
        ONEKEY_FORMAT: '一键整理',
        SNAP: '截图',
        GLASS: '放大镜',
        LOCATE_ANSWER: '上次位置',
    },
    ONEKEY_GET_TASK: {
        WAITING: '正在寻找任务……',
        SUCCESS: '已领取任务“{se}”题目录入',
        NOMORE_TASK: '没有多余的任务 T_T',
    },
    EXTRA_TASK_SQUARE: {
        REFRESH_SUCCESS: '任务广场已成功刷新',
        WAIT_APPROVAL: '未通过',
        REFRESH: '正在刷新',
    },
    EXTRA_OCR: {
        SUCCESS: '框选成功',
    },
    TASK_REPORT: {
        PROGRESS: '正在生成报告……',
    },
    LOCATE_ANSWER: {
        LOCATE_PAGENO_SUCCESS: '已成功定位上次位置:{pageno}',
        LOCATE_PAGENO_ERROR: '定位上次位置失败',
    },
    SNAP: {
        FAILED: '请点击“新增框选”选择要截图的区域',
        WAIT: '正在生成截图...',
        SUCCESS: '插入截图成功',
    },
    GLASS: {
        FAILED: '请点击“新增框选”选择要放大的区域',
    },
    CONFIG: {
        SE_NO_PRICE: '{se}没有价格',
        SUCCESS: '配置成功',
    },
    HINT: {
        EXTRA_OCR: '助手提示: 增强框选功能,自动填充答案和解析等',
        LOCATE_ANSWER: '助手提示: 第一次找到答案后，点我可以直接跳过去',
        QUESTION_BOX_ADD_CUT: '助手提示: 现在点击新增框选会自动定位到题目',
        ANSWER_BOX_ADD_CUT: '助手提示: 修复新增框选不在可视范围的bug',
        SNAP: '助手提示: 框选以后可以点我直接截图',
        GLASS: '助手提示: 点我可以放大框选区域',
        MIN: '助手提示，现在缩小会自动追踪选框',
        ONEKEY_FORMAT: '实验性功能:\r' +
            '新增`(键盘Tab上边的那个键)功能\r' +
            '`处将插入______,英语数字前面加`将插入___1___,语文汉字前点`可以加下划线,韵母前敲1234可以加声调\r' +
            '1.一键整理,对结果不满意可以按ctr+z撤销\r' +
            '2.可以自动排版,修复部分OCR识别错误,添加分隔符,换行,上下角标等等\r' +
            '3.整理前最好先把一些关键字符的识别错误进行修正,主要包括括号,数字和ABCD后面的.等\r' +
            '注:测试有限,如有bug,或出现诡异行为,请保留样本(点最左边的html,ctrl+a全选,复制到记事本)及时反馈,帮助优化脚本',
        SEARCH_LOSE: '属于差题的情况：\r' +
            '不管“搜到”还是“没搜到”，检索结果中的题目都有可能是差题，只要是差题就不符合标准，也就是说这样的题目是不能用的，我们丢掉这样的题目，并且把给出的题目录到系统中。\r' +
            '1.检索结果的内容中出现其它网站名称、链接、水印。\r' +
            '2.检索结果的答案有明显错误，没有回答、答非所问等。\r' +
            '3.检索结果的内容杂乱，不是一道题，而是一整篇试卷或其他（注意此类情况要区别于阅读题等内容较长的大题、关联题）。\r' +
            '4.检索结果中的公式大量使用非标准公式或符号。\r' +
            '5.检索结果内容缺失：出现图片、表格或其他题目内容缺失或损坏。\r' +
            '6.排版杂乱导致无法阅读。',
        SEARCH_FAIL: '本质上不是同一道题。\r' +
            '容易误判的情况（以下判断结果应为“没搜到”）：\r' +
            '①题型不同、选项不同、所挖的空不同：这些方面只要有所不同，即便看起来搜到的结果能解决问题，也都归为“没搜到”\r' +
            '②解题相关的条件变化：尤其要注意如数字等一些细节方面与解题相关的条件的不同（可能题目大体看上去没有不同），这些不同对解题及答案有影响，此类归为“没搜到”\r' +
            '③搜到的题目“小于”给出的题目：即搜到的题目与给出的题目不完全匹配，或是部分相交，这种情况都算做“没搜到”\r',
        SEARCH_STANDARD: '搜到：\r' +
            '检索结果要与给出题目的题型、题目条件、问题都一致。\r' +
            '容易误判的情况（以下判断结果应为“搜到”）：\r' +
            '①与解题无关的内容不一样：但本质上是同一道题；如：人、物名称，无关描述等，这些内容虽然不同，但本质上仍是同一道题，归为”搜到“。\r' +
            '②搜到的题目“大于”给出的题目：即搜到的题目包含了给出的题目，归为“搜到”\r' +
            '③选项都相同但位置不同：题目问题选项都一样，就选项位置不一样，归为“搜到”\r' +
            '④问法不同，但问题本质，即意思一样：只要是同样的问题，本质上仍是同一道题，归为“搜到”\r',
    },
    ERROR: {
        STOP: '异常，需要手动刷新',
        POLICYDENY: '策略已阻止此操作',
    },
    SHAREQQ: {
        QTIME: '查询时间: {qtime}',
        NO_TASK: '当前没有任务可以分享',
        EXPIRED: '要分享的信息已过期, 刷新后重试',
    },
}

const DOM = {
    USER: '#app div.main-content header div.right span.user',
    EXIT: '#app div.main-content header div.right a:last-child',
    NAV_MY_TASK: '#app nav ul.list li a[href="#/mytasks"]',
    NAV_TASk_CHOOSE: '#app nav ul.list li a[href="#/task/choose"]',
    POSITION: '#app > div > div.main-content > div > div > div.position',
    TASK_SQUARE_LI: '#app div.main-content ul.task-list li',
    MYTASK_ADDTIME: '#app > div > div.main-content > div > div > div.process-task-con > div:nth-child(2) > a.add-time',
    QJUDGE_BTN: '#app > div > div.main-content > div > div > div.search-btns >a',
    DBSN: '#app > div > div.main-content > div > div > div:nth-child(4) > div:nth-child(8) > div > div.item-cell-value',

    EDIT_PAGE: '#app div.main-content div.main-wrap div.edit-page',
    EDIT_PAGE_QUESTION_CON: '#app > div > div.main-content > div > div > div.update-con',

    QUESTION_IMG : '#app div.main-content div.question-img-con img',
    QUESTION_CON: '#app > div > div.main-content > div > div > div.quesion-answer-con',
    QUESTION_BOX: '#app > div > div.main-content > div > div > div.quesion-answer-con > div:nth-child(3)',
    QUESTION_BOX_ADD_CUT: 'div.region-con > a.add-cut',
    QUESTION_BOX_LATEX_BUTTON: '> div > div.region-con > a.submit-region.latex',
    QUESTION_BOX_MIN: 'div.fixed-box_header a.fixed-box_min',
    QUESTION_BOX_IMG_CTN: 'div.fixed-box_container.has-cut-box',
    QUESTION_BOX_IMG: 'div.fixed-box_container.has-cut-box img',
    QUESTION_BOX_IMG_SEL: 'div.fixed-box_container.has-cut-box > div > div',

    ANSWER_BOX: '#app > div > div.main-content > div > div > div.quesion-answer-con > div:nth-child(4)',
    ANSWER_BOX_CLOSE: 'div.fixed-box_header a.fixed-box_close',
    ANSWER_BOX_JUMP_INPUT: '> div > div.fixed-box_pages > div > span > div > input',
    //ANSWER_BOX_JUMP_BTN: 'div.fixed-box_header div.fixed-box_pages button',
    ANSWER_BOX_ADD_CUT: 'div.fixed-box_header > div.region-con > a.add-cut',
    ANSWER_BOX_LATEX_BTN: '> div > div.region-con > a.submit-region.latex',
    ANSWER_BOX_MIN: 'div.fixed-box_header a.fixed-box_min',
    ANSWER_BOX_IMG_CTN: '#answerCutBox',
    ANSWER_BOX_IMG: '#answerCutBox > img',
    ANSWER_BOX_IMG_SEL: '#answerCutBox > div > div',
}

/**
 * https://www.ietf.org/rfc/rfc2396.txt
 * url 转义
 * +   URL 中+号表示空格 %2B
 * 空格  URL中的空格可以用+号或者编码    %20
 * /   分隔目录和子目录    %2F
 * ?   分隔实际的URL和参数 %3F
 * %   指定特殊字符  %25
 * #   表示书签    %23
 * &   URL 中指定的参数间的分隔符 %26
 * =   URL 中指定参数的值 %3D
 */
const BASEURL = 'http://searchq-editsys.youdao.com'
const URL = {
    GET_TASK: BASEURL + '/editsys/task/receive?tasktype=题目录入&subject={subject}&education={education}',
    GET_TASK_REMAIN: BASEURL + '/editsys/task/remain?subject={subject}&education={education}',
    GET_MY_TASK: BASEURL + '/editsys/task/mine?pageno={pageno}',
    GET_TASK_SQUARE: BASEURL + '/editsys/task/square',
    GET_PROFILE: BASEURL + '/editsys/user/profile',
    UPLOAD_IMAGE: BASEURL + '/editsys/ueditor/config?action=uploadimage',
    OCR: BASEURL + '/editsys/ocr',
    QUESTION: 'http://searchq-editsys.youdao.com/editsys/question?id={id}',
    SHAREQQ: 'http://connect.qq.com/widget/shareqq/index.html?{params}',
    getRandomImg: function(){
        const n = Math.floor(Math.random()*(123-1+1)+1)
        return 'http://pde64pw8u.bkt.clouddn.com/image/random/png/{n}.png'.format({n:n})
    },
}
//<------ strings end.

const TPL = {
    CONFIG_MAIN: '<div id="xusqa_div_config" style="position: absolute;left: 604px;z-index: 9999;width: 352px;' +
        'background-color: var(--navbgcolor);box-shadow: var(--navbgcolor) 3px 0px 15px;display: none;margin-top: 20px;">' +
        '<div style="width: 0px;top: -30px;z-index: 1000;left: 76px;position: absolute;height: 0px;border-width: 18px;' +
        'border-style: solid;border-color: transparent transparent var(--navbgcolor) transparent;"></div>' +
        '<span style="color: white;">调整一键领取任务顺序，用逗号分隔</span>' +
        '<textarea rows="5" cols="1000" style=" font-size: 16px; width: 92%; overflow:hidden; resize:none;"></textarea>' +
        '<div style="text-align: left;padding-left: 8px;font-size: 14px;"><input type="checkbox" id="xusqa_showHint" checked="checked"' +
        ' name="showHint" title="显示助手提示" style="width: 16px;height: 16px;vertical-align: middle;display: inline-block;margin-bottom: 6px;">' +
        '<label for="xusqa_showHint">显示助手提示</label>' +
        '<a data-v-7b90ba54 href="javascript:void(0);" class="exit header-btn" style="float: right; margin: 0px 12px 10px 20px; padding: 6px 20px 6px 20px;" title="全部清空后点确定,将重新加载所有有价格的科目.">确定</a></div>',
    CONFIG_BUTTON: '<a data-v-7b90ba54 id="xusqa_div_config_button" href="javascript:void(0);" class="exit header-btn" style="margin-left: 1px; padding: 6px 3px;">┇</a>',
    SNAP_QUESTION_HINT: '<span style="margin-left: 266px;display:inline-block;color: #f56c6c;border-right: 1px solid #f56c6c;padding: 5px;border-top: 1px solid #f56c6c;">助手提示: 在下面题目图片上可以直接框选截图哦</span>',
    SNAP_QUESTION_BUTTON: '<a href="javascript:;" class="xusqa-btn" title="助手提示: 框选以后可以点我直接截图" style="display: inline-block;float: right;background-color: #f78989;color: white;font-size: 16px;width: 60px;text-align: center;position: absolute;left: 561px;top: 324px;">截图</a>',
    GLASS: '<canvas " width="100px" height="100px" style="position: absolute;top: 0px;left: 0px;z-index: 9527;border: 1px solid #67c23a;border-radius: 10px; box-shadow: 0 3px 15px #67c23a;"></canvas>',
    LOCATE_ANSWER: '<a href="javascript:;" class="xusqa-btn" style="margin-left: 30px;display: inline-block;padding: 3px 10px;border: 1px solid #c0c4cc;border-radius: 3px;color: #606266;font-size: 13px;background-color: white;" title="{title}">{text}<a/>',
    SQUARE_UPDATE: '<div data-v-403910d4 id="xusqa-square-update" class="process-task-con">最后刷新时间：<a  style="padding: 0px 10px;color: #f93e53;" >　刚刚　</a><a href="javascript:;" class="xusqa-a-button xusqa-btn">　刷新　</a><a href="javascript:;" class="xusqa-a-button xusqa-btn">分享到QQ</a></div>',
    ACC_INFO: '<div style=" font-size: 12px; font-style: italic; margin-bottom: 16px;">以上数据仅供参考.</div>',
    THIS_ACC_INFO: '<div style=" font-size: 12px; font-style: italic; margin-bottom: 16px;">{remark}数据仅供参考.</div>',
    EDIT_PAGE_SAVE: '<a href="javascript:;" class="xusqa-btn" style="display: inline-block;float: right;background-color: #337ab7;color: white;font-size: 16px;padding: 2px 16px;margin-left: 16px;" title="助手提示: 录题过程中可以临时保存当前录入内容，防止丢失">暂存题目</a>',
    EDIT_PAGE_RESTORE: '<a href="javascript:;" class="xusqa-btn" style="display: inline-block;float: right;background-color: gray;color: white;font-size: 16px;padding: 2px 16px;margin-left: 16px;" title="助手提示: 恢复为最后一次保存时的状态">恢复题目</a>',
    EDIT_PAGE_SAVE_SAMPLE: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;float: right" title="助手提示: 收集样本,帮助作者优化一键整理,一定要在整理前收集">收集样本</a>',
    EDIT_PAGE_CLEAR_KNOWLEDGE: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;float: right;" title="助手提示：清除无关知识点,下次同一任务的将会自动清除">清除</a>',
    EDIT_PAGE_MOVETO_ANALYSIS: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;float: right;" title="助手提示：将答案内容快速移动到解析">⇩</a>',
    EDIT_PAGE_PICKUP: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;" title="助手提示：从解析中快速提取答案、点评和知识点">⇵</a>',
    OPTIONS:'<div data-v-322b822a class="list-item"><div data-v-322b822a class="item-title">助手配置'+ver+'</div></div>',
    OPTIONS_SWITCH: '<div data-v-322b822a class="item-cell-con"><div data-v-322b822a class="item-cell"><div data-v-322b822a class="item-cell-title">{title}</div><div data-v-322b822a class="item-cell-value"><input class="switch switch-anim" type="checkbox" checked /></div></div></div>',
    OPTIONS_NUMBER: '<div data-v-322b822a class="item-cell-con"><div data-v-322b822a class="item-cell"><div data-v-322b822a class="item-cell-title">{title}</div><div data-v-322b822a class="item-cell-value"><input type="number" min="{min}" max="{max}" step="{step}" title="{hint}" /></div></div></div>',
    OPTIONS_BUTTON: '<div data-v-322b822a class="item-cell-con"><div data-v-322b822a class="item-cell"><div data-v-322b822a class="item-cell-title">{title}</div><div data-v-322b822a class="item-cell-value"><button data-v-322b822a="" type="button" class="el-button el-button--info el-button--small"><span>{text}</span></button></div></div></div>',
    OPTIONS_SEPARATE: '<div data-v-322b822a="" class="item-cell-con"><div data-v-322b822a="" class="item-cell"><hr></div></div>',
}

const EPCOLOR = [
    ['默认值', '#FFFFFF'],
    ['杏仁黄', '#FAF9DE'],
    ['秋叶褐', '#FFF2E2'],
    ['胭脂红', '#FDE6E0'],
    ['青草绿', '#E3EDCD'],
    ['海天蓝', '#DCE2F1'],
    ['葛巾紫', '#E9EBFE'],
    ['极光灰', '#EAEAEF'],
]

const $ = window.$
const C = window.console, S = window.localStorage
let U, V

/**
 * config key
 * 调用方法,ctrl+shift+j,打开控制台, example: xusqapi.newNum = ture
 > debug: true or false, 用于输出调试信息
 > showHhint: true or false, 是否开启助手提示
 > snapZoom: [0.25, 5], 截图缩放比例, 默认值2
 > onekeyGetTaskSEs: "数学-初中,物理-高中,英语-高中,语文-初中", 一键领取科目顺序
 > onekeyGetTaskStep: 一键领取任务单次发送的请求数,1-N,默认10;数越大速度越快,越小顺序越准确,1完全匹配顺序
 > glassMinzoom: 放大镜最小放大倍数
 > newnum: true or false, 用于英语题目序号是否从1开始重新排,默认 true
 > autoSliceAnalysis: true or false, orc识别的时候自动分割答案和解析
 */
/* jshint -W003 */
const O = {/* jshint +W003 */
    opts: S.hasOwnProperty('xusqa_options') ? JSON.parse(S.xusqa_options) : {},

    get options(){
        return this.opts
    },
    setOptions: function(key, value){
        this.opts[key] = value
        S.xusqa_options = JSON.stringify(this.opts)
    },

    get debug(){
        return this.opts.debug
    },
    set debug(bDebug){
        if (typeof(bDebug) === 'boolean'){
            this.setOptions('debug', bDebug)
        } else {
            C.error('开启或者关闭调试: true 或 false')
        }
    },

    get newNum(){
        return this.opts.hasOwnProperty('newNum') ? this.opts.newNum : true
    },
    set newNum(bNew){
        if (typeof(bNew) === 'boolean'){
            this.setOptions('newNum', bNew)
        } else {
            C.error('设置小题序号是否从 1 重新开始排: true 或 false')
        }
    },

    get showHint(){
        return this.opts.hasOwnProperty('showHint') ? this.opts.showHint : true
    },
    set showHint(b){
        if (typeof(b) === 'boolean'){
            this.setOptions('showHint', b)
        } else {
            C.error('设置是否显示助手提示, true 或者 false')
        }
    },

    get snapZoom(){
        let f = this.opts.snapZoom
        return f > 1 ? f : 2
    },
    set snapZoom(zoomLevel){
        let f = parseFloat(zoomLevel)
        if (f >= 0.25 && f <= 5){
            this.setOptions('snapZoom', f)
        } else{
            C.error('数值无效,截图缩放比例取值范围 [0.25, 5]，最佳比例建议设为 1-3 倍')
        }
    },

    get sn(){
        return this.opts.sn || ''
    },
    set sn(sn){
        this.setOptions('sn', sn)
    },

    get onekeyGetTaskSEs(){
        return this.opts.hasOwnProperty('onekeyGetTaskSEs') ? this.opts.onekeyGetTaskSEs : helper.getDefaultSEs()
    },
    set onekeyGetTaskSEs(ses){
        this.setOptions('onekeyGetTaskSEs', ses)
    },

    get onekeyGetTaskStep(){
        let i = this.opts.onekeyGetTaskStep
        return i > 0 ? i : 10
    },
    set onekeyGetTaskStep(stepSize){
        let i = parseInt(stepSize)
        if (i >= 1){
            this.setOptions('onekeyGetTaskStep', i)
        } else {
            C.error('数值无效,一键领取每次发送请求数为大于 1 的整数.数值越大,速度越快;数值越小,顺序越可靠')
        }
    },

    get excludedSEs(){ // 排除的学科
        return this.opts.excludedSEs
    },
    set excludedSEs(ses){
        ses = ses.trim()
        if (!ses){
            this.setOptions('excludedSEs', '')
            C.info('排除列表已清空.')
            return
        }

        let a = ses.replace(/，/g, ',').split(',')
        let err = ''
        for(let i of a){
            if (!SE.hasOwnProperty(i)){
                err += '“' + i + '”'
            }
        }
        if(err){
            C.error(err + '无效!请按以下格式输入学科,比如:"语文-小学";多个学科用逗号分开.')
        } else {
            this.setOptions('excludedSEs', ses)
        }
    },

    get glassMinzoom(){
        let i = this.opts.glassMinzoom
        return i > 1 ? i : 2
    },
    set glassMinzoom(zoomLevel){
        let f = parseFloat(zoomLevel)
        if (f >= 1 && f <= 5){
            this.setOptions('glassMinzoom', f)
        } else{
            C.error('数值无效,放大镜最小放大倍数 [1, 5]，最佳比例建议设为 1.5-3 倍')
        }
    },

    get autoSliceAnalysis(){
        return this.opts.hasOwnProperty('autoSliceAnalysis') ? this.opts.autoSliceAnalysis : true
    },
    set autoSliceAnalysis(autoSlice){
        if (typeof(autoSlice) === 'boolean'){
            this.setOptions('autoSliceAnalysis', autoSlice)
        } else {
            C.error('设置是否自动分配答案和解析, true 或者 false')
        }
    },

    get crazyMode(){
        return this.opts.crazyMode
    },
    set crazyMode(bCrazyMode){
        if (typeof(bCrazyMode) === 'boolean'){
            this.setOptions('crazyMode', bCrazyMode)
        } else{
            C.error('设置是否开启疯狂模式, true 或者 false')
        }
    },

    get fixSysBug(){
        return this.opts.hasOwnProperty('fixSysBug') ? this.opts.fixSysBug : true
    },
    set fixSysBug(bFixSysBug){
        if (typeof(bFixSysBug) === 'boolean'){
            this.setOptions('fixSysBug', bFixSysBug)
        } else{
            C.error('设置是否修复系统bug, true 或者 false')
        }
    },

    get epColor(){
        //C.log(EPCOLOR[i][0] + EPCOLOR[i][1])
        return this.opts.hasOwnProperty('epColor') ? this.opts.epColor : 0
    },
    set epColor(index){
        if (index >=0 && index < EPCOLOR.length){
            this.setOptions('epColor', index)
            document.documentElement.style.setProperty('--bgcolor', EPCOLOR[index][1])
            document.documentElement.style.setProperty('--navbgcolor', index === 0 ? '#337ab7' : '#606266')
        } else {
            C.log('数值无效,设置护眼色,序号 0-'+(EPCOLOR.length-1))
        }
    },

    get navImage(){
        return this.opts.hasOwnProperty('navImage') ? this.opts.navImage : false
    },
    set navImage(navImage){
        this.setOptions('navImage', navImage)
    },

    get clearFlag(){
        return this.opts.hasOwnProperty('clearFlag') ? this.opts.clearFlag : -1
    },
    set clearFlag(clearFlag){
        this.setOptions('clearFlag', clearFlag)
    },
}

// 暂存器,数据只在脚本运行期间有效,不保存
const stage = {
    scroll: { // 记录答案页滚动条位置
        flag: 0,
        top: 0,
        left: 0,
    },
    editPage: { // 记录题目所在页码，用来判断新增框选时当前页是不是题目所在页
        v: null,
        questionPageno: -1
    },
    profile: {
        qqnumber: undefined,
        permission: null,
        isValidSN: O.crazyMode,
    },
    timer:{}, // 用来统一存放计时器,用于清理计时器,目前没有做特别处理
    squareUpdateTime: new Date(), // 任务广场最后更新时间
    startLoginTime: new Date(), // 记录等待登录开始时间
    simpleSubject: undefined, // 记录提取的样本的subject
}

/**
 * util 与项目无关的公共函数
 */
/* jshint -W003 */
const util = {/* jshint +W003 */
    cmt: function(f) {
        return f.toString().replace(/^[\s\S]*\/\*.*/, '').replace(/.*\*\/[\s\S]*$/, '').replace(/\r\n|\r|\n/g, '\n')
    },

    addStyle: function(str, id){
        const style = document.createElement('style')
        style.textContent = str
        if (id){
            style.id = id
        }
        document.head.appendChild(style)
        return style
    },

    importCssFile: function(src){
        function importcf(cf){
            let importCSS=document.createElement('link')
            importCSS.rel = 'stylesheet'
            importCSS.href = cf
            document.getElementsByTagName('head')[0].appendChild(importCSS)
        }

        if (Array.isArray(src)){
            for (let cf of src){
                importcf(cf)
            }
        } else {
            importcf(src)
        }
    },

    replByMatch: function(str, arr){
        for(let i = arr.length - 1; i >= 0; i--){
            str = str.slice(0, arr[i][1]) + arr[i][2] + str.slice(arr[i][1] + arr[i][0].length)
        }
        return str
    },

    getStartFromMatch: function(arr){
        function count(k, a){ // 返回与第k个元素能构成序列的个数
            let n = 0
            for(let i = k + 1; i < a.length; i++){
                if (a[i]-a[k] === 1 + n){
                    n++
                }
            }
            return n
        }

        const numArr = []
        for(let i of arr){
            numArr.push(parseInt(i.match(/\d+/)[0]))
        }

        let n = count(0, numArr)
        let start = numArr[0]
        for(let i = 1, m; i < numArr.length; i++){
            m = count(i, numArr)
            if (m > n){
                n = m
                start = numArr[i]
            }
        }

        return start
    },

    timeAgo: function(milliseconds){
        const sec = milliseconds/1000
        for(let i of DIC.AGO){
            if (sec > i[0]){
                return i[1]
            }
        }
    },

    isInteger: function (obj) {
        return obj%1 === 0
    },

    toFixed: function(num, dp){
        return Math.floor(num * Math.pow(10,dp)) / Math.pow(10,dp)
    },

    noop: function(){},

    de: function(str) {
        const decs = Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1)
        const len = str.length
        let c1, c2, c3, c4
        let i = 0, out = ''
        while (i < len) {
            do {
                c1 = decs[str.charCodeAt(i++) & 0xff]
            } while (i < len && c1 == -1)if (c1 == -1) {
                break
            }
            do {
                c2 = decs[str.charCodeAt(i++) & 0xff]
            } while (i < len && c2 == -1)if (c2 == -1) {
                break
            }
            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4))
            do {
                c3 = str.charCodeAt(i++) & 0xff
                if (c3 == 61) {
                    return out
                }
                c3 = decs[c3]
            } while (i < len && c3 == -1)if (c3 == -1) {
                break
            }
            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2))
            do {
                c4 = str.charCodeAt(i++) & 0xff
                if (c4 == 61) {
                    return out
                }
                c4 = decs[c4]
            } while (i < len && c4 == -1)if (c4 == -1) {
                break
            }
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4)
        }
        return out
    },
}
// util end------>

/**
 * helper: 与项目相关的公共函数
 */
/* jshint -W003 */
const helper = {/* jshint +W003 */
    get msg() {
        V.$message.closeAll()
        return V.$message
    },

    closeMessage: function(){
        V.$message.closeAll()
    },

    getEditor: function(index){
        let u
        for(let key in U.instants){
            u = U.instants[key]
            if (u.uid % 5 === index){
                return u
            }
        }
    },

    snapLoading: function(index){
        const timestrap = (+new Date()).toString(36)
        const loaderId = 'loading_' + timestrap
        const html = '<img class="loadingclass" id="' + loaderId + '" src="http://searchq-editsys.youdao.com/static/Ueditor/themes/default/images/spacer.gif" title="正在上传..." />'
        const qe = helper.getEditor(index)
        qe.focus()
        qe.execCommand('inserthtml', html)
        return loaderId
    },

    getDefaultSEs: function() {
        return stage.profile.permission.join(',')
    },

    isExcludedSE(se){
        if (O.excludedSEs){
            return (O.excludedSEs).indexOf(se) !== -1
        }
        return false
    },

    saveUserRules: function(){
        S.xusqa_userRules = JSON.stringify(USRRULE)
    },

    loadUserRules: function(){
        let r = S.xusqa_userRules ? JSON.parse(S.xusqa_userRules) : []
        return r
    },

    isInEditPage: function(){
        return location.hash.indexOf('#/mytasks/qinput?') === 0
    },

    getTaskId: function(){
        return stage.editPage.v.data.tbpageid
    },

    getInputSubject: function(){
        function assort(s){
            if (s === '理数' || s === '文数'){
                return '数学'
            }
            return s
        }

        if (O.debug && stage.simpleSubject){
            C.log('%c%s','color: red; background: yellow; font-size: 14px;','--- 样本测试模式 ---');
            return assort(stage.simpleSubject)
        }
        return assort(stage.editPage.v.data.subject)
    },

    getInputQuestionId: function(){
        return stage.editPage.v.data.id
    },

    saveQuestion: function(simple){
        if (!this.isInEditPage()){
            return
        }
        const id = this.getInputQuestionId()
        const q = {
            id: id,
            savetime: new Date(),
            subject: this.getInputSubject(),
            question: this.getEditor(0).getContent(),
            answer: this.getEditor(1).getContent(),
            analysis: this.getEditor(2).getContent(),
            comment: this.getEditor(3).getContent(),
            knowledge: this.getEditor(4).getContent(),
        }
        const key = simple ? ('xusqa_sample_' + id) : 'xusqa_lastSavedQuestion'
        S[key] = JSON.stringify(q)
        const msg = simple ? ('样本已收集,题目:' + id) : ('题目:' + id + '已成功保存')
        this.msg.success(msg)
    },

    listSimple: function(){
        const rt = []
        for (let key in S){
            const m = key.match(/xusqa_sample_(\d+)/)
            if (m){
                rt.push(m[1])
            }
        }
        return rt
    },

    removeSimple: function(id){
        const key = 'xusqa_sample_' + id
        if (S[key]){
            S.removeItem(key)
            return 200
        } else {
            return -1
        }
    },

    restoreQuestion: function(){
        if (!this.isInEditPage()){
            return false
        }

        const cid = this.getInputQuestionId()
        if (S.hasOwnProperty('xusqa_lastSavedQuestion')){
            const q = JSON.parse(S.xusqa_lastSavedQuestion)
            if (q && cid === q.id){
                this.getEditor(0).setContent(q.question, false)
                this.getEditor(1).setContent(q.answer, false)
                this.getEditor(2).setContent(q.analysis, false)
                this.getEditor(3).setContent(q.comment, false)
                this.getEditor(4).setContent(q.knowledge, false)
                return true
            }
        }

        this.msg.error('恢复失败,题目:' + cid + '未保存过')
        return false
    },

    debugSimple: function(id){
        const key = 'xusqa_sample_' + id
        if (S.hasOwnProperty(key)){
            const q = JSON.parse(S[key])
            if (q){
                stage.simpleSubject = q.subject
                this.getEditor(0).setContent(q.question, false)
                this.getEditor(1).setContent(q.answer, false)
                this.getEditor(2).setContent(q.analysis, false)
                this.getEditor(3).setContent(q.comment, false)
                this.getEditor(4).setContent(q.knowledge, false)
                O.debug = true
                return true
            }
        }

        C.log('未找到样本:' + id)
        return false
    },

    exitDebugSimple: function(){
        stage.simpleSubject = undefined
        O.debug = false
        return true
    },

    clearKnowledge: function(){
        this.getEditor(4).setContent('', false)
    },

    getKnowledge: function(){
        return this.getEditor(4).getContent()
    },

    cloneButton: function(button, text, title){
        if (typeof(button) === 'string'){
            button = $(button)
        }
        return button.clone().addClass('xusqa-btn').text(text).attr('title', title)
    },

    getCheckedTaskIdArray: function(){
        const a = []

        for(let k in S) {
            if (k.indexOf('xusqa_acc_month_') === 0){
                a.push.apply(a, JSON.parse(S[k]))
            }
        }

        return a
    },

    getPre2CheckedTaskIdArray: function(){
        const a = []
        const prem = this.getPreMonth(new Date())

        for(let k in S) {
            if (k.indexOf('xusqa_acc_month_') === 0){
                const ms = k.match(/_(\d{6})/)[1]
                if (ms < prem){
                    a.push.apply(a, JSON.parse(S[k]))
                }
            }
        }

        return a
    },

    checkPre2CheckedTaskIdArray: function(){
        const prem = this.getPreMonth(new Date())

        for(let k in S) {
            if (k.indexOf('xusqa_acc_month_') === 0){
                const ms = k.match(/_(\d{6})/)[1]
                if (ms < prem && S[k]){
                    return true
                }
            }
        }

        return false
    },

    getFirstDay: function(now){
        return new Date(now.getFullYear(), now.getMonth(), 1);
    },

    getPreMonthFirstDay: function(now){
        let y = now.getFullYear()
        let m = now.getMonth()
        if (m === 0){
            m = 11
            y = y - 1
        } else {
            m = m - 1
        }

        return new Date(y, m, 1)
    },

    getPreMonth: function(now){
        if (now.getMonth() === 0){
            return now.getFullYear() -1 + '12'
        }else {
            return 1900 + now.getYear() + ('0' + (now.getMonth())).slice(-2);
        }
    },

    getPre2Month: function(now){
        if (now.getMonth() === 0){
            return now.getFullYear() -1 + '11'
        }else if(now.getMonth() === 1){
            return now.getFullYear() -1 + '12'
        }else{
            return 1900 + now.getYear() + ('0' + (now.getMonth() - 1)).slice(-2);
        }
    },

    isLogin: function(){
        if (V && V.$store){
            return V.$store.getters.isLogin
        }
    },
}

// css------>
util.importCssFile([
    CDN + 'imgareaselect/0.9.10/css/imgareaselect-animated.css',
])

function refreshNavImage(){
    if (O.navImage){
        util.addStyle(util.cmt(function(){/*!CSS
            .nav[data-v-3f6ca4fa] {
                background: url(https://bing.ioliu.cn/v1/rand?w=180&h=1280);
            }
            .list li a[data-v-3f6ca4fa] {
                background: linear-gradient(30deg, #333, #fff);
                -webkit-background-clip: text;
                color: transparent;
            }
            .list li .router-link-active[data-v-3f6ca4fa] {
                background: linear-gradient(30deg, #67c23a, #f56c6c);
                -webkit-background-clip: text;
                color: transparent;
                text-shadow: 6px 6px 18px #ffffffdd;
            }
            .show-btn[data-v-3f6ca4fa] {
                background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAABGElEQVRYhe2WwU3EMBBF/4y404KTCrYEt0AFbAlsB3QAdBA6yXZABbZLoAJ/LnuBTIjXwkFa+Um+jKzMUyb+MdDpdG4QsYokkVLyANiiqXPuLLJsfWdtDiE8AXhpIXJ5/gnAa5GMqs4kz61kRGQ261aRbDKd742NMWnzrldQLBNjnBp6ACiUiTFOJB//XWYvkU2ZPUWAlaNdInLJovuapqr6BuCzSCaldCx4I9WhmHMWAM9FMs65KcbofxNS1Yec86FGRlUX6QtshN7PUY3jaO6v4erQG4bhKCLvfyWwxebR3ltoAcnFCiFMVr12WfQf5RprOXMg2exyJSInAB9FMjlnD8C3kiHpLZmtO3ATnHOz9c10Op2b5At2T8CLPCQKsgAAAABJRU5ErkJggg==) 50% 50% no-repeat;
            }
            .nav-wrap.hide .show-btn[data-v-3f6ca4fa] {
                background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAABS0lEQVRYhe2X0U3DMBRFjxH/eARvQNigI3QDugFlAjpCOwFsABvQTECZoO0EzQaXD9vECQToh2M+cqSoflKjHPn52glMTJyHAZAEYIFr4AgcRpUwpi0kWUl7tcwlMdYVuQy/S8AlskvgJYwd8JhxYt7D8z5lDr0/NL1xnVFm16nCdK1Di7aSXIk2pQu4GHEBXxS16NGXcSUkIlHGAq/AHjgBVQmZmKYFMAtjC6x79XNGhxpYpTJ/uSEXX6JtJe1CtBtJ1X+IdoXfABtGJEZ72meGSGWeAOHjXSTasU0LuidzTTfadxkdGmPMBtpou19uuAlSOfg22k0S7VnpaFt8a3YUeu2coj1EKrMC3vCHYq7F+iPpqf0QxhW+ffNQO+A2o8MRv8cNRjudGQfcA1eZZDadKryAx2hLhb6b0jQ5fLu24RqNzhflxMQZfAD5sixWHxwsSwAAAABJRU5ErkJggg==) 50% 50% no-repeat;
            }
            */
        }), 'xusqa-nav-img')
    } else {
        $('#xusqa-nav-img').remove()
    }
}

// 护眼色
util.addStyle(util.cmt(function(){/*!CSS
:root{
    --bgcolor: #FFFFFF;
    --navbgcolor: #337ab7;
}
body { background-color: var(--bgcolor) !important; }
table { background-color: var(--bgcolor)}
td { background-color: var(--bgcolor)}
.fixed-box_content[data-v-69bf5445] {
    background: var(--bgcolor);
}
.fixed-box_content[data-v-69bf5445] {
    background: var(--bgcolor);
}
.fixed-box_content[data-v-ce69c62c] {
    background: var(--bgcolor);
}
.el-table th, .el-table tr {
    background-color: var(--bgcolor);
}
.nav[data-v-3f6ca4fa] {
    background-color: var(--navbgcolor);
    box-shadow: 3px 0 15px var(--navbgcolor);
}
header[data-v-7b90ba54] {
    background: var(--navbgcolor);
    box-shadow: 0 3px 15px var(--navbgcolor);
}
*/
}))

// css 替换
util.addStyle(util.cmt(function(){/*!CSS
#answerCutBox {
    top: 182px;
}

.box_min .region-con[data-v-ce69c62c] {
    display: block;
}

.latex[data-v-ce69c62c] {
    margin-right: 16px;
}

.latex[data-v-69bf5445] {
    margin-right: 16px;
}

.submit-region[data-v-ce69c62c] {
    overflow: hidden;
}

.process-title[data-v-403910d4] {
    margin-right: 150px;
}

.item-cell-title[data-v-322b822a], .item-cell-value[data-v-322b822a] {
    vertical-align: middle;
}
*/
}))

// add css sheet to header, not comment
util.addStyle(util.cmt(function(){/*!CSS
.xusqa-btn {
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
    border-color: transparent transparent var(--bgcolor) transparent;
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
    border-color: transparent transparent var(--bgcolor) transparent;
    display: block;
    position: absolute;
    top: -41px;
    z-index: -1;
    right: 20px;
}

.xusqa-corner-excluded {
    width: 80px;
    height: 80px;
    color: #fff;
    position: absolute;
    transform: rotateZ(-45deg);
}

.xusqa-corner-excluded:after {
    content: '';
    border-width: 40px;
    width: 0;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent #ebeef5 transparent;
    display: block;
    position: absolute;
    top: -60px;
    z-index: -2;
}

.xusqa-corner-excluded:before {
    content: '';
    border-width: 20px;
    width: 0;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent var(--bgcolor) transparent;
    display: block;
    position: absolute;
    top: -41px;
    z-index: -1;
    right: 20px;
}

.xusqa-c-message {
    position: fixed;
    top: 30px;
    left: 50%;
    background: var(--bgcolor);
    min-width: 240px;
    color: #666;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    z-index: 9999;
}

.xusqa-c-message--tr{
}

.xusqa-c-message--main {
    padding-left: 50px;
    padding-right: 20px;
}

.xusqa-c-message--icon {
    color: #fff;
    width: 40px;
    height: 40px;
    text-align: center;
    position: absolute;
    left: 0;
    top: 0;
    line-height: 40px;
}

.xusqa-c-message--success {
    background: #13CE66 url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iNDBweCIgdmlld0JveD0iMCAwIDQwIDQwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+aWNvbl9zdWNjZXNzPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IkVsZW1lbnQtZ3VpZGVsaW5lLXYwLjIuNCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ik1lc3NhZ2UiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02MC4wMDAwMDAsIC0yMTIuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSLluKblgL7lkJFf5L+h5oGvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MC4wMDAwMDAsIDIxMi4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIGlkPSJSZWN0YW5nbGUtMiI+CiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Imljb25fc3VjY2VzcyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtMiIgZmlsbD0iIzEzQ0U2NiIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48L3JlY3Q+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNy44MjU1ODE0LDE3LjE0ODQzNTcgTDE5LjAxNzQ0LDI1LjgyODEyMTMgQzE4LjkwMTE2MDksMjUuOTQyNzA4MyAxOC43NjU1MDMzLDI2IDE4LjYxMDQ2NywyNiBDMTguNDU1NDI3LDI2IDE4LjMxOTc2OTMsMjUuOTQyNzA4MyAxOC4yMDM0ODY1LDI1LjgyODEyMTMgTDE4LjAyOTA3MTYsMjUuNjU2MjUgTDEzLjE3NDQxODYsMjAuODQzNzUgQzEzLjA1ODEzOTUsMjAuNzI5MTYzIDEzLDIwLjU5NTQ4MzcgMTMsMjAuNDQyNzA0NyBDMTMsMjAuMjg5OTI5MyAxMy4wNTgxMzk1LDIwLjE1NjI1IDEzLjE3NDQxODYsMjAuMDQxNjY2NyBMMTQuMzY2Mjc3MiwxOC44NjcxODU3IEMxNC40ODI1NiwxOC43NTI2MDIzIDE0LjYxODIxNzcsMTguNjk1MzEwNyAxNC43NzMyNTc3LDE4LjY5NTMxMDcgQzE0LjkyODI5NCwxOC42OTUzMTA3IDE1LjA2Mzk1MTYsMTguNzUyNjAyMyAxNS4xODAyMzA3LDE4Ljg2NzE4NTcgTDE4LjYxMDQ2NywyMi4yNzYwMzggTDI1LjgxOTc2OTMsMTUuMTcxODcxMyBDMjUuOTM2MDQ4NCwxNS4wNTcyODggMjYuMDcxNzA2LDE1IDI2LjIyNjc0MjMsMTUgQzI2LjM4MTc4MjMsMTUgMjYuNTE3NDQsMTUuMDU3Mjg4IDI2LjYzMzcyMjgsMTUuMTcxODcxMyBMMjcuODI1NTgxNCwxNi4zNDYzNTIzIEMyNy45NDE4NjA1LDE2LjQ2MDkzNTcgMjgsMTYuNTk0NjE1IDI4LDE2Ljc0NzM5NCBDMjgsMTYuOTAwMTczIDI3Ljk0MTg2MDUsMTcuMDMzODUyMyAyNy44MjU1ODE0LDE3LjE0ODQzNTcgTDI3LjgyNTU4MTQsMTcuMTQ4NDM1NyBaIiBpZD0iUGF0aCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+) no-repeat 0 50%;
}

.xusqa-c-message--error {
    background: #FF4949 url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iNDBweCIgdmlld0JveD0iMCAwIDQwIDQwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+aWNvbl9kYW5nZXI8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iRWxlbWVudC1ndWlkZWxpbmUtdjAuMi40IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iTWVzc2FnZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYwLjAwMDAwMCwgLTMzMi4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9IuW4puWAvuWQkV/kv6Hmga8iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwLjAwMDAwMCwgMzMyLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9IlJlY3RhbmdsZS0yIj4KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iaWNvbl9kYW5nZXIiPgogICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTIiIGZpbGw9IiNGRjQ5NDkiIHg9IjAiIHk9IjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PC9yZWN0PgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjUuODE3MjYyNywxNi4zNDUxNzk2IEMyNS45MzkwOTAyLDE2LjIyMzM0ODMgMjYsMTYuMDc2MTQxOCAyNiwxNS45MDM1NTIzIEMyNiwxNS43MzA5NjI4IDI1LjkzOTA5MDIsMTUuNTgzNzU2MyAyNS44MTcyNjI3LDE1LjQ2MTkyODkgTDI0LjUwNzYxNTcsMTQuMTgyNzQxMSBDMjQuMzg1Nzg4MiwxNC4wNjA5MTM3IDI0LjI0MzY1NzUsMTQgMjQuMDgxMjE5NiwxNCBDMjMuOTE4NzgxNywxNCAyMy43NzY2NTEsMTQuMDYwOTEzNyAyMy42NTQ4MjM1LDE0LjE4Mjc0MTEgTDIwLDE3LjgzNzU2MzUgTDE2LjMxNDcyMTYsMTQuMTgyNzQxMSBDMTYuMTkyODkwMiwxNC4wNjA5MTM3IDE2LjA1MDc1OTUsMTQgMTUuODg4MzIxNiwxNCBDMTUuNzI1ODg3NiwxNCAxNS41ODM3NTY5LDE0LjA2MDkxMzcgMTUuNDYxOTI5NCwxNC4xODI3NDExIEwxNC4xNTIyODI0LDE1LjQ2MTkyODkgQzE0LjA1MDc1ODIsMTUuNTgzNzU2MyAxNCwxNS43MzA5NjI4IDE0LDE1LjkwMzU1MjMgQzE0LDE2LjA3NjE0MTggMTQuMDUwNzU4MiwxNi4yMjMzNDgzIDE0LjE1MjI4MjQsMTYuMzQ1MTc5NiBMMTcuODM3NTYwOCwyMC4wMDAwMDE5IEwxNC4xNTIyODI0LDIzLjY1NDgyNDMgQzE0LjA1MDc1ODIsMjMuNzc2NjUxNyAxNCwyMy45MjM4NTgyIDE0LDI0LjA5NjQ0NzcgQzE0LDI0LjI2OTAzNzIgMTQuMDUwNzU4MiwyNC40MTYyNDM3IDE0LjE1MjI4MjQsMjQuNTM4MDcxMSBMMTUuNDYxOTI5NCwyNS44MTcyNTg5IEMxNS41ODM3NTY5LDI1LjkzOTA4NjMgMTUuNzI1ODg3NiwyNiAxNS44ODgzMjE2LDI2IEMxNi4wNTA3NTk1LDI2IDE2LjE5Mjg5MDIsMjUuOTM5MDg2MyAxNi4zMTQ3MjE2LDI1LjgxNzI1ODkgTDIwLDIyLjE2MjQzNjUgTDIzLjY1NDgyMzUsMjUuODE3MjU4OSBDMjMuNzc2NjUxLDI1LjkzOTA4NjMgMjMuOTE4NzgxNywyNiAyNC4wODEyMTk2LDI2IEMyNC4yNDM2NTc1LDI2IDI0LjM4NTc4ODIsMjUuOTM5MDg2MyAyNC41MDc2MTU3LDI1LjgxNzI1ODkgTDI1LjgxNzI2MjcsMjQuNTM4MDcxMSBDMjUuOTM5MDkwMiwyNC40MTYyNDM3IDI2LDI0LjI2OTAzNzIgMjYsMjQuMDk2NDQ3NyBDMjYsMjMuOTIzODU4MiAyNS45MzkwOTAyLDIzLjc3NjY1MTcgMjUuODE3MjYyNywyMy42NTQ4MjQzIEwyMi4xMzE5ODA0LDIwLjAwMDAwMTkgTDI1LjgxNzI2MjcsMTYuMzQ1MTc5NiBaIiBpZD0iUGF0aCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+) no-repeat 0 50%;
}

.xusqa-c-message--info {
    background: #20A0FF url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iNDBweCIgdmlld0JveD0iMCAwIDQwIDQwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+aWNvbl9pbmZvPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IkVsZW1lbnQtZ3VpZGVsaW5lLXYwLjIuNCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ik1lc3NhZ2UiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02MC4wMDAwMDAsIC0xNTIuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSLluKblgL7lkJFf5L+h5oGvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MC4wMDAwMDAsIDE1Mi4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIGlkPSJSZWN0YW5nbGUtMiI+CiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Imljb25faW5mbyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtMiIgZmlsbD0iIzUwQkZGRiIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48L3JlY3Q+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMS42MTUzODQ2LDI2LjU0MzIwOTkgQzIxLjYxNTM4NDYsMjYuOTQ3ODc1MSAyMS40NTgzMzQ4LDI3LjI5MTgzNjggMjEuMTQ0MjMwOCwyNy41NzUxMDI5IEMyMC44MzAxMjY4LDI3Ljg1ODM2ODkgMjAuNDQ4NzE5NCwyOCAyMCwyOCBDMTkuNTUxMjgwNiwyOCAxOS4xNjk4NzMyLDI3Ljg1ODM2ODkgMTguODU1NzY5MiwyNy41NzUxMDI5IEMxOC41NDE2NjUyLDI3LjI5MTgzNjggMTguMzg0NjE1NCwyNi45NDc4NzUxIDE4LjM4NDYxNTQsMjYuNTQzMjA5OSBMMTguMzg0NjE1NCwxOS43NDQ4NTYgQzE4LjM4NDYxNTQsMTkuMzQwMTkwNyAxOC41NDE2NjUyLDE4Ljk5NjIyOSAxOC44NTU3NjkyLDE4LjcxMjk2MyBDMTkuMTY5ODczMiwxOC40Mjk2OTY5IDE5LjU1MTI4MDYsMTguMjg4MDY1OCAyMCwxOC4yODgwNjU4IEMyMC40NDg3MTk0LDE4LjI4ODA2NTggMjAuODMwMTI2OCwxOC40Mjk2OTY5IDIxLjE0NDIzMDgsMTguNzEyOTYzIEMyMS40NTgzMzQ4LDE4Ljk5NjIyOSAyMS42MTUzODQ2LDE5LjM0MDE5MDcgMjEuNjE1Mzg0NiwxOS43NDQ4NTYgTDIxLjYxNTM4NDYsMjYuNTQzMjA5OSBaIE0yMCwxNS44MDQyOTgxIEMxOS40NDQ0NDI3LDE1LjgwNDI5ODEgMTguOTcyMjI0LDE1LjYxOTM2ODcgMTguNTgzMzMzMywxNS4yNDk1MDQ2IEMxOC4xOTQ0NDI3LDE0Ljg3OTY0MDYgMTgsMTQuNDMwNTI1NSAxOCwxMy45MDIxNDkxIEMxOCwxMy4zNzM3NzI2IDE4LjE5NDQ0MjcsMTIuOTI0NjU3NSAxOC41ODMzMzMzLDEyLjU1NDc5MzUgQzE4Ljk3MjIyNCwxMi4xODQ5Mjk1IDE5LjQ0NDQ0MjcsMTIgMjAsMTIgQzIwLjU1NTU1NzMsMTIgMjEuMDI3Nzc2LDEyLjE4NDkyOTUgMjEuNDE2NjY2NywxMi41NTQ3OTM1IEMyMS44MDU1NTczLDEyLjkyNDY1NzUgMjIsMTMuMzczNzcyNiAyMiwxMy45MDIxNDkxIEMyMiwxNC40MzA1MjU1IDIxLjgwNTU1NzMsMTQuODc5NjQwNiAyMS40MTY2NjY3LDE1LjI0OTUwNDYgQzIxLjAyNzc3NiwxNS42MTkzNjg3IDIwLjU1NTU1NzMsMTUuODA0Mjk4MSAyMCwxNS44MDQyOTgxIFoiIGlkPSJDb21iaW5lZC1TaGFwZSIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+) no-repeat 0 50%;
}

.xusqa-c-message--warning {
    background: #F7BA2A url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iNDBweCIgdmlld0JveD0iMCAwIDQwIDQwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+aWNvbl93YXJuaW5nPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ik1lc3NhZ2UiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02MC4wMDAwMDAsIC0yNzIuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSLluKblgL7lkJFf5L+h5oGvLWNvcHkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwLjAwMDAwMCwgMjcyLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9IlJlY3RhbmdsZS0yIj4KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iaWNvbl93YXJuaW5nIj4KICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS0yIiBmaWxsPSIjRjdCQTJBIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiPjwvcmVjdD4KICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTIxLjYxNTM4NDYsMjYuNTQzMjA5OSBDMjEuNjE1Mzg0NiwyNi45NDc4NzUxIDIxLjQ1ODMzNDgsMjcuMjkxODM2OCAyMS4xNDQyMzA4LDI3LjU3NTEwMjkgQzIwLjgzMDEyNjgsMjcuODU4MzY4OSAyMC40NDg3MTk0LDI4IDIwLDI4IEMxOS41NTEyODA2LDI4IDE5LjE2OTg3MzIsMjcuODU4MzY4OSAxOC44NTU3NjkyLDI3LjU3NTEwMjkgQzE4LjU0MTY2NTIsMjcuMjkxODM2OCAxOC4zODQ2MTU0LDI2Ljk0Nzg3NTEgMTguMzg0NjE1NCwyNi41NDMyMDk5IEwxOC4zODQ2MTU0LDE5Ljc0NDg1NiBDMTguMzg0NjE1NCwxOS4zNDAxOTA3IDE4LjU0MTY2NTIsMTguOTk2MjI5IDE4Ljg1NTc2OTIsMTguNzEyOTYzIEMxOS4xNjk4NzMyLDE4LjQyOTY5NjkgMTkuNTUxMjgwNiwxOC4yODgwNjU4IDIwLDE4LjI4ODA2NTggQzIwLjQ0ODcxOTQsMTguMjg4MDY1OCAyMC44MzAxMjY4LDE4LjQyOTY5NjkgMjEuMTQ0MjMwOCwxOC43MTI5NjMgQzIxLjQ1ODMzNDgsMTguOTk2MjI5IDIxLjYxNTM4NDYsMTkuMzQwMTkwNyAyMS42MTUzODQ2LDE5Ljc0NDg1NiBMMjEuNjE1Mzg0NiwyNi41NDMyMDk5IFogTTIwLDE1LjgwNDI5ODEgQzE5LjQ0NDQ0MjcsMTUuODA0Mjk4MSAxOC45NzIyMjQsMTUuNjE5MzY4NyAxOC41ODMzMzMzLDE1LjI0OTUwNDYgQzE4LjE5NDQ0MjcsMTQuODc5NjQwNiAxOCwxNC40MzA1MjU1IDE4LDEzLjkwMjE0OTEgQzE4LDEzLjM3Mzc3MjYgMTguMTk0NDQyNywxMi45MjQ2NTc1IDE4LjU4MzMzMzMsMTIuNTU0NzkzNSBDMTguOTcyMjI0LDEyLjE4NDkyOTUgMTkuNDQ0NDQyNywxMiAyMCwxMiBDMjAuNTU1NTU3MywxMiAyMS4wMjc3NzYsMTIuMTg0OTI5NSAyMS40MTY2NjY3LDEyLjU1NDc5MzUgQzIxLjgwNTU1NzMsMTIuOTI0NjU3NSAyMiwxMy4zNzM3NzI2IDIyLDEzLjkwMjE0OTEgQzIyLDE0LjQzMDUyNTUgMjEuODA1NTU3MywxNC44Nzk2NDA2IDIxLjQxNjY2NjcsMTUuMjQ5NTA0NiBDMjEuMDI3Nzc2LDE1LjYxOTM2ODcgMjAuNTU1NTU3MywxNS44MDQyOTgxIDIwLDE1LjgwNDI5ODEgWiIgaWQ9IkNvbWJpbmVkLVNoYXBlIiBmaWxsPSIjRkZGRkZGIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMC4wMDAwMDAsIDIwLjAwMDAwMCkgc2NhbGUoMSwgLTEpIHRyYW5zbGF0ZSgtMjAuMDAwMDAwLCAtMjAuMDAwMDAwKSAiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==) no-repeat 0 50%;
}

.xusqa-c-message--close {
    position: absolute;
    right: 10px;
    color: #999;
    text-decoration: none;
    cursor: pointer;
    font-size: 30px;
    top: 0;
    line-height: 34px;
    display: block;
    height: 40px;
}

.xusqa-c-message--close:hover {
    color: #666;
}

@keyframes xusqa-messageFadeInDown {
    0% {
        -webkit-transform: translate3d(0, -100%, 0);
        transform: translate3d(0, -100%, 0)
    }
    100% {
        -webkit-transform: none;
        transform: none
    }
}

.xusqa-c-message.xusqa-messageFadeInDown {
    -webkit-animation-duration: .6s;
    animation-duration: .6s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both -webkit-animation-name: xusqa-messageFadeInDown;
    animation-name: xusqa-messageFadeInDown;
}

@keyframes messageFadeOutUp {
    0% {
        opacity: 1
    }
    100% {
        opacity: 0;
        -webkit-transform: translateY(-100%);
        transform: translateY(-100%)
    }
}

.xusqa-c-message.messageFadeOutUp {
    -webkit-animation-duration: .6s;
    animation-duration: .6s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both -webkit-animation-name: messageFadeOutUp;
    animation-name: messageFadeOutUp
}

.xusqa-c-message--tip td {
    padding: 4px 10px 4px 10px
}

.switch {
    width: 57px;
    height: 28px;
    position: relative;
    border: 1px solid #dfdfdf;
    background-color: #fdfdfd;
    box-shadow: #dfdfdf 0 0 0 0 inset;
    border-radius: 20px;
    background-clip: content-box;
    display: inline-block;
    -webkit-appearance: none;
    user-select: none;
    outline: none;
}
.switch:before {
    content: '';
    width: 26px;
    height: 26px;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 20px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
.switch:checked {
    border-color: #a6a9ad;
    box-shadow: #a6a9ad 0 0 0 16px inset;
    background-color: #a6a9ad;
}
.switch:checked:before {
    left: 30px;
}
.switch.switch-anim {
    transition: border cubic-bezier(0, 0, 0, 1) 0.4s, box-shadow cubic-bezier(0, 0, 0, 1) 0.4s;
}
.switch.switch-anim:before {
    transition: left 0.3s;
}
.switch.switch-anim:checked {
    box-shadow: #a6a9ad 0 0 0 16px inset;
    background-color: #a6a9ad;
    transition: border ease 0.4s, box-shadow ease 0.4s, background-color ease 1.2s;
}
.switch.switch-anim:checked:before {
    transition: left 0.3s;
}
.xusqa-a-button {
    margin-left: 50px;
    background-color: #0070c9;
    background: linear-gradient(#42a1ec, #0070c9);
    border-color: #1482d0;
    padding: 4px 10px;
    font-size: 14px;
    color: #fff;
    border-radius: 4px;
    padding: 4px 16px;
    display: inline-block;
}
.xusqa-a-button:hover {
    background-color: #147bcd;
    background: linear-gradient(#51a9ee, #147bcd);
    border-color: #1482d0;
}
*/
}))
//<------ css end

// extend------>
// message box
$.extend({
    message: function(options) {
        let defaults = {
            message: ' 操作成功',
            time: '2000',
            type: 'success',
            showClose: false,
            autoClose: true,
            onClose: function() {}
        }

        if (typeof options === 'string') {
            defaults.message = options
        }
        if (typeof options === 'object') {
            defaults = $.extend({}, defaults, options)
        }

        const templateClose = defaults.showClose ? '<a class="xusqa-c-message--close">×</a>' : ''
        const template = '<div class="xusqa-c-message xusqa-messageFadeInDown"><div class="xusqa-c-message--main">' +
            '<i class=" xusqa-c-message--icon xusqa-c-message--' + defaults.type + '"></i>' + templateClose +
            '<div class="xusqa-c-message--tip">' + defaults.message + '</div>' +
            '</div></div>'
        const $body = $('body')
        const $message = $(template)
        let timer
        let closeFn, removeFn

        closeFn = function() {
            $message.addClass('messageFadeOutUp')
            $message.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                removeFn()
            })
        }

        removeFn = function() {
            $message.remove()
            defaults.onClose(defaults)
            clearTimeout(timer)
        }

        $('.xusqa-c-message').remove()
        $body.append($message)

        $message.css({
            'margin-left': '-' + $message.width() / 2 + 'px'
        })

        $message.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $message.removeClass('xusqa-messageFadeInDown')
        })

        $body.on('click', '.xusqa-c-message--close', function(/*e*/) {
            closeFn()
        })

        if (defaults.autoClose) {
            timer = setTimeout(function() {
                closeFn()
            }, defaults.time)
        }
    }
})

// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2018-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2018-7-2 8:9:4.18
Date.prototype.format = function(format) {
    const args = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        //quarter
        'S': this.getMilliseconds()
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
    }

    for (let i in args) {
        const n = args[i]
        if (new RegExp('(' + i + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? n : ('00' + n).substr(('' + n).length))
        }
    }

    return format
}

// "I'm {0}, {1} years old.".format('xu', 25)
// "I'm {name}, {age} years old.".format({name: 'xu', age: 25})
String.prototype.format = function(args) {
    let result = this
    if (arguments.length) {
        if (arguments.length === 1 && typeof (args) === 'object') {
            for (let key in args) {
                if (args[key] !== undefined) {
                    let reg = new RegExp('({' + key + '})','g')
                    result = result.replace(reg, args[key])
                }
            }
        } else {
            for (let i = 0, l = arguments.length; i < l; i++) {
                if (arguments[i] !== undefined) {
                    let reg = new RegExp('({)' + i + '(})','g')
                    result = result.replace(reg, arguments[i])
                }
            }
        }
    }
    return result
}
//<------extend end.

/**
 * 功能: 今日战绩
 * 汇总今天的任务,纯属娱乐
 */
function todayTaskReport() {
    const arrtask = {}
    const today = (new Date()).format('yyyy-MM-dd')

    function doCollect(task) {
        for (let t of task) {
            const d = (new Date(t.finishedtime)).format('yyyy-MM-dd')
            if (d === today){
                const key = t.subject + '-' + t.education
                if (!arrtask.hasOwnProperty(key)) {
                    arrtask[key] = {
                        totalcount: 0,
                        finishedcount: 0,
                        returntimes: 0,
                        inputcount: 0,
                        checkcount: 0,
                        passcount: 0,
                    }
                }
                arrtask[key].totalcount += t.totalcount
                arrtask[key].finishedcount += t.finishedcount
                arrtask[key].returntimes += (t.status === '已退回' ? 1 : 0)
                arrtask[key].inputcount += parseInt(t.remark.match(/\d+/)) // 录完2题
                const [d0,d1] = t.remark2.match(/\d+/g) // 已被审核4题，通过4题
                arrtask[key].checkcount += parseInt(d0)
                arrtask[key].passcount += parseInt(d1)
            } else {
                return false
            }
        }

        return true
    }
    
    function createTable(result) {
        let nTotal = 0, nFinished = 0, nReturnTimes = 0, nInput = 0, nCheck = 0, nPass = 0
        let thtm = '<table style="margin: 10px 20px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'
        thtm += '<caption>今日战绩 查询时间: ' + new Date().format('hh:mm:ss') + '</caption>'
        thtm += '<tr style="border-bottom:2px solid #808080;">'
        thtm += '<th>&nbsp;</th><th>总量</th><th>完成量</th><th>已退回</th><th>录入量</th><th>已审核</th><th>通过</th><th>通过率</th>'
        thtm += '</tr>';

        for (let key in result) {
            nTotal += result[key].totalcount
            nFinished += result[key].finishedcount
            nReturnTimes += result[key].returntimes
            nInput += result[key].inputcount
            nCheck += result[key].checkcount
            nPass += result[key].passcount
            let passrate = (result[key].passcount / result[key].checkcount)
            //passrate = passrate ? passrate : 0 // divided by zero
            passrate = passrate > 1 ? 1 : passrate //

            thtm += '<tr class="xusqa-c-message--tr" style="border-bottom:1px solid #D3D3D3;">' +
                '<td style="text-align: center;">' + key + '</td>' + // ex. 高中-数学
                '<td style="text-align: right;">' + result[key].totalcount + '</td>' + // 总量
                '<td style="text-align: right;">' + result[key].finishedcount + '</td>' + // 完成量
                '<td style="text-align: right;">' + result[key].returntimes + '</td>' + // 退回次数
                '<td style="text-align: right;">' + result[key].inputcount + '</td>' + // 录入量
                '<td style="text-align: right;">' + result[key].checkcount + '</td>' + // 已审核
                '<td style="text-align: right;">' + result[key].passcount + '</td>' + // 通过
                '<td style="text-align: right;">' + (passrate * 100).toFixed(1) + (passrate ? '%' : '') + '</td>' + // 通过率
                '</tr>'
        }

        let passrate = nPass / nCheck

        thtm += '<tr style="border-top:2px solid #808080;font-weight:bold">' +
            '<td style="text-align: center;">全部</td>' +
            '<td style="text-align: right;">' + nTotal + '</td>' +
            '<td style="text-align: right;">' + nFinished + '</td>' +
            '<td style="text-align: right;">' + nReturnTimes + '</td>' +
            '<td style="text-align: right;">' + nInput + '</td>' +
            '<td style="text-align: right;">' + nCheck + '</td>' +
            '<td style="text-align: right;">' + nPass + '</td>' +
            '<td style="text-align: right;">' + (passrate * 100).toFixed(1) + (passrate ? '%' : '') + '</td>' +
            '</tr>'
        thtm += '</table>'

        return thtm
    }

    function collectionFinished(){
        helper.closeMessage()
        $.message({
            message: createTable(arrtask),
            showClose: true,
            autoClose: false
        })
    }

    helper.msg.info(STR.TASK_REPORT.PROGRESS)
    /*\
     {  "code":200,
        "data":{
            "task":[
                {"totalcount":10,"finishedcount":10,"tasktype":"题目录入","education":"初中","subject":"数学","finishedtime":1529656885260,"remark":"录完5题","id":201882,"salary":0.0,"remark2":"已被审核0题，通过0题","status":"已完成"},
                ...
            ],
            "totalSalary":0,
            "pageno":1,
            "totalPages":22,
            "lastMonthSalary":0,
            "totalElements":218
        },
        "message":"SUCCESS" }
    \*/
    $.get(URL.GET_MY_TASK.format({pageno: 1}), function(data/*, status*/) {
        if (doCollect(data.data.task)){
            collectByPageno(2)
        } else{
            collectionFinished()
        }

        function collectByPageno(i){
            $.get(URL.GET_MY_TASK.format({pageno: i}), (function(i){
                return function(data/*, status*/) {
                    if (doCollect(data.data.task)){
                        collectByPageno(i+1)
                    } else {
                        collectionFinished()
                    }
                }
            })(i))
        }
    })
}

/**
 * 功能: 上月结算情况
 * 汇总上月结算数据
 */
function preMonthReport() {
    const arrtask = {}
    let totalPages
    let finishedPages = 0

    const checkedTaskArray = helper.getPre2CheckedTaskIdArray()
    const now = new Date()
    const prem = helper.getPreMonth(now)

    function doCollect(task) {
        for (let t of task) {
            if (t.salary === 0 || ~checkedTaskArray.indexOf(t.id)){
                continue
            }

            const key = t.subject + '-' + t.education
            if (!arrtask.hasOwnProperty(key)) {
                arrtask[key] = {
                    totalcount: 0,
                    finishedcount: 0,
                    returntimes: 0,
                    inputcount: 0,
                    checkcount: 0,
                    passcount: 0,
                    presalary: 0.0,
                    salary: 0.0
                }
            }
            arrtask[key].totalcount += t.totalcount
            arrtask[key].finishedcount += t.finishedcount
            arrtask[key].returntimes += (t.status === '已退回' ? 1 : 0)
            const ic = parseInt(t.remark.match(/\d+/))
            arrtask[key].inputcount += ic// 录完2题
            const [d0,d1] = t.remark2.match(/\d+/g) // 已被审核4题，通过4题
            arrtask[key].checkcount += parseInt(d0)
            arrtask[key].passcount += parseInt(d1)
            arrtask[key].salary += t.salary
        }

        finishedPages++
        if (finishedPages === totalPages) {
            collectionFinished()
        }
    }

    function createTable(result) {
        let nTotal = 0, nFinished = 0, nReturnTimes = 0, nInput = 0, nCheck = 0, nPass = 0, dPreSalary=0.0, dSalary=0.0
        let thtm = '<table style="margin: 10px 20px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'

        thtm += '<caption>' + (checkedTaskArray.length ? prem : '往期') + ' 劳务结算</caption>'
        thtm += '<tr style="border-bottom:2px solid #808080;">'
        thtm += '<th>&nbsp;</th><th>总量</th><th>完成量</th><th>已退回</th><th>录入量</th><th>已审核</th><th>通过</th><th>通过率</th></th><th>助手核算</th><th>劳务结算</th>'
        thtm += '</tr>';

        for (let key in result) {
            nTotal += result[key].totalcount
            nFinished += result[key].finishedcount
            nReturnTimes += result[key].returntimes
            nInput += result[key].inputcount
            nCheck += result[key].checkcount
            nPass += result[key].passcount
            let passrate = (result[key].passcount / result[key].checkcount)
            passrate = passrate > 1 ? 1 : passrate //
            dSalary += result[key].salary

            result[key].price = SE[key]
            result[key].presalary = result[key].passcount * SE[key] + // 通过的 数量*价格
                (result[key].checkcount - result[key].passcount) * SE[key] * (1/* - 0.2*/) + // 未审核通过的题扣除20%
                (result[key].finishedcount - result[key].inputcount) * 0.05 // 判好题的 数量*0.05

            dPreSalary += result[key].presalary || 0

            thtm += '<tr class="xusqa-c-message--tr" style="border-bottom:1px solid #D3D3D3;">' +
                '<td style="text-align: center;">' + key + '</td>' + // ex. 高中-数学
                '<td style="text-align: right;">' + result[key].totalcount + '</td>' + // 总量
                '<td style="text-align: right;">' + result[key].finishedcount + '</td>' + // 完成量
                '<td style="text-align: right;">' + result[key].returntimes + '</td>' + // 退回次数
                '<td style="text-align: right;">' + result[key].inputcount + '</td>' + // 录入量
                '<td style="text-align: right;">' + result[key].checkcount + '</td>' + // 已审核
                '<td style="text-align: right;">' + result[key].passcount + '</td>' + // 通过
                '<td style="text-align: right;">' + (passrate * 100).toFixed(1) + (passrate ? '%' : '') + '</td>' + // 通过率
                '<td style="text-align: right;">' + (result[key].presalary).toFixed(2) + '</td>' + // 劳务费预估
                '<td style="text-align: right;">' + (result[key].salary).toFixed(2) + '</td>' + // 劳务结算
                '</tr>'
        }

        let passrate = nPass / nCheck
        const bReward = nInput >=500 && passrate >= 0.8
        if (bReward){ // 满足奖励条件
            dPreSalary = dPreSalary * 1.2
            dSalary = dSalary * 1.2
        }

        thtm += '<tr style="border-top:2px solid #808080;font-weight:bold">' +
            '<td style="text-align: center;">全部</td>' +
            '<td style="text-align: right;">' + nTotal + '</td>' +
            '<td style="text-align: right;">' + nFinished + '</td>' +
            '<td style="text-align: right;">' + nReturnTimes + '</td>' +
            '<td style="text-align: right;">' + nInput + '</td>' +
            '<td style="text-align: right;">' + nCheck + '</td>' +
            '<td style="text-align: right;">' + nPass + '</td>' +
            '<td style="text-align: right;">' + (passrate * 100).toFixed(1) + '%</td>' +
            '<td style="text-align: right;">' + dPreSalary.toFixed(2) + '</td>' +
            '<td style="text-align: right;">' + dSalary.toFixed(2) + '</td>' +
            '</tr>'
        if (bReward){
            thtm += '<tr style="font-style:italic">' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td style="text-align: right;">(奖励后)</td>' +
            '<td style="text-align: right;">(奖励后)</td>' +
            '</tr>'
        }

        thtm += '</table>'

        return thtm
    }

    function collectionFinished(){
        helper.closeMessage()
        $.message({
            message: createTable(arrtask) + TPL.ACC_INFO,
            showClose: true,
            autoClose: false
        })
    }

    helper.msg.info(STR.TASK_REPORT.PROGRESS)
    /*\
     {  "code":200,
        "data":{
            "task":[
                {"totalcount":2,"finishedcount":2,"tasktype":"题目录入","education":"高中","subject":"理数","finishedtime":1529671499818,"remark":"录完1题","id":205978,"salary":0.0,"remark2":"已被审核0题，通过0题","status":"已完成"},
            ],
            "totalSalary":0, "pageno":1, "totalPages":22, "lastMonthSalary":0, "totalElements":218
        }, "message":"SUCCESS" }
    \*/
    $.get(URL.GET_MY_TASK.format({pageno: 1}), function(data/*, status*/) {
        totalPages = data.data.totalPages
        doCollect(data.data.task)

        function collectByPageno(i){
            $.get(URL.GET_MY_TASK.format({pageno: i}), function(data/*, status*/) {
                doCollect(data.data.task)
            })
        }

        for (let i = 2; i <= totalPages; i++) {
            collectByPageno(i)
        }
    })
}

/**
 * 功能: 任务报告
 * 汇总任务,计算录入量,通过率等
 * 服务器没有对连续请求做优化,查询一页再查询另一页会非常慢;异步查询会返回全部数据,没法控制停止时机
 */
function myTaskReport() {
    let arrtask = {}
    const arrTaskThisMonth = {}
    let totalPages

    const closeTaskId = [] // 保存已经结算的数据
    const checkedTaskArray = helper.getCheckedTaskIdArray()
    const now = new Date()
    const firstDay = helper.getFirstDay(now)
    const preMonthFirstDay = helper.getPreMonthFirstDay(now)
    const accMonth = 'xusqa_acc_month_' + helper.getPreMonth(now)
    const closeAcc = S.hasOwnProperty(accMonth)
    let tcc = 0
    let tsc = 0

    function doCollect(task) {
        function c(arr, t){
            const key = t.subject + '-' + t.education
            if (!arr.hasOwnProperty(key)) {
                arr[key] = {
                    totalcount: 0,
                    finishedcount: 0,
                    returntimes: 0,
                    inputcount: 0,
                    checkcount: 0,
                    passcount: 0,
                    presalary: 0.0,
                    salary: 0.0
                }
            }
            arr[key].totalcount += t.totalcount
            arr[key].finishedcount += t.finishedcount
            arr[key].returntimes += (t.status === '已退回' ? 1 : 0)
            const ic = parseInt(t.remark.match(/\d+/))
            arr[key].inputcount += ic// 录完2题
            const [d0,d1] = t.remark2.match(/\d+/g) // 已被审核4题，通过4题
            arr[key].checkcount += parseInt(d0)
            arr[key].passcount += parseInt(d1)
            arr[key].salary += t.salary
        }
        let cc = 0
        for (let t of task) {
            if (t.finishedtime > firstDay){
                c(arrTaskThisMonth, t)
            } else {
                if (closeAcc && S.hasOwnProperty('xusqa_acc_premonth')){
                    arrtask = JSON.parse(S.xusqa_acc_premonth)
                    return false
                }
                if ((t.finishedcount === 0 || t.salary)){
                    if (!closeAcc){
                        const id = t.id
                        if (!checkedTaskArray.length || (checkedTaskArray.indexOf(id) === -1)){
                            closeTaskId.push(id)
                        }
                    } else {
                        cc++
                        continue
                    }
                }
                if (t.finishedtime > preMonthFirstDay && t.salary){
                    tsc++
                }
                c(arrtask, t)
            }
        }

        if (cc === task.length){
            tcc++
            if (tcc > 3){ // 终止查询条件:超过3页都已结算
                return false
            }
        }

        return true
    }

    function createTable() {
        let nsTotal = 0, nsFinished = 0, nsReturnTimes = 0, nsInput = 0, nsCheck = 0, nsPass = 0, dsPreSalary=0.0, dsSalary=0.0
        function c(result, title){
            let nTotal = 0, nFinished = 0, nReturnTimes = 0, nInput = 0, nCheck = 0, nPass = 0, dPreSalary=0.0, dSalary=0.0
            let tr = ''
            tr += '<tr style="border-bottom:1px solid #808080;">'
            tr += '<th>' + title + '</th><th>总量</th><th>完成量</th><th>已退回</th><th>录入量</th><th>已审核</th><th>通过</th><th>通过率</th></th><th>劳务预估</th><th>劳务结算</th>'
            tr += '</tr>';

            for (let key in result) {
                nTotal += result[key].totalcount
                nFinished += result[key].finishedcount
                nReturnTimes += result[key].returntimes
                nInput += result[key].inputcount
                nCheck += result[key].checkcount
                nPass += result[key].passcount
                let passrate = (result[key].passcount / result[key].checkcount)
                passrate = passrate > 1 ? 1 : passrate //
                dSalary += result[key].salary

                result[key].price = SE[key]
                result[key].presalary = result[key].passcount * SE[key] + // 通过的 数量*价格
                    //(result[key].checkcount - result[key].passcount) * SE[key] * (1 - 0.2) + // 未审核通过的题扣除20%
                    (result[key].checkcount - result[key].passcount) * SE[key] * (1 - 0.0) +
                    (result[key].finishedcount - result[key].inputcount) * 0.05 // 判好题的 数量*0.05

                // 未审核的按照当前通过率预估
                if (result[key].inputcount >= result[key].checkcount) { // why appear, i don't know
                    let notcheck = result[key].inputcount - result[key].checkcount
                    let prepass = (notcheck * (passrate ? passrate : 0)).toFixed(0)
                    result[key].presalary += prepass * SE[key] + (notcheck - prepass) * SE[key] * 0.8
                }

                dPreSalary += result[key].presalary || 0

                tr += '<tr class="xusqa-c-message--tr" style="border-top:1px solid #D3D3D3;">' +
                    '<td style="text-align: center;">' + key + '</td>' + // ex. 高中-数学
                    '<td style="text-align: right;">' + result[key].totalcount + '</td>' + // 总量
                    '<td style="text-align: right;">' + result[key].finishedcount + '</td>' + // 完成量
                    '<td style="text-align: right;">' + result[key].returntimes + '</td>' + // 退回次数
                    '<td style="text-align: right;">' + result[key].inputcount + '</td>' + // 录入量
                    '<td style="text-align: right;">' + result[key].checkcount + '</td>' + // 已审核
                    '<td style="text-align: right;">' + result[key].passcount + '</td>' + // 通过
                    '<td style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</td>' + // 通过率
                    '<td style="text-align: right;">' + (result[key].presalary).toFixed(2) + '</td>' + // 劳务费预估
                    '<td style="text-align: right;">' + (result[key].salary).toFixed(2) + '</td>' + // 劳务结算
                    '</tr>'
            }

            let passrate = nPass / nCheck
            //dPreSalary = (nInput >=500 && passrate > 0.8) ? (dPreSalary * 1.2) : dPreSalary // 奖励条件：录满500题，通过率超过80%,单价加成1.2倍

            //if (nCheck2 >=500 && nPass2 / nCheck2 > 0.8){ // 满足奖励条件
            //    dSalary = dSalary * 1.2
            //}

            nsTotal += nTotal
            nsFinished += nFinished
            nsReturnTimes += nReturnTimes
            nsInput += nInput
            nsCheck += nCheck
            nsPass += nPass
            dsPreSalary += dPreSalary
            dsSalary += dSalary
            tr += '<tr style="border-top:1px solid #808080;font-style: italic;">' +
                '<td style="text-align: center;">小计:</td>' +
                '<td style="text-align: right;">' + nTotal + '</td>' +
                '<td style="text-align: right;">' + nFinished + '</td>' +
                '<td style="text-align: right;">' + nReturnTimes + '</td>' +
                '<td style="text-align: right;">' + nInput + '</td>' +
                '<td style="text-align: right;">' + nCheck + '</td>' +
                '<td style="text-align: right;">' + nPass + '</td>' +
                '<td style="text-align: right;">' + (passrate * 100).toFixed(1) + '%</td>' +
                '<td style="text-align: right;">' + dPreSalary + '</td>' +
                '<td style="text-align: right;">' + dSalary.toFixed(2) + '</td>' +
                '</tr>'

            return tr
        }

        let thtm = '<table style="margin: 10px 20px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'
        thtm += '<caption>查询时间: ' + new Date().format('yyyy-MM-dd hh:mm:ss') + '</caption>'
        thtm += c(arrTaskThisMonth, '本月录入')
        thtm += c(arrtask, '上月未结')
        let b = nsCheck >=500 && nsPass / nsCheck > 0.8
        dsPreSalary = b ? dsPreSalary*1.2 : dsPreSalary
        dsSalary = b ? dsSalary*1.2 : dsSalary
        thtm += '<tr style="border-top:1px solid #808080;font-weight:bold">' +
            '<td style="text-align: center;">合计:</td>' +
            '<td style="text-align: right;">' + nsTotal + '</td>' +
            '<td style="text-align: right;">' + nsFinished + '</td>' +
            '<td style="text-align: right;">' + nsReturnTimes + '</td>' +
            '<td style="text-align: right;">' + nsInput + '</td>' +
            '<td style="text-align: right;">' + nsCheck + '</td>' +
            '<td style="text-align: right;">' + nsPass + '</td>' +
            '<td style="text-align: right;">' + (nsPass/nsCheck * 100).toFixed(1) + '%</td>' +
            '<td style="text-align: right;">' + dsPreSalary.toFixed(2) + '</td>' +
            '<td style="text-align: right;">' + dsSalary.toFixed(2) + '</td>' +
            '</tr>'

        thtm += '</table>'
        thtm += TPL.THIS_ACC_INFO.format({remark: b ? '(满足奖励条件,合计结算金额已×1.2)' : '(未满足奖励条件)'})

        return thtm
    }

    function collectionFinished(){
        helper.closeMessage()
        $.message({
            message: createTable(),
            showClose: true,
            autoClose: false
        })

        if (!closeAcc && tsc > 0){
            S[accMonth] = JSON.stringify(closeTaskId)
            S.removeItem('xusqa_acc_premonth') // 移除旧的未结算数据
            helper.msg.success('上月数据结算完成,再次查询将显示本月报告')
        }

        if(closeAcc && !S.hasOwnProperty('xusqa_acc_premonth')){ // 保存新的结算数据
            S.xusqa_acc_premonth = JSON.stringify(arrtask)
        }
    }

    helper.msg.info(STR.TASK_REPORT.PROGRESS)
    /*\
     {  "code":200,
        "data":{
            "task":[
                {"totalcount":10,"finishedcount":10,"tasktype":"题目录入","education":"初中","subject":"数学","finishedtime":1529656885260,"remark":"录完5题","id":201882,"salary":0.0,"remark2":"已被审核0题，通过0题","status":"已完成"},
            ],
            "totalSalary":0, "pageno":1, "totalPages":22, "lastMonthSalary":0,"totalElements":218
        },
        "message":"SUCCESS" }
    \*/
    $.get(URL.GET_MY_TASK.format({pageno: 1}), function(data/*, status*/) {
        totalPages = data.data.totalPages
        if (doCollect(data.data.task)){
            collectByPageno(2)
        } else {
            collectionFinished()
        }

        function collectByPageno(i){
            $.get(URL.GET_MY_TASK.format({pageno: i}), function(data/*, status*/) {
                if (doCollect(data.data.task) && i < totalPages){
                    collectByPageno(i+1)
                } else {
                    collectionFinished()
                }
            })
        }
    })
}

/**
 * 功能: 增强任务广场
 * 为任务广场学科列表添加角标,
 * 角标显示剩余的任务数,如果该学科没有通过审核,灰色显示
 */
function extraTaskList() {
    let timer
    function recCheckTaskList() {
        clearTimeout(timer)

        if ($(DOM.TASK_SQUARE_LI).length) {
            execCommand('doExtraTaskList')
        } else {
            timer = setTimeout(recCheckTaskList, 0)
        }
    }
    recCheckTaskList()
}

function doExtraTaskList() {
    const $li = $(DOM.TASK_SQUARE_LI)
    let finishedcount = 0, totalcount = 0
    let qssumary = ''

    let $squareUpdate = $('#xusqa-square-update')
    if (!$squareUpdate.length){
        $squareUpdate = $(TPL.SQUARE_UPDATE).insertAfter($(DOM.POSITION))
        $squareUpdate.children('a:nth-child(2)').click(function(){
            clearInterval(stage.timer.lastUpdateTimer)
            $squareUpdate.children('a:first-child').text(STR.EXTRA_TASK_SQUARE.REFRESH)
            doExtraTaskList()
        })
    }

    function resetRefresh(qssumary){
        if (location.hash.indexOf('#/task/choose') === -1){
            return
        }

        stage.squareUpdateTime = new Date()

        clearInterval(stage.timer.lastUpdateTimer)
        $squareUpdate.children('a:first-child').text(DIC.AGO[DIC.AGO.length - 2][1])

        stage.timer.lastUpdateTimer = setInterval(function(){
            if ($squareUpdate.length){
                const now = new Date()
                const ta = util.timeAgo(now - stage.squareUpdateTime)
                $squareUpdate.children('a:first-child').text(ta)
            } else {
                clearInterval(stage.timer.lastUpdateTimer)
            }
        }, 1000*30)

        $squareUpdate.children('a:last-child').click(function(){
            if (!qssumary){
                helper.msg.error(STR.SHAREQQ.NO_TASK)
                return
            }

            if (new Date() - stage.squareUpdateTime > 1000*60*10){ // 超过10分钟,过期
                helper.msg.error(STR.SHAREQQ.EXPIRED)
                return
            }

            const p = {
                url: location.href,
                desc: '',
                title: STR.SHAREQQ.QTIME.format({qtime: stage.squareUpdateTime.format('hh:mm:ss')}),
                summary: qssumary,
                pics: URL.getRandomImg(),
                site: document.title, //flash: '', style: '203', width: 16, height: 16
            };
            const s = [];
            for(let i in p){
                s.push(i + '=' + encodeURIComponent(p[i]||''));
            }
            const qhref = URL.SHAREQQ.format({params: s.join('&')});
            $squareUpdate.children('a:last-child').attr({href: qhref, target: '_blank'});
        })
    }

    function setLiCorner(li) {
        const [s,e] = li.lastChild.innerText.split('-')
        /*\
         > {"code":200,"data":[{"count":0,"taskname":"题目录入","permission":1,"remark":""}],"message":"SUCCESS"}
         > {"code":200,"data":[{"count":90,"taskname":"题目录入","permission":-2,"remark":""}],"message":"SUCCESS"}
        \*/
        $.get(encodeURI(URL.GET_TASK_REMAIN.format({subject: s, education: e})), function(data/*, status*/) {
            const rm = data.data[0]
            const se = s + '-' + e
            const b = helper.isExcludedSE(se)

            if (li.childNodes.length === 2){ // 清除之前的角标
                li.firstChild.remove()
            }

            if (rm.count !== 0 || rm.permission !== 1) { // 设置新角标
                const $corner = $('<div class="xusqa-corner' + (rm.permission === 1 ? (b ? '-excluded' : '') : '-gray') + '">' +
                    '<a style="position: absolute;top: -10px;left: 20px;width: 40px;font-size: ' +
                    (rm.permission === 1 && !b ? '15' : '12') + 'px;text-align: center;color: white;"' +
                    (rm.permission === 1 && !b ? ' href="javascript:void(0);"' : '') + '>' +
                    ((rm.permission === 1 || rm.count > 0) ? rm.count : STR.EXTRA_TASK_SQUARE.WAIT_APPROVAL) +
                    '</a></div>').prependTo(li)

                if (rm.permission === 1 && !b) { // 角标点击事件
                    $corner.click(function() {
                        $.get(encodeURI(URL.GET_TASK.format({subject: s, education: e})), function(data/*, status*/) {
                            if (data.code === 200) {
                                helper.msg.success(STR.ONEKEY_GET_TASK.SUCCESS.format({se: se}))
                                $(DOM.NAV_MY_TASK)[0].click()
                            } else {
                                helper.msg.error(data.code === 20001 ? data.message : '“' + se + '”' + data.message)
                            }
                        })
                    })
                }
            }

            if (rm.count !== 0 && SE[se]){ // QQ 分享任务数量列表
                qssumary += li.lastChild.innerText + ': ' + rm.count + ' 个;'
            }

            finishedcount++
            if (finishedcount === totalcount) {
                helper.msg.success(STR.EXTRA_TASK_SQUARE.REFRESH_SUCCESS)

                resetRefresh(qssumary)
            }
        })
    }

    /*\
     {  "code":200,
        "data":[
            {"task":false,"name":"数学-高中"},{"task":false,"name":"理数-高中"},{"task":true,"name":"文数-高中"},{"task":false,"name":"英语-高中"},
            {"task":false,"name":"语文-高中"},{"task":false,"name":"物理-高中"},{"task":true,"name":"化学-高中"},{"task":false,"name":"生物-高中"},
            {"task":false,"name":"历史-高中"},{"task":false,"name":"政治-高中"},{"task":false,"name":"地理-高中"},{"task":true,"name":"理综-高中"},
            {"task":false,"name":"文综-高中"},{"task":false,"name":"数学-初中"},{"task":true,"name":"英语-初中"},{"task":false,"name":"语文-初中"},
            {"task":true,"name":"物理-初中"},{"task":true,"name":"化学-初中"},{"task":false,"name":"生物-初中"},{"task":false,"name":"历史-初中"},
            {"task":false,"name":"政治-初中"},{"task":false,"name":"地理-初中"},{"task":false,"name":"数学-小学"},{"task":false,"name":"英语-小学"},
            {"task":false,"name":"语文-小学"},{"task":false,"name":"历史-小学"},{"task":false,"name":"政治-小学"},{"task":false,"name":"地理-小学"}
        ],
        "message":"SUCCESS" }
    \*/
    $.get(URL.GET_TASK_SQUARE, function(data/*, status*/){
        if(data.code === 200){
            const tasks = data.data
            for(let i = 0, l = tasks.length; i < l; i++){
                const t = tasks[i]
                const li = $li[i]

                if (li.lastChild.innerText !== t.name ){
                    helper.msg.warning(STR.ERROR.STOP)
                    throw new Error(STR.ERROR.STOP)
                }

                if (t.task){
                    totalcount++
                    setLiCorner(li)
                } else {
                    if (li.childNodes.length === 2){
                        li.firstChild.remove()
                    }
                }
            }
        } else if (data.code === 30000){
            location.reload()
        }
    })
}

/**
 * 功能: 一键领取任务
 * 按照配置区的学科顺序一键领取任务
 */
function doOneKeyGetTask() {
    let _finishcount = 0, _status = 0 // -1 身上有任务, 1 领取成功
    const _ses = (O.onekeyGetTaskSEs).split(',')
    const _step = O.onekeyGetTaskStep
    const times = Math.ceil(_ses.length/_step)
    const _all = []
    for(let i = 0; i < times; i++){
        _all[i] = _ses.slice(i*_step, (i+1)*_step)
    }

    function q(se){
        const [s,e ] = se.split('-')
        /*\
         > {"code":200,"data":"","message":"SUCCESS"}
         > {"code":20000,"data":"","message":"没有多余的任务"}
         > {"code":20001,"data":"","message":"当前有任务尚未完成，无法领取新任务"}
         > {code: 600, data: "", message: "没有权限"}
        \*/
        $.get(encodeURI(URL.GET_TASK.format({subject: s, education: e})), (function(se){
            return function(data/*, status*/){
                if (data.code === 200){
                    _status = 200
                    helper.msg.success(STR.ONEKEY_GET_TASK.SUCCESS.format({se: se}))
                    $(DOM.NAV_MY_TASK)[0].click()
                } else if(data.code === 20001){ // 身上有任务
                    _status --
                    if (_status === -1){ // 不是刚领的任务,提示一次
                        helper.msg.error(data.message)
                    }
                } else if (data.code === 30000) { // 异常，没登录，终止
                    throw new Error(STR.ERROR.STOP)
                } else { // 600没权限 20000没有多余的任务都继续查下一科目
                    _finishcount ++
                    const gr = _finishcount % _step
                    const gi = _finishcount / _step
                    if (gr === 0 && gi < _all.length){ // 查询下一分组
                        qgroup(gi)
                    }
                    if (_finishcount === _ses.length){ // 查询完毕, 没有多余的任务
                        helper.msg.error(STR.ONEKEY_GET_TASK.NOMORE_TASK)
                    }
                }
            }
        })(se))
    }

    function qgroup(index){
        for(let se of _all[index]){
            q(se)
        }
    }
    helper.msg.info(STR.ONEKEY_GET_TASK.WAITING)
    qgroup(0)
}

/**
 * 功能: 一键智能优化OCR结果
 * 标点符号半角全角,智能换行等
 * TODO: 当一条规则无效时,不影响其他规则继续运行,让规则执行引擎更健壮一点
 */
function execRule(str,r, subject, uid, d){
    function include(group, item){
        if (!group){
            return true
        }

        if (typeof(group) === 'number'){
            group = '' + group
        }

        let b = ~group.indexOf(item)
        if(group[0] === '^' || group[0] === '-'){
            b = !b
        }

        return b
    }

    function debug(str, r){
        if (typeof(r[0]) === 'function'){
            const f = r[0]
            const s = f(str, uid)
            if (s && typeof(s) === 'string' && (s.length !== str.length || s !== str)){
                C.group(r)
                C.log(str)
                C.log(s)
                C.groupEnd()
            }
        } else if (r[0] instanceof RegExp){
            const m = str.match(r[0])
            if (m){
                C.group(r)
                C.log(str)
                C.log(str.replace(r[0], r[1]))
                C.groupEnd()
            }
        }
    }

    let b = true

    if (typeof(r[0]) === 'function'){
        b = r[1] ? b && include(r[1], subject) : b // 限制学科
        b = r[2] ? b && include(r[2], uid) : b // 限制uid

        if(b){
            if(d){
                debug(str, r)
            }
            const f = r[0]
            const rt = f(str,uid)
            if (rt instanceof Array){
                return execReplRules(str, rt, subject, uid)
            } else {
                return rt
            }
        }
    } else {
        b = r[2] ? b && include(r[2], subject) : b
        b = r[3] ? b && include(r[3], uid) : b

        if (b){
            if (d){
                debug(str, r)
            }
            const reg = typeof(r[0]) === 'string' ? new RegExp(r[0], 'g') : r[0]
            return str.replace(reg, r[1])
        }
    }
}

function execReplRules(str, rules, subject, uid){
    const d = O.debug
    let s
    for (let r of rules) {
        try {
            s = execRule(str, r, subject, uid, d)
            if (s && typeof(s) === 'string'){ // 简单效验返回结果是否有效
                str = s
            }
        } catch (error) {
            if(d){
                C.error(error)
            }            
        }
    }
    return str
}

function doExtendUE(){
    // 工具栏分隔符
    U.registerUI('|', function() {
        return new U.ui.Separator()
    })

    U.registerUI('onekeyformat', function(editor, uiName) {
        editor.registerCommand(uiName, {
            execCommand: function() {
                const me = this
                const uid = me.uid % 5
                // 获取当前科目
                const subject = helper.getInputSubject()
                if (O.debug){
                    C.log(subject)
                }

                function preFormat(html) {
                    html = execReplRules(html, PRERULE, subject, uid)
                    return html
                }

                function format(str) {
                    str = execReplRules(str, USRRULE, subject, uid)
                    str = execReplRules(str, RULE, subject, uid)
                    return str
                }

                function afterFormat(html){
                    html = execReplRules(html, AFTRULE, subject, uid)
                    return html
                }

                const cont = me.document.body
                const html = cont.innerHTML
                setRuleFlag(html)
                const root = U.htmlparser(preFormat(html))
                root.traversal(function(node) {
                    if (node.type === 'text') {
                        node.data = format(node.data)
                    }
                })
                cont.innerHTML = afterFormat(root.toHtml())

                RULEFLAG = undefined
            }
        })

        const btnOnekeyFormat = new U.ui.Button({
            name: uiName,
            title: STR.HINT.ONEKEY_FORMAT,
            cssRules: 'background-position: -640px -40px;',
            onclick: function() {
                editor.execCommand(uiName)
            }
        })

        return btnOnekeyFormat
    })
}

/**
 * 功能: 定位答案添加定位到上次位置
 */
function registerLocateButton(pot){
    stage.scroll.flag = 0
    const v = pot.$box[0].__vue__
    $(TPL.LOCATE_ANSWER.format({text: STR.MODULE.LOCATE_ANSWER, title: STR.HINT.LOCATE_ANSWER})).insertAfter(pot.$ipt).on('click', function() {
        if (!S.hasOwnProperty('xusqa_locatePosition')){
            helper.msg.error(STR.LOCATE_ANSWER.LOCATE_PAGENO_ERROR)
            return
        }
        const pos = JSON.parse(S.xusqa_locatePosition)
        const taskId = location.hash.match(/taskid=(\d+)/)[1]
        if (taskId === pos.taskId && v.textbookid === pos.textbookId && pos.currentPage){
            // PIT: vue's pit, set input's value don't trigger bind
            // https://forum.vuejs.org/t/js-input-value/10939/15
            // https://segmentfault.com/q/1010000004427798
            pot.$ipt[0].value = pos.currentPage
            pot.$ipt[0].dispatchEvent(new window.Event('input'))
            v.pageChange(pos.currentPage)
            //pot.$jmp.click()
            
            const ctn = $(pot.ctn)
            ctn.scrollTop(pos.scrollTop || 0)
            ctn.scrollLeft(pos.scrollLeft || 0)

            helper.msg.success(STR.LOCATE_ANSWER.LOCATE_PAGENO_SUCCESS.format({pageno : pos.currentPage}))
        } else {
            helper.msg.error(STR.LOCATE_ANSWER.LOCATE_PAGENO_ERROR)
        }
    })

    pot.$box.find(pot.cls).on('click', function(){
        stage.scroll.flag = 1
        const ctn = $(pot.ctn)
        stage.scroll.top = ctn.scrollTop
        stage.scroll.left = ctn.scrollLeft
    })

    // set add_cut hint
    $(DOM.QUESTION_BOX_ADD_CUT).attr('title', STR.HINT.QUESTION_BOX_ADD_CUT).addClass('xusqa-btn')
    $(DOM.ANSWER_BOX_ADD_CUT).attr('title', STR.HINT.ANSWER_BOX_ADD_CUT).addClass('xusqa-btn')
}

/**
 * 功能: 截图功能
 * 在题目图片上可以直接拖拽框选，双击截图插入
 */
function registerQuestionSnap(){
    function ein(e, el){
        return e.clientX >= el.offsetLeft && e.clientX <= (el.offsetLeft + el.clientWidth) &&
            e.clientY >= el.offsetTop && e.clientY <= (el.offsetTop + el.clientHeight)
    }
    const $imgQ = $(DOM.QUESTION_IMG)
    let $btnSnap
    let $box = $('#xusqa_selection_question_box')
    if (!$box.length){
        $box = $('<div id="xusqa_selection_question_box"></div>').appendTo('body')
    }

    const select = $imgQ.imgAreaSelect({
        parent: $box,
        instance: true,
        handles: true,
        onSelectStart: () => {
            $btnSnap.hide()
        },
        onSelectChange: () => {
            $btnSnap.hide()
        },
        onSelectEnd: () => {
            $(document).on('mousedown.xusqa_event', function(e) {
                if (ein(e, $imgQ[0]) || ein(e, $btnSnap[0])) {
                    return
                } else {
                    $imgQ.imgAreaSelect({
                        hide: true
                    })
                    $btnSnap.hide()
                    $(document).off('mousedown.xusqa_event')
                }
            })
            const $sel = $('#xusqa_selection_question_box > div:nth-child(1)')
            if ($sel.is(':visible') && $sel.width() > 30 && $sel.height() > 30){
                $btnSnap.css({
                    left: $sel.position().left + $sel.width() - $btnSnap.width() - 3,
                    top: $sel.position().top + $sel.height(),
                }).show()
            }
        },
    })

    $btnSnap = $(TPL.SNAP_QUESTION_BUTTON).appendTo($box).hide().click(function(){
        const selection = select.getSelection()
        const scale = $imgQ[0].naturalWidth / $imgQ[0].width

        helper.msg.info(STR.SNAP.WAIT)
        const timestrap = (+new Date()).toString(36)
        const loaderId = 'loading_' + timestrap
        const html = '<img class="loadingclass" id="' + loaderId + '" src="http://searchq-editsys.youdao.com/static/Ueditor/themes/default/images/spacer.gif" title="正在上传..." />'
        const qe = helper.getEditor(0)
        qe.focus()
        qe.execCommand('inserthtml', html)

        const img = new window.Image()
        img.setAttribute('crossOrigin', 'anonymous')
        img.src = $imgQ[0].src
        img.onload = function() {
            const canvas = document.createElement('canvas')
            canvas.width = selection.width
            canvas.height = selection.height
            const ctx = canvas.getContext('2d')
            ctx.scale(1 / scale, 1 / scale)
            ctx.drawImage(img, - selection.x1 * scale, - selection.y1 * scale)

            canvas.toBlob(imgBlobUpload(0, function(d){
                const loader = qe.document.getElementById(loaderId)
                if (loader) {
                    loader.setAttribute('src', d.url)
                    loader.setAttribute('_src', d.url)
                    loader.setAttribute('title', d.title || '')
                    loader.setAttribute('alt', d.original || '')
                    loader.removeAttribute('id')
                    loader.removeAttribute('class')
                }
                helper.msg.success(STR.SNAP.SUCCESS)
            }))
        }

        $btnSnap.hide()
        $(document).off('mousedown.xusqa_event')
        $imgQ.imgAreaSelect({
            hide: true
        })
    })

    function registerHint(){
        $(DOM.QUESTION_CON).append(TPL.SNAP_QUESTION_HINT)
    }
    if (O.showHint){
        registerHint()
    }
}

/**
 * 题目保存恢复功能
 */
function registerQuestionSave(){
    const $con = $(DOM.EDIT_PAGE_QUESTION_CON)
    const $titleQ = $con.find('> div:nth-child(1)')
    const $titleY = $con.find('> div:nth-child(5)') // 解析标题
    const $titleK = $con.find('> div:nth-child(9)') // 知识点标题
    const $imgQ = $(DOM.QUESTION_IMG)
    const taskId = helper.getTaskId()

    $(TPL.EDIT_PAGE_SAVE).insertAfter($imgQ).click(function(){
        helper.saveQuestion()
    })

    $(TPL.EDIT_PAGE_RESTORE).insertAfter($imgQ).click(function(){
        helper.restoreQuestion()
    })

    $(TPL.EDIT_PAGE_SAVE_SAMPLE).insertBefore($titleQ).click(function(){
        helper.saveQuestion(true)
    })

    $(TPL.EDIT_PAGE_MOVETO_ANALYSIS).insertBefore($titleY).click(function(){
        const u1 = helper.getEditor(1)
        const u2 = helper.getEditor(2)
        u2.setContent(u1.getContent(), u2.getContent())
        u1.setContent('')
    })

    $(TPL.EDIT_PAGE_PICKUP).appendTo($titleY).click(function(){
        const u2 = helper.getEditor(2)
        let analysis = u2.getContent()
        let r, m
        // 提取答案
        r = /(\d+\.)\s*([A-DTF]|[a-zA-Z\/]+)\s+/g
        m = analysis.match(r)
        if (m && m.length > 2){
            const u1 = helper.getEditor(1)
            let answer = '<p>'
            for(let i of m){
                answer += i + '</p><hr/>'
            }
            answer = answer.slice(0, -5) // 去掉末尾的<hr/>
            u1.setContent(answer, u1.getContent())
            analysis = analysis.replace(r, '$1')
        }

        // 提取点评
        r = /(\d+\.)\s*([\u4E00-\u9FA5]+[题][.])/g
        m = analysis.match(r)
        if (m && m.length > 2){
            const u3 = helper.getEditor(3)
            let comment = '<p>'
            for(let i of m){
                comment += i + '</p><hr/>'
            }
            comment = comment.slice(0,-5)
            u3.setContent(comment, u3.getContent())
            analysis = analysis.replace(r, '$1')
        }

        // 提取知识点
        //r = /(\d+\.)\s*本*题*考查([\u4E00-\u9FA5、]+)[.]/g
        r = /(\d+\.)\s*本*题*考查([\u4E00-\u9FA5、]+)[.。]/g
        m = analysis.match(r)
        if (m && m.length > 2){
            const u4 = helper.getEditor(4)
            let knowledge = '<p>'
            let e = r.exec(analysis)
            while(e){
                knowledge += e[1] + e[2] + '</p><hr/>'
                e = r.exec(analysis)
            }
            knowledge = knowledge.slice(0,-5)
            u4.setContent(knowledge, u4.getContent())
            analysis = analysis.replace(r, '$1')
        }

        /*
        r = /\s*本*题*考查([\u4E00-\u9FA5、]+)[.。]/g
        m = analysis.match(r)
        if (m && m.length){
            const u4 = helper.getEditor(4)
            let knowledge = '<p>'
            let e = r.exec(analysis)
            while(e){
                if (knowledge.indexOf(e[1]) === -1){
                    knowledge += e[1] + ','
                }
                e = r.exec(analysis)
            }
            knowledge = knowledge.slice(0,-1)
            u4.setContent(knowledge, u4.getContent())
            analysis = analysis.replace(r, '')
        } */

        u2.setContent(analysis, false)
    })

    $(TPL.EDIT_PAGE_CLEAR_KNOWLEDGE).insertBefore($titleK).click(function(){
        const d = {
            taskId: taskId,
            content: helper.getKnowledge(),
        }
        helper.clearKnowledge()

        S.xusqa_clearKnowledge = JSON.stringify(d)
    })

    if (S.hasOwnProperty('xusqa_clearKnowledge')){
        const d = JSON.parse(S.xusqa_clearKnowledge)
        if (d.taskId === taskId){
            helper.clearKnowledge()
        }
    }
}

/**
 * 功能: 框选截图功能
 * 为题目页和答案页添加框选截图功能
 */
function registerSnap(pot){
    const $btn = helper.cloneButton(pot.$btnLatex, STR.MODULE.SNAP, STR.HINT.SNAP)
    $btn.css('width', '50px').insertAfter(pot.$btnLatex).click(function(){
        helper.msg.info(STR.SNAP.WAIT)

        const $sel = pot.sel[0] === '#' ? $(pot.sel) : pot.$box.find(pot.sel)
        if (!$sel.length){
            helper.msg.error(STR.SNAP.FAILED)
            return
        }
        const d = $sel.last()[0]
        const m = d.attributes.style.value.match(/\d+/g)
        const y1 = parseInt(m[0]), x1 = parseInt(m[1]), width = parseInt(m[2]), height = parseInt(m[3])
        const image = pot.img[0] === '#' ? $(pot.img)[0] : pot.$box.find(pot.img)[0]
        const scale = image.naturalWidth / image.width

        // Uncaught SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
        // https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported
        const img = new window.Image()
        img.setAttribute('crossOrigin', 'Anonymous')

        // img.src = image.src
        // Access to Image at 'http://nos.netease.com/yd-searchq/ccdf5167-0a86-4f4d-8c16-ae84e3b043ec.jpg'
        // from origin 'http://searchq-editsys.youdao.com' has been blocked by CORS policy:
        // No 'Access-Control-Allow-Origin' header is present on the requested resource.
        // Origin 'http://searchq-editsys.youdao.com' is therefore not allowed access.
        //
        // http://nos.netease.com/yd-searchq/77cbb0a2-8e76-4001-8d82-cc392e470a35.jpg?imageView&crop=215_1481_753_264
        img.src = image.src + '?imageView&crop={0}_{1}_{2}_{3}'.format(
            Math.round(x1*scale), Math.round(y1*scale), Math.round(width*scale), Math.round(height*scale))
        img.onload = function() {
            const zoom = O.snapZoom
            const canvas = document.createElement('canvas')
            canvas.width = width * zoom
            canvas.height = height * zoom
            const ctx = canvas.getContext('2d')
            ctx.scale(zoom / scale, zoom / scale)
            ctx.drawImage(img, 0, 0)
            canvas.toBlob(imgBlobUpload(pot.uid))
        }
    })
}

/**
 * 功能: 框选识别文字功能
 * 用于替代系统框选，系统框位置有偏移
 */
function registerExtraOCR(pot){
    function toDecimal(x){
        return Math.floor(x*100)/100
    }

    function procResult(result, uid){
        const cont = execReplRules(result.replace(/^<br\/>/,''), ORCRULE, helper.getInputSubject(), pot.uid)
        if(O.debug){
            C.log(cont)
        }
        const qe = helper.getEditor(uid)
        if (uid === 0 || !O.autoSliceAnalysis){
            qe.setContent(cont, qe.getContent()) // true 表示追加
            return
        }

        const qe2 = helper.getEditor(2)
        let m = cont.match(/[\[【]*(解析|点拨)[:】\]]*/g)
        if (m && m.length === 1){
            m = cont.match(/[\[【]*(解析|点拨)[:】\]]*/)
            const answer = cont.slice(0,m.index).replace(/答案:*/,'')
            let analysis = cont.slice(m.index + m[0].length)
            m = analysis.match(/本*题*考查([\u4E00-\u9FA5、]+)[.,。]/)
            if (m && m.length === 1){
                analysis = analysis.slice(m.index + m[0].length)
                helper.getEditor(4).setContent(m[1], false)
            }
            qe.setContent(answer, qe.getContent())
            qe2.setContent(analysis, qe2.getContent())
        } else if(m && m.length > 1) { // 出现多个解析的话,识别结果放到解析
            qe2.setContent(cont, qe2.getContent())
        } else {
            let m = cont.match(/[.,·]*([A-D])/)
            if (m && m.index === 0){
                const answer = m[1]
                const analysis = cont.slice(m.index + m[0].length)
                qe.setContent(answer, qe.getContent())
                qe2.setContent(analysis, qe2.getContent())
            } else {
                const answer = cont.replace(/答案:*/,'')
                qe.setContent(answer, qe.getContent())
            }
        }
    }

    const $btn = helper.cloneButton(pot.$btnLatex, STR.MODULE.EXTRA_OCR, STR.HINT.EXTRA_OCR)
    $btn.attr('id', 'xusqa_ocr_' + pot.uid)
    $btn.css({'width': '50px', 'background-color': '#337ab7'}).insertAfter(pot.$btnLatex) // PIT: btnHeader = 2
    $btn.click(function(){
        const $sel = pot.sel[0] === '#' ? $(pot.sel) : pot.$box.find(pot.sel)
        if (!$sel.length){
            helper.msg.error(STR.GLASS.FAILED)
            return
        }

        const image = pot.img[0] === '#' ? $(pot.img)[0] : pot.$box.find(pot.img)[0]
        const scale = toDecimal(image.naturalWidth / image.width)
        const d = $sel.last()[0]
        const m = d.attributes.style.value.match(/-*\d+/g)
        let x1 = Math.floor(parseInt(m[1]) * scale * 100)/100
        let x2 = x1 + Math.floor(parseInt(m[2]) * scale * 100)/100
        let y1 = Math.floor(parseInt(m[0]) * scale * 100)/100
        let y2 = y1 + Math.floor(parseInt(m[3]) * scale * 100)/100
        x1 = x1 < 0 ? 0 : x1 // 左出界
        x2 = x2 > image.naturalWidth ? image.naturalWidth : x2 // 右出界
        y1 = y1 < 0 ? 0 : y1
        y2 = y2 > image.naturalHeight ? image.naturalHeight : y2
        const region = JSON.stringify([x1, y1, x2, y1, x2, y2, x1, y2])
        //ocr(image.src, region, pot.uid)
        // Request URL: http://searchq-editsys.youdao.com/editsys/ocr
        // Request Method: POSTdsosk6" method="POST"
        // Content-Disposition: form-data; name="url"
        // http://nos.netease.com/yd-searchq/fd2b6d38-6e06-48d3-a17d-f33c0fa31e8b.jpg
        // Content-Disposition: form-data; name="region"
        // [1252.16,562.24,2224.42,562.24,2224.42,1244.79,1252.16,1244.79]
        const formdata = new window.FormData()
        formdata.enctype ='multipart/form-data'
        formdata.append('url', image.src)
        formdata.append('region', region)
        $.ajax({
            url: URL.OCR,
            type: 'POST',
            data: formdata,
            cache: false,
            processData: false,
            contentType: false,
            /*\
            {   "code":200,
                "data":{
                    "result":"我是OCR结果<br/>"
                },
                "message":"SUCCESS" }
            \*/
            success: function(data) {
                if (data.code === 200) {
                    procResult(data.data.result, pot.uid)
                    helper.msg.success(STR.EXTRA_OCR.SUCCESS)
                } else {
                    helper.msg.error(data.message)
                }
            }
        })
    })
}

/**
 * 功能: 放大镜功能
 * 字太小,看不清?试试放大镜，可以放大框选区域
 */
function registerGlass(pot){
    const $btn = helper.cloneButton(pot.$btnLatex, STR.MODULE.GLASS, STR.HINT.GLASS)
    $btn.css('width', '50px').insertAfter(pot.$btnLatex) // PIT: btnHeader = 2
    $btn.click(function(){
        const $sel = pot.sel[0] === '#' ? $(pot.sel) : pot.$box.find(pot.sel)
        if (!$sel.length){
            helper.msg.error(STR.GLASS.FAILED)
            return
        }

        const d = $sel.last()[0]
        const ctn = d.parentNode.parentNode
        const m = d.attributes.style.value.match(/\d+/g)
        const y1 = parseInt(m[0]), x1 = parseInt(m[1]), width = parseInt(m[2]), height = parseInt(m[3])
        const $img = pot.img[0] === '#' ? $(pot.img) : pot.$box.find(pot.img)
        const scale = $img[0].naturalWidth / $img[0].width
        let zoom = $sel[0].parentNode.clientWidth / width
        zoom = zoom > O.glassMinzoom ? zoom : O.glassMinzoom
        const canvas = $(TPL.GLASS).insertBefore($img)[0]
        canvas.width = width * scale
        canvas.height = height * scale
        canvas.getContext('2d').drawImage($img[0], -x1*scale, -y1*scale)
        canvas.onclick = function (){
            if (canvas){
                canvas.remove()
            }
        }
        $img.click(canvas.onclick)
        $sel.parent().click(canvas.onclick)

        // PIT: 放在上面有问题
        canvas.style.width = (Math.round(width*zoom) - 3) + 'px'
        canvas.style.height = Math.round(height*zoom) + 'px'
        canvas.style.left = (Math.round(ctn.scrollLeft) + 1) + 'px'
        canvas.style.top = (Math.round(ctn.scrollTop) + 5)+ 'px'
    })
}

/**
 * 题目页点缩小的时候，滚动条跟随选框
 */
function extraMin(pot){
    function delayScroll(left, top){
        pot.$ctn.scrollLeft(left)
        pot.$ctn.scrollTop(top)
    }

    pot.$min.attr('title', STR.HINT.MIN).addClass('xusqa-btn')
    pot.$min.click(function(){
        if (pot.$min.hasClass('fixed-box_max')){
            $('#xusqa_ocr_' + pot.uid).show()
        } else { // 执行缩小操作
            $('#xusqa_ocr_' + pot.uid).hide()

            const $sel = pot.sel[0] === '#' ? $(pot.sel) : pot.$box.find(pot.sel)
            if (!$sel.length){
                return
            }
            const d = $sel.last()[0]
            const m = d.attributes.style.value.match(/\d+/g)
            let x1 = parseInt(m[1])
            let y1 = parseInt(m[0])
            x1 = x1 > 5 ? x1 - 5 : x1 // 留点余量
            y1 = y1 > 30 ? y1 - 30 : y1
            setTimeout(delayScroll, 300, x1, y1)
        }
    })
}

/**
 * 修正题目页新增框选
 * 修正了有滚动条的时候可能被遮挡的问题
 * 现在新增框选会自动框住题目并定位到题目
 */
function fixQuestionAddCut(){
    clearTimeout(stage.timer.fixQuestionAddCutTimer)

    const v = $(DOM.QUESTION_BOX)[0].__vue__
    if (v && v.pageno !== -1){
        stage.editPage.questionPageno = v.pageno

        v.addCut = function(){
            let x, y
            const container = $(DOM.QUESTION_BOX_IMG_CTN)[0]
            if (stage.editPage.questionPageno === v.pageno){
                // http://nos.netease.com/yd-searchq/57d684cd-770b-4b5d-9ed7-3cf489ea7df8.jpg?imageView&crop=929_1718_858_244
                const imgQuestionBox = $(DOM.QUESTION_BOX_IMG)[0]
                const scale = imgQuestionBox.width / imgQuestionBox.naturalWidth
                const m = $(DOM.QUESTION_IMG)[0].src.match(/crop=(\d+)_(\d+)_(\d+)_(\d+)/)
                x = Math.round(parseInt(m[1]) * scale)
                y = Math.round(parseInt(m[2]) * scale)
                const style = {
                    'width': Math.round(parseInt(m[3]) * scale),
                    'height': Math.round(parseInt(m[4]) * scale),
                    'x': x,
                    'y': y,
                    }
                    v.$refs.regionAnswer.addCut(style)

                    container.scrollLeft = x
                    container.scrollTop = y
            } else{
                x = Math.round(container.scrollLeft + (container.clientWidth - 440) / 2)
                x = x > 0 ? x : 10
                y = Math.round(container.scrollTop + (container.clientHeight - 125) / 2)
                const style = {
                    'width': 440,
                    'height': 125,
                    'x': x,
                    'y': y,
                    }
                    v.$refs.regionAnswer.addCut(style)
            }
        }
    } else {
        stage.timer.fixQuestionAddCutTimer = setTimeout(fixQuestionAddCut, 500)
    }
}

/**
 * 修正答案页新增框选
 * 修正了答案页在有滚动条的时候新增框选可能被遮挡的问题
 */
function fixAnswerAddCut(){
    const v = $(DOM.ANSWER_BOX)[0].__vue__
    if (v) {
        v.addCut = function() {
            const container = document.querySelector(DOM.ANSWER_BOX_IMG_CTN)
            let x = Math.round(container.scrollLeft + (container.clientWidth - 440) / 2)
            x = x > 0 ? x : 10
            let y = Math.round(container.scrollTop + (container.clientHeight - 125) / 2)
            const style = {
                'width': 440,
                'height': 125,
                'x': x,
                'y': y,
            }
            v.$refs.regionAnswer.addCut(style)
        }
    }
}

/**
 * 功能: 截图功能
 * 为题目页和答案页的框框添加截图功能，框选后点击截图可以直接截图并插入题目或解析相应位置
 * 直接用QQ截图也挺好用的，因为UE支持图片粘贴，写完了才发现，呵呵哒
 */
function imgBlobUpload(uid, callback){
    return function(blob) {
        const timestrap = (+new Date()).toString(36)
        // ------ UEditor upload image form source code ------
        // <form id="edui_form_jjdsosk6" target="edui_iframe_jjdsosk6" method="POST"
        //  enctype="multipart/form-data" action="/editsys/ueditor/config"
        //  style="display:block;width:20px;height:20px;overflow:hidden;border:0;margin:0;padding:0;position:absolute;top:0;left:0;
        //      filter:alpha(opacity=0);-moz-opacity:0;-khtml-opacity: 0;opacity: 0;cursor:pointer;">
        //  <input id="edui_input_jjdsosk6" type="file" accept="image/*" name="upfile" style="...">
        // </form>
        const formdata = new window.FormData()
        formdata.enctype ='multipart/form-data'
        const f = new window.File([blob], 'snap_' + timestrap + '.PNG')
        formdata.append('upfile', f, f.name)
        $.ajax({
            url: URL.UPLOAD_IMAGE,
            type: 'POST',
            data: formdata,
            cache: false,
            processData: false,
            contentType: false,
            success: function(d) {
                /*\
                "{  "state": "SUCCESS","original": "snap.png","size": "50635","type": ".png","title": "1531117139604.png",
                    "url": "http://nos.netease.com/yd-searchq/27077406-18e5-4f10-bb76-8db943021bca.png" }"
                 *  PIT: the return value is not a json, but a string, waste a lot of time on debuging!
                \*/
                d = $.parseJSON(d)
                if (d.state === 'SUCCESS') {
                    if (callback && typeof(callback) === 'function'){
                        callback(d)
                    } else{
                        const qe = helper.getEditor(uid)
                        qe.focus()
                        qe.execCommand('inserthtml','<img src="' + d.url +'" title="' + d.title + '" alt="' + d.original + '"/>')
                        helper.msg.success(STR.SNAP.SUCCESS)
                    }
                }
            }
        })
    }
}

/**
 * 为录题界面添加功能
 */
function doExtendEditPage(){
    let timer
    function doRegister(){
        clearTimeout(timer)
        if (!document.isReady){
            timer = setTimeout(doRegister, 200)
            return
        }
        const $boxA = $(DOM.ANSWER_BOX)
        const $boxQ = $(DOM.QUESTION_BOX)
        const $btnALatex = $boxA.find(DOM.ANSWER_BOX_LATEX_BTN)
        const $btnQLatex = $boxQ.find(DOM.QUESTION_BOX_LATEX_BUTTON)
        if(!($btnALatex.length && $btnQLatex.length)){
            timer = setTimeout(doRegister, 200)
            return
        }

        stage.editPage.v = $(DOM.EDIT_PAGE)[0].__vue__

        registerLocateButton({
            $box: $boxA,
            //$jmp: $boxA.find(DOM.ANSWER_BOX_JUMP_BTN),
            $ipt: $boxA.find(DOM.ANSWER_BOX_JUMP_INPUT),
            ctn: DOM.ANSWER_BOX_IMG_CTN,
            cls: DOM.ANSWER_BOX_CLOSE
        }) // register locate pre answer position

        registerGlass({
            $btnLatex: $btnALatex,
            $box: $boxA,
            sel: DOM.ANSWER_BOX_IMG_SEL,
            img: DOM.ANSWER_BOX_IMG,
        })
        registerGlass({
            $btnLatex: $btnQLatex,
            $box: $boxQ,
            sel: DOM.QUESTION_BOX_IMG_SEL,
            img: DOM.QUESTION_BOX_IMG,
        })

        registerSnap({ // register answer page snap
            $btnLatex: $btnALatex,
            $box: $boxA,
            sel: DOM.ANSWER_BOX_IMG_SEL,
            img: DOM.ANSWER_BOX_IMG,
            uid: 2, // 解析
        })
        registerSnap({ // register question page snap
            $btnLatex: $btnQLatex,
            $box: $boxQ,
            sel: DOM.QUESTION_BOX_IMG_SEL,
            img: DOM.QUESTION_BOX_IMG,
            uid: 0, // 题目
        })

        registerExtraOCR({ // register answer page OCR
            $btnLatex: $btnALatex,
            $box: $boxA,
            sel: DOM.ANSWER_BOX_IMG_SEL,
            img: DOM.ANSWER_BOX_IMG,
            uid: 1, // 还是追加到答案吧
        })
        registerExtraOCR({ // register question page OCR
            $btnLatex: $btnQLatex,
            $box: $boxQ,
            sel: DOM.QUESTION_BOX_IMG_SEL,
            img: DOM.QUESTION_BOX_IMG,
            uid: 0, // 题目
        })

        extraMin({
            $box: $boxA,
            $min: $boxA.find(DOM.ANSWER_BOX_MIN),
            $ctn: $(DOM.ANSWER_BOX_IMG_CTN),
            sel: DOM.ANSWER_BOX_IMG_SEL,
            uid: 1, // 答案
        })
        extraMin({
            $box: $boxQ,
            $min: $boxQ.find(DOM.QUESTION_BOX_MIN),
            $ctn: $boxQ.find(DOM.QUESTION_BOX_IMG_CTN),
            sel: DOM.QUESTION_BOX_IMG_SEL,
            uid: 0, // 题目
        })

        // 修复新增框选因滚动条被遮挡的问题
        fixAnswerAddCut()
        fixQuestionAddCut()

        // register question snap
        // delay load, if not, event added will be clear, why? test editpage.__vue__._isMounted
        setTimeout(registerQuestionSnap, 1000)
        setTimeout(registerQuestionSave, 1000)
    }
    doRegister()
}

function leaveQuestionInput(to,from){
    // save answer page position
    // when never show answer page, do'nt store params
    const $box = $(DOM.ANSWER_BOX)
    const v = $box[0].__vue__
    if (stage.scroll.flag || $box.is(':visible')){
        const ctn = $(DOM.ANSWER_BOX_IMG_CTN)[0]
        const pos = {
            taskId: from.fullPath.match(/taskid=(\d+)/)[1],
            textbookId: v.textbookid,
            scrollTop: ctn.scrollTop || stage.scroll.top,
            scrollLeft: ctn.scrollLeft || stage.scroll.left,
            currentPage: v.currentPageno,
        }
        S.xusqa_locatePosition = JSON.stringify(pos)
    }

    stage.editPage.v = null
    $(DOM.QUESTION_IMG).imgAreaSelect({
        remove: true
    })
    $('#xusqa_selection_question_box').remove()
}

function registerQjudgeHint(){
    let timer
    function tryRegisterQjudgeHint (){
        clearTimeout(timer)
        
        if ($(DOM.QJUDGE_BTN).length === 3){
            const $btnQJudge = $(DOM.QJUDGE_BTN).addClass('xusqa-btn')
            $btnQJudge.filter(':nth-child(1)').attr('title', STR.HINT.SEARCH_STANDARD)
            $btnQJudge.filter(':nth-child(2)').attr('title', STR.HINT.SEARCH_FAIL)
            $btnQJudge.filter(':nth-child(3)').attr('title', STR.HINT.SEARCH_LOSE)
            execCommand('registerQjudgeEncircle')
        } else {
            timer = setTimeout(tryRegisterQjudgeHint, 500);
        }
    }
    tryRegisterQjudgeHint()
}

function registerQjudgeEncircle(){
    clearTimeout(stage.timer.registerQjudgeEncircle)
    if (location.hash.indexOf('#/mytasks/qjudge') === -1){
        return
    }

    const $pager = $('#app > div > div.main-content > div > div > div.search-btns > div > div > div.fixed-box_pages > div > ul')
    if ($pager.length && $pager[0].__vue__){
        const v = $pager[0].__vue__
        let $a
        let qPageIndex //v.$parent.currentPage
        //const $box = $('#app > div > div.main-content > div > div > div.search-btns > div')
        //qPageIndex = $box[0].__vue__.pageno
        v.$watch('currentPage',function(newValue/*, oldValue*/){
            if (qPageIndex === undefined){
                qPageIndex = newValue
            }
            if (qPageIndex === newValue){
                $a.show()
            } else {
                $a.hide()
            }
        })

        const $img = $('#app > div > div.main-content > div > div > div.search-btns > div > div > div.fixed-box_container > img')
        $img.on('load', function(){
            if ($a){
                return
            }
            const $qimg = $('#app > div > div.main-content > div > div > div.edit-con > div.search-con > div > img')
            const src = $qimg[0].src
            const scale = /*$img[0].width*/ 960 / $img[0].naturalWidth
            //http://nos.netease.com/yd-searchq/968c7132-c967-41a4-9803-d59e98713649.jpg?imageView&crop=41_978_1594_217
            const m = src.match(/crop=(\d+)_(\d+)_(\d+)_(\d+)/)
            const x = Math.round(parseInt(m[1]) * scale)
            const y = Math.round(parseInt(m[2]) * scale)
            const width = Math.round(parseInt(m[3]) * scale)
            const height = Math.round(parseInt(m[4]) * scale)
            const a = '<a style="width: 100px;height: 100px;display: inline-block;top: 0px;left: 0px;position: absolute;border: 2px solid #f56c6c;"></a>'
            $a = $(a).insertBefore($img)
            $a.css({'height':height+'px','width':width+'px','left':x+'px','top':y+'px'})
            $a.attr({'width':width,'height':height})
        })
    } else {
        stage.timer.registerQjudgeEncircle = setTimeout(registerQjudgeEncircle,1000)
    }
}

function registerPreMonthReport(){
    const $btnAddTime = $(DOM.MYTASK_ADDTIME)

    clearTimeout(stage.timer.registerPreMonthReport)
    if ($btnAddTime.length === 0){
        stage.timer.registerPreMonthReport = setTimeout(registerPreMonthReport, 500)
    } else {
        const text = helper.checkPre2CheckedTaskIdArray() ? STR.MODULE.TASK_PREMONTH : STR.MODULE.TASK_PAST
        const btnPrem = helper.cloneButton($btnAddTime, text, STR.HINT.PAST)
        btnPrem.insertAfter($btnAddTime.parent()).click(function(){
            preMonthReport()
        })
    }
}

function question(id){
    $.get(URL.QUESTION.format({id: id}), function(data){
        if (data.code === 200){
            const d = data.data
            if (helper.isInEditPage()){
                helper.getEditor(0).setContent(d.qbody)
                helper.getEditor(1).setContent(d.answer)
                helper.getEditor(2).setContent(d.analysis)
                helper.getEditor(3).setContent(d.comment)
                helper.getEditor(4).setContent(d.knowledge)
            }
        }
    })
}

function registerOption(){
    const $option = $(TPL.OPTIONS).insertAfter($(DOM.POSITION))
    const $number_glassMinZoom = $(TPL.OPTIONS_NUMBER.format({title: '放大镜最小放大倍数 [1,5]',hint: '助手提示: 建议设为 1.5-3 倍', min:1, max:5, step:0.1})).appendTo($option).find('input')
    $number_glassMinZoom.val(O.glassMinzoom).on('change', function(){
        O.glassMinzoom = $number_glassMinZoom.val()
    })
    const $switch_newNum = $(TPL.OPTIONS_SWITCH.format({title: '小题序号是否从 1 开始重新排'})).appendTo($option).find('input')
    $switch_newNum.prop('checked', O.newNum).on('change', function(){
        O.newNum = $switch_newNum.prop('checked')
    })
    const $switch_autoSliceAnalysis = $(TPL.OPTIONS_SWITCH.format({title: '框的狠自动分割答案和解析'})).appendTo($option).find('input')
    $switch_autoSliceAnalysis.prop('checked', O.autoSliceAnalysis).on('change', function(){
        O.autoSliceAnalysis = $switch_autoSliceAnalysis.prop('checked')
    })
    //const $switch_fixSysBug = $(TPL.OPTIONS_SWITCH.format({title: '修复判题查看题目所在页空白'})).appendTo($option).find('input')
    //$switch_fixSysBug.prop('checked', O.fixSysBug).on('change', function(){
    //    O.fixSysBug = $switch_fixSysBug.prop('checked')
    //})

    $(TPL.OPTIONS_SEPARATE).appendTo($option)
    const $switch_navImage = $(TPL.OPTIONS_SWITCH.format({title: '左侧导航栏随机背景图片'})).appendTo($option).find('input')
    $switch_navImage.prop('checked', O.navImage).on('change', function(){
        O.navImage = $switch_navImage.prop('checked')
        refreshNavImage()
    })
    const $switch_epColor = $(TPL.OPTIONS_BUTTON.format({title: '设置护眼色,点击按钮切换'})).appendTo($option).find('button')
    $switch_epColor.find('span').text(EPCOLOR[O.epColor][0])
    $switch_epColor.on('click', function(){
        O.epColor = (O.epColor + 1) % EPCOLOR.length
        $switch_epColor.find('span').text(EPCOLOR[O.epColor][0])
    })
}

function registerDbsn(){
    clearTimeout(stage.timer.registerDbsn)
    const $sn = $(DOM.DBSN)
    if ($sn.length){
        $sn.dblclick(function(){
            V.$prompt('序列号','请输入序列号').then(function(result){
                    const sn = result.value
                    if (sn){
                        O.sn = sn
                        stage.profile.isValidSN = util.de(sn) === stage.profile.qqnumber
                    }
                })
        })

        registerOption()

        if (window.xusqadmin){
            const admin = window.xusqadmin
            if (admin.hasOwnProperty('sng') && typeof(admin.sng) === 'function'){
                admin.sng(V)
            }
            if (admin.hasOwnProperty('protectPersonalInfo') && typeof(admin.protectPersonalInfo) === 'function'){
                admin.protectPersonalInfo()
            }
        }
    } else {
        stage.timer.registerDbsn = setTimeout(registerDbsn, 0)
    }
}

/**
 * 添加功能按钮
 * 一键领取,任务广场,任务报告，设置界面
 */
function registerUI() {
    function addHeaderButton(text) {
        return helper.cloneButton(DOM.EXIT, text).insertAfter(DOM.USER)
    }

    addHeaderButton(STR.MODULE.TASK_REPORT).click(myTaskReport)
    addHeaderButton(STR.MODULE.TASK_TODAY).click(todayTaskReport)
    const $btnOneKeyGetTask = addHeaderButton(STR.MODULE.ONEKEY_GET_TASK).click(function(){
        return execCommand('doOneKeyGetTask')
    })
    const $btnConfig = $(TPL.CONFIG_BUTTON).insertAfter($btnOneKeyGetTask)
    const $config = $(TPL.CONFIG_MAIN).insertAfter($btnConfig)
    $btnConfig.click(function(){
        if ($config.is(':visible')){
            $config.hide()
        } else {
            $config.children('textarea').val(O.onekeyGetTaskSEs)
            $config.find('input:checkbox').attr('checked', O.showHint)
            $config.css('left', '{0}px'.format($btnOneKeyGetTask[0].offsetLeft)).show()

            $(document).on('click.xusqa_event', function(e) {
                e = e || window.event
                let elem = e.target || e.srcElement
                while (elem) {
                    if (elem.id && (elem.id === 'xusqa_div_config' || elem.id === 'xusqa_div_config_button')) {
                        return
                    }
                    elem = elem.parentNode
                }
                $config.hide()
                $(document).off('click.xusqa_event')
            })
        }
    })

    $config.find('a').click(function(){
        let err = ''
        let msg = ''
        const a = $config.children('textarea').val().split(/\s*[,，]\s*/)
        const r = []

        a.forEach(se => {
            if (se && SE.hasOwnProperty(se) && SE[se]){
                if (!helper.isExcludedSE(se) ){
                    r.push(se)
                } else {
                    msg = msg + se ? '“' + se + '”' : ''
                }
            } else {
                err = err + se ? '“' + se + '”' : ''
            }
        })

        if (err){
            helper.msg.error(STR.CONFIG.SE_NO_PRICE.format({se : err}))
        } else{
            const s = r.join(',')
            if (s){
                O.onekeyGetTaskSEs = s
                O.showHint = $config.find('input:checkbox').prop('checked')
                $config.hide()
                helper.msg.success(STR.CONFIG.SUCCESS + (msg ? msg + '在排除列表,已被自动屏蔽.' : ''))
            } else { // 清空的话自动全部加载
                $config.children('textarea').val(helper.getDefaultSEs())
            }
        }
    })

    refreshNavImage()
}

function initUE(){
    clearTimeout(stage.timer.initUETimer)
    if (window.UE){
        U = window.UE
        execCommand('doExtendUE')
    } else{
        stage.timer.initUETimer = setTimeout(initUE, 0)
    }
}

function initVue(){
    clearTimeout(stage.timer.initVueTimer)

    if (window.app && window.app.__vue__){
        V = window.app.__vue__

        V.$router.afterEach((to, from) => {
            if (O.debug){
                C.group('$router.afterEach')
                C.log('to', to)
                C.log('from:', from)
                C.groupEnd()
            }
            try{
                if (to.name === 'QuestionInput') {
                    if (!U){
                        initUE()
                    }
                    execCommand('doExtendEditPage')
                } else if (to.name === 'QuestionJudge') {
                    registerQjudgeHint()
                } else if (to.name === 'TaskChoose'){
                    extraTaskList()
                } else if (to.name === 'Mytasks'){
                    registerPreMonthReport()
                } else if (to.name === 'UserCenter'){
                    registerDbsn()
                }

                if (from.name === 'Login'){
                    waitLogin()
                }
            } catch(error){
                C.error(error)
            }
        })

        V.$router.beforeEach((to, from, next) => {
            try{
                if (from.name === 'QuestionInput') {
                    if (to.name === 'Login'){ // 录题提交的时候,如果转到重新登录的话保存题目
                        helper.saveQuestion()
                    }
                    leaveQuestionInput(to, from)
                }
            } catch(error){
                C.error(error)
            } finally{
                next()
            }
        })
    } else {
        stage.timer.initVueTimer = setTimeout(initVue, 100)
    }
}

function getProfile(){
    $.get(URL.GET_PROFILE, function(data){ // status:'success'
        if (data.code === 200){
            var a = []
            for(let es of data.data.permission){
                const se = es.slice(2) + '-' + es.slice(0,2)
                if (SE[se]){
                    a.push(se)
                }
            }
            stage.profile.permission = a
            stage.profile.isValidSN = util.de(O.sn) === data.data.qqnumber
            stage.profile.qqnumber = data.data.qqnumber
        }
    })
}

function waitLogin(){
    function onLogin(){
        getProfile()
        registerUI()
    }

    clearTimeout(stage.timer.waitLoginTimer)
    if (helper.isLogin() && $(DOM.USER).length) {
        onLogin()
    } else {
        const now = new Date()
        if (now - stage.startLoginTime < 60*1000*2){ // 最大登录等待时间,超过 2 分钟不再重试
            stage.timer.waitLoginTimer = setTimeout(waitLogin, 1000, onLogin) // 1 秒后重试
        }
    }
}

function init(){
    O.epColor = O.epColor
    initVue()
    waitLogin()
}
init()

const policy = {
    frequencyCheck: function(timeList, rule){ //rule=[[2,1000*10],[4,1000*60],]
        const now = new Date()
        const max = rule[rule.length - 1][0] //4
        for(let r of rule){
            const k = r[0] - 1
            if (timeList.length >= k){
                if (now - timeList[timeList.length - k] < r[1]){
                    return false
                }
            }
        }

        timeList.push(now)
        if (timeList.length > max){
            timeList.shift()
        }
        return true
    },
    passport: function(){
        return stage.profile.isValidSN // || stage.profile.inWhiteList
    },
    doOneKeyGetTask: {
        timeList: [],
        check: function(){
            return policy.passport() || policy.frequencyCheck(this.timeList, [[2,1000*10], [4,1000*60]])
        }
    },
    doExtraTaskList: {
        timeList: [],
        check: function(){
            return policy.passport() || policy.frequencyCheck(this.timeList, [[2, 1000*20], [4,1000*60], [6, 1000*60*2]])
        }
    },
    doClear: {
        check: function(){
            return true
        }
    },
}

const exportFun = {
    'doClear': doClear,
    'doExtraTaskList': doExtraTaskList,
    'doOneKeyGetTask': doOneKeyGetTask,
    'doExtendEditPage': doExtendEditPage,
    'doExtendUE': doExtendUE,
    'registerQjudgeEncircle': registerQjudgeEncircle,
}

function execCommand(cmd){
    if (exportFun.hasOwnProperty(cmd)){
        const f = exportFun[cmd]
        if (typeof(f) === 'function'){
            if (policy.hasOwnProperty(cmd)){
                if (policy[cmd].check()){
                    f()
                } else {
                    C.error(STR.ERROR.POLICYDENY)
                }
            } else {
                if (policy.passport()){
                    f()
                }
            }
        }
    }
}

/**
 * 清除旧版本的无用数据,修复异常
 */
function doClear(){
    if (O.clearFlag !== 200){
        S.removeItem('xusqa_taskId')
        S.removeItem('xusqa_textbookId')
        S.removeItem('xusqa_pageno')
        S.removeItem('xusqa_scrollLeft')
        S.removeItem('xusqa_scrollTop')

        // 修复9月份结算数据异常
        S.removeItem('xusqa_acc_month_201808')

        O.clearFlag = 200
    }
}
doClear()

/*\
 * API 调用方法：
 *  window.xusqapi.fnname(params1,param2,...)
\*/
const xusqapi = {
    get options(){
        return O.options
    },

    get debug(){
        return O.debug
    },
    set debug(bDebug){
        O.debug = bDebug
    },

    get newNum(){
        return O.newNum
    },
    set newNum(bNew){
        O.newNum = bNew
    },

    get showHint(){
        return O.showHint
    },
    set showHint(bShowHint){
        O.showHint = bShowHint
    },

    get snapZoom(){
        return O.snapZoom
    },
    set snapZoom(zoomLevel){
        O.snapZoom = zoomLevel
    },

    get onekeyGetTaskSEs(){
        return O.onekeyGetTaskSEs
    },
    set onekeyGetTaskSEs(ses){
        O.onekeyGetTaskSEs = ses
    },

    get onekeyGetTaskStep(){
        return O.onekeyGetTaskStep
    },
    set onekeyGetTaskStep(stepSize){
        O.onekeyGetTaskStep = stepSize
    },

    get excludedSEs(){
        return O.excludedSEs
    },
    set excludedSEs(ses){
        O.excludedSEs = ses
    },

    get glassMinzoom(){
        return O.glassMinzoom
    },
    set glassMinzoom(zoomLevel){
        O.glassMinzoom = zoomLevel
    },

    get autoSliceAnalysis(){
        return O.autoSliceAnalysis
    },
    set autoSliceAnalysis(autoSlice){
        O.autoSliceAnalysis = autoSlice
    },

    get crazyMode(){
        return O.crazyMode
    },
    set crazyMode(bCrazyMode){
        O.crazyMode = bCrazyMode
    },

    get epColor(){
        return O.epColor
    },
    set epColor(index){
        O.epColor = index
    },

    get clearFlag(){
        return O.clearFlag
    },
    set clearFlag(clearFlag){
        O.clearFlag = clearFlag
    },
    /*\
     * method:
     *  function addUserRuler(regstr, replacement, subjects)
     * params:
     *  regstr: 正则表达式字符串
     *  replacement: 替换
     *  subjects: subjects
    \*/
    addUserRuler: function(regstr, replacement, subjects){
        let it = [new RegExp(regstr), replacement, subjects]
        USRRULE.push(it)
        helper.saveUserRules()
    },

    question: function(id){
        question(id)
    },

    listSimple: function(){
        return helper.listSimple()
    },
    removeSimple: function(id){
        return helper.removeSimple(id)
    },
    debugSimple: function(id){
        return helper.debugSimple(id)
    },
    exitDebugSimple: function(){
        return helper.exitDebugSimple()
    },

    execCommand: function(cmd){
        execCommand(cmd)
    },
}
window.xusqapi = xusqapi

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