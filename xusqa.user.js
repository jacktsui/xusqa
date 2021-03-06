// ==UserScript==
// @name         有道搜题录题助手
// @namespace    jacktsui
// @version      1.3.160
// @description  有道搜题,录题员助手(一键领取任务,广场任务数量角标显示,任务报告,一键整理,定位答案,框选截图,放大镜,题目保存和恢复,优化系统行为等)
// @author       Jacktsui
// @copyright    © 2018, 徐。355088586@qq.com
// @license      MIT https://mit-license.org/
// @homepageURL  https://github.com/jacktsui/xusqa/blob/master/manual/README.md
// @supportURL   https://github.com/jacktsui/xusqa/issues
// @UpdateURL    https://github.com/jacktsui/xusqa/raw/master/xusqa.user.js
// @require      http://searchq-editsys.youdao.com/static/Ueditor/kityformula-plugin/kityformula/js/jquery-1.11.0.min.js
// @match        http://searchq-editsys.youdao.com/
// @grant        none
// @run-at       document-start
// @note         一键整理为实验性功能
// @note         编写原则: 助手尽量保持系统原有行为和样貌,修改过的地方都打了标记
// @note         未来计划: 重点维护录题功能,提高录题效率是脚本的终极目标
// @note         最近更新: 2018.09.30 初审,终审账户录题扩展,初审任务报告
// @note         最近更新：2018.09.24 文本快速进公式编辑器编辑,该功能需要单独安装
// @note         最近更新：2018.09.13 添加个人中心脚本配置(护眼色等),本月报告及上月结算优化、缓存和bug修复
// @note         最近更新：2018.08.11 框的准自动切割答案和解析
// @note         最近更新：2018.08.05 添加题目保存和恢复功能及其他小功能
// @note         最近更新：2018.07.23 添加万能点(`)功能
// @note         最近更新: 2018.07.21 添加化学整理规则,优化一键整理排版,判题按钮添加规则提示,添加[框的准]功能
// @note         最近更新：2018.07.17 添加放大镜功能，题目页和答案页框选后可以放大；优化缩小体验，现在点缩小滚动条会自动追随选框
// @note         最近更新：2018.07.13 优化题目页“新增框选”可以直接定位题目，优化答案页“新增框选”保证框总在可视区。修复答案页在右靠时，框选按钮消失的问题
// @note         最近更新：2018.07.10 添加框选截图功能。题目图片上可以直接拖框截图，题目页和答案页可以用原来的框选截图
// @note         最近更新: 2018.07.07 定位答案添加定位到“上次位置”
// @note         2018.07.03 一键智能整理
// @note         2018.07.01 初版,任务报告,一键领取
// ==/UserScript==

/**
 * 油猴安装
 * chrome 插件伴侣下载地址: http://crxhelp.bj.bcebos.com/crxhelp.zip
 * 油猴4.7稳定版下载地址: https://www.crx4chrome.com/down/755/crx/
 * https://www.crx4chrome.com/go.php?d=84899&i=13792&p=755&s=1&l=https%3A%2F%2Ff.crx4chrome.com%2Fcrx.php%3Fi%3Ddhdgffkkebhmkfjojejmpbldmpobfkfo%26v%3D4.7
 *
 * 外部资源
 * http://searchq-editsys.youdao.com/static/Ueditor/kityformula-plugin/kityformula/js/jquery-1.11.0.min.js
 * https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
 * 10月1号取消外部资源引用,不会再出现插件因CDN无法使用的问题,以下内容过期
 * 8月19号bootcss广州部分地区不能访问
 * 8月1号staticfile出过问题,部分地区不能访问
 * 备用cdn服务器
 * https://cdn.bootcss.com/
 * https://cdn.staticfile.org/
 * https://cdnjs.cloudflare.com/ajax/libs/
 */

(function() {
    'use strict';

const ver = '1.3.160'

// 扩展版本号代理
let ver_kfe = '0.0.000'

//const ROLE = ['图片裁切', '题目录入', '题目审核']

/*->->->->->-> 配置区 ->->->->->->*/
const SE = {
    '数学-高中': [1.5, 0.3],
    '理数-高中': [1.5, 0.3],
    '文数-高中': [1.5, 0.3],
    '英语-高中': [1.2, 0.3],
    '语文-高中': [1.2, 0.3],
    '物理-高中': [1.5, 0.3],
    '化学-高中': [1.5, 0.3],
    '生物-高中': NaN,
    '历史-高中': NaN,
    '政治-高中': NaN,
    '地理-高中': NaN,
    '理综-高中': NaN,
    '文综-高中': NaN,
    '数学-初中': [1.3, 0.25],
    '英语-初中': [1.1, 0.25],
    '语文-初中': [1.1, 0.25],
    '物理-初中': [1.3, 0.28],
    '化学-初中': [1.1, 0.28],
    '生物-初中': NaN,
    '历史-初中': NaN,
    '政治-初中': NaN,
    '地理-初中': NaN,
    '数学-小学': [0.5, 0.22],
    '英语-小学': [0.4, 0.18],
    '语文-小学': [0.6, 0.22],
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
    SN:{// \u2460-\u2469
        '1':'①','2':'②','3':'③','4':'④','5':'⑤','6':'⑥','7':'⑦','8':'⑧','9':'⑨','10':'⑩',
        // \u246a-\u2473
        '11':'⑪','12':'⑫','13':'⑬','14':'⑭','15':'⑮','16':'⑯','17':'⑰','18':'⑱','19':'⑲','20':'⑳',
    },
    RN:{ // \u2160-\u2169
        '1':'Ⅰ','2':'Ⅱ','3':'Ⅲ','4':'Ⅳ','5':'Ⅴ','6':'Ⅵ','7':'Ⅶ','8':'Ⅷ','9':'Ⅸ','0':'Ⅹ',
    },
    TAB: '&nbsp;&nbsp;&nbsp;&nbsp;',
    US6: '______',
    US3: '___',
    HR: '</p><hr/><p>',
    P: '</p><p>',
    ULB: '<span style="text-decoration: underline;">', ULE: '</span>',
}

const $ = window.jQuery
const C = window.console, S = window.localStorage
let U, V

const USRRULE = []

const ruleHelper = {
    _local_: {
        ruleflag: undefined
    },
    get ruleflag(){
        return this._local_.ruleflag
    },
    setRuleflag: function(html){
        if (/数列/.test(html)){
            this._local_.ruleflag = 1001
        }
    },
    clearRuleFlag: function(){
        this._local_.ruleflag = undefined
    },

    saveUserRules: function(){
        S.xusqa_userRules = JSON.stringify(USRRULE)
    },

    loadUserRules: function(){
        let r = S.xusqa_userRules ? JSON.parse(S.xusqa_userRules) : []
        return r
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
}

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
    [/([a-z])-\s([a-z])/g, '$1$2', '英语'],
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
    [/([xyz])E/g, '$1∈', '数学'], // ∈
    [/E([ZR])/g, '∈$1', '数学'],
    [/([\)\]])[Uu]([\(\[])/g, '$1∪$2', '数学'], // ∪
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

        if(!str.match(/梯形|方形|菱形|边形|矩形|体|平面/)){
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
    [/^[:.]{2,}/g, '∴', '数学'], //
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
    [/0H/g, 'OH', '化学'],
    [/CI/g, 'Cl', '化学'], // CI->Cl
    [/AH/g, 'ΔH', '化学'], //AH->ΔH(by 已注册-有两道)
    [/A([t])/g, 'Δ{$1}', '物理'],
    [/([a-zA-Z])0/g, '$1O', '化学'], // 修正O被识别为0
    [/AH([=<>])/, 'ΔH$1', '化学'],
    //[/[A-Z][2-9]*4/g, ] // TODO:修正↑被识别成4，需要更多样本，占个坑
    [/([\d\)])[xX]\s*([\d\()])/g, '$1×$2', '物理,化学'],
    [/([A-Za-z])([xX])(\d+)/g, '$1×$2', '物理,化学'],

    [function(str){ // 电子结构式?忘了是个什么东西了,长这样的1s22s22p63s2
        const r = /([1-4][spd])([1-9])/g
        let sm = '', sp = ''
        let t = 0

        let e = r.exec(str)
        while (e){
            t++
            sm += e[0]
            sp += e[1] + '<sup>' + e[2] + '</sup>'
            e = r.exec(str)
        }

        if (t > 1) { // 至少出现两次
            return str.replace(sm, sp)
        }
    }, '化学'],
    [function(/*str*/){
        if( ruleHelper.ruleflag === 1001){
            return [[/([abST])([n]|\d+)/g, '$1<sub>$2</sub>'], ]
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

    // 化学方程式
    [/(\([A-Z][a-zA-Z0-9]*\))(\d+)/g, '$1<sub>$2</sub>', '化学'], // 括号外面数字
    [/\((\w*)([A-Z][a-z]*)(\d)(\d*[+-])\)/g, '($1$2<sub>$3</sub><sup>$4</sup>)', '化学'], // 括号里面离子
    [/([A-Z][a-z]*)(\d[+-])([\u2E80-\u9FFF,.+=-])/g, '$1<sup>$2</sup>$3', '化学'],
    [/([A-Z][a-z]*)(\d)(\d*[+-])([\u2E80-\u9FFF,.+=-])/g, '$1<sub>$2</sub><sup>$3</sup>$4', '化学'],
    [/\((\w*)([A-Z][a-z]*)([+-])\)/g, '($1$2<sup>$3</sup>)', '化学'],
    [/([A-Z][a-z]*)([+-])([\u2E80-\u9FFF,.+=-])/g, '$1<sup>$2</sup>$3', '化学'],
    [/([A-Z][a-z]*)(\d+)/g, '$1<sub>$2</sub>', '化学'],

    // 被上面的替换,以下废掉
    //[/\(([a-zA-Z])([2-9]*[+-])\)/g, '($1<sup>$2</sup>)', '化学'], // 括号里的离子上标,放前头先处理
    //[/([a-zA-Z])([2-9]*[+-])([\u2E80-\u9FFF,.+=-])/g, '$1<sup>$2</sup>$3', '化学'], // 离子上标 Cu2++
    //[/([a-zA-Z])([2-9]*[+-])$/g, '$1<sup>$2</sup>', '化学'], // 末尾的离子上标
    //[/(\([A-Z][1-9a-zA-Z]+\))([2-9]|[1-9][0-9])/g, '$1<sub>$2</sub>', '化学'], // 化学分子符号下标
    //[/([A-Z]|[A-Z][a-z])([1-9][0-9]*)/g, '$1<sub>$2</sub>', '化学'], // 下标

    [/([v])\s*([正逆])/g, '$1<sub>$2</sub>', '化学'],
    [/([nN])A/g, '$1<sub>A</sub>', '化学'], // 阿伏伽德罗常数

    // 整理括号
    [/\(\s*\)/g, '(&nbsp;&nbsp;&nbsp;&nbsp;)', 0, '0'], // ( )->(    )

    // 分段
    [/\s*([AB]\:)/g, DIC.P + '$1', '英语', '0'], // A和B对话
    [/\s*([MW]\:)/g, DIC.P + '$1', '英语', '2'], // 听力解析W和M对话
    //[/(\([A-G]\))/g, DIC.P + '$1', '英语,物理,化学', '0'], // ex: A.goodB.better (A)good(B)better(1)
    [/([^A-Z∠])\s*([A-G]\.)/g, '$1' + DIC.P + '$2', '^英语', '0'], // ex: A.goodB.better 排除:ABC.

    // 统一格式
    //[/([0-9a-zA-Z>+°\)\-])([\u4E00-\u9FA5])/g, '$1 $2'], // 汉字前面的字符和汉字之间加空格 >上下标符号等特殊处理
    //[/([\u4E00-\u9FA5])([0-9a-zA-Z+°\(\-])/g, '$1 $2'], // 汉字后面的字符和汉字之间加空格

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
    [/\(\s*\d{4}\s*[\u4E00-\u9FA5·]+\)/, '', '^', '0'], // (2018山东青岛黄岛区期中)
    [/\(\s*\d{4}\s*[\u4E00-\u9FA5]+\,\s*\d+\s*\)/g, '', '^', '0'], // (2018 江苏,25)
    [/([\u4E00-\u9FA5])(<br><\/p><p>|<br>)([\u4E00-\u9FA5])/g, '$1$3', '语文,英语,物理,化学'], // 去掉两个汉字之间的多余换行,主要是OCR识别引入的无效换行
    [/([a-z]+)(<br><\/p><p>|<br>)([0-9a-z]+)/g, '$1 $3', '英语'], // 两个单词之间除了空格没有别的,判定换行多余
    [/(<p><br><\/p>)/g, ''], // 清除空行
    [/(<p><br>)/g, '<p>'],
    [/'\s*([td])/g, '\'$1'], // 去掉I' d中间空格

    // 万能点`·
    // 英语数字前面`: `1->___1___,相关代码在上面f里
    [/1`(\d+)/,function(_,$1){ // 1`10:1.______,2.______,...10.______
        let l = parseInt($1)
        let s = ''
        for(let i = 1; i <= l; i++){
            s += DIC.HR + i + '.' + DIC.US6
        }
        return s
    }, '英语', '0'],
    [/`{2}([\u4E00-\u9FA5]{2})/g, DIC.ULB + '$1' + DIC.ULE, '语文'], // 两个点后面两个汉字加下划线
    [/`([\u4E00-\u9FA5])/g, DIC.ULB + '$1' + DIC.ULE, '语文'], // 语文里面`代表给后面的汉字加下划线
    [/`([1-9]|1[0-9]|20)/g, function(_,$1){ // 语文数字前面加`:`1->①
        return DIC.SN[$1] || $1
    }, '语文'],
    [/`([\u2460-\u2469])/g, '<sup>$1</sup>', '语文'], // \u2460-\u2469表示:①->⑩,语文序号前面加`变上标:`①-><sup>①</sup>
    [/`/g, '______'], // 最后`代表一个空

    [/([1-4])([aoeiuv])/g, function(_,$1,$2){ // 语文声调
        const i = parseInt($1)
        return DIC.TONE[$2][i-1]
    }, '语文'],
    [/\(\s*\d{4}.+☆\)/, '', '^', '0'],
    [function(str){ // 如果就一道题的话,去掉题号
        let m = str.match(/\d+[·.,]*\s*([\u4E00-\u9FA5])/)
        if (m && m.index < 7){ //
            str = str.slice(0,m.index) + str.slice(m.index + m[0].length - m[1].length)
            return str
        }
    }, '^英语', '0'],

    [function(str){ // 如果就一道题的话,去掉题号
        let num = 1
        const r = /\d+/g
        let m = str.match(r)
        if (m && m.length > 1){
            let start = ruleHelper.getStartFromMatch(m), cur = -1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[0])
                if (cur - start === num - 1){
                    num++
                }
                e = r.exec(str)
            }
        }

        if (num < 2){ // 不是多个小题
            m = str.match(/\d+[·.,]*\s*([A-Za-z\u2E80-\u9FFF\-])/)
            if (m && m.index < 7){ //
                str = str.slice(0,m.index) + str.slice(m.index + m[0].length - m[1].length)
                return str
            }
        }
    }, '英语', '0'], // TODO: 待测试

    [/(\d)[·,]([\u4E00-\u9FA5])/g,'$1.$2', '语文'], // 纠正ocr点识别错误,将1.识别为1·,1,

    // 加分割线hr
    [/<hr>/g, ''], // 先清空hr,避免重复添加
    [/<p><\/p>/g, ''],
    [/([^f])(\([1-9]\))/g, '$1' + DIC.HR + '$2', '语文,数学,物理,化学', '0'], // (1),(2)
    [/([^f])(\([2-9]\))/g, '$1' + DIC.HR + '$2', '语文,数学,物理,化学', '^0'], //排除f(1)
    [function(str, uid){ // 语文分割线
        const b = O.newNum
        const ra = []
        const r = /([^0-9\()])(\d{1,2})([\.,·]*)([^0-9\)])/g
        const m = str.match(r)
        if (m && m.length > 2){
            let start = ruleHelper.getStartFromMatch(m), cur = -1, num = 1
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
                return ruleHelper.replByMatch(str, ra)
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
                str = ruleHelper.replByMatch(str, ra)
                type = 0
            }
        }

        ra.splice(0,ra.length)
        let is = false
        r = /([A-Z]|[A-Z][a-z]+):\s/g
        m = str.match(r)
        if (m && m.length > 2){// 判断是不是补全对话
            is = true
        }/* else {
            r = /\s\d{1,2}\s\(/g
            m = str.match(r)
            if (m && m.length > 2){ //单词填空
                is =true
            }
        }*/
        if (is){ // (考虑根据题目要求“根据对话内容,从方框内选出能填入空白处的最佳选项。其中有两项为多余选项。”判断是不是补全对话)
            //r = /([A-Za-z]+:\s)(\d{1,2})\.*(\s)/g
            r = /(\s)\(*(\d{1,2})\)*\.*([,?\s<\.])/g
            let start = ruleHelper.getStartFromMatch(str.match(r)), cur = -1
            let num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur === start && num > 2){
                    break
                }
                if (cur - start === num - 1){
                    ra.push([e[0], e.index, e[1] + DIC.US3 + (b ? num : cur) + DIC.US3 + e[3]])
                    num++
                }
                e = r.exec(str)
            }
            if (num > 3){
                str = ruleHelper.replByMatch(str, ra)
                type = 1
            }
        }

        ra.splice(0, ra.length)
        str = str.replace(/&nbsp;(\d+)/g, ' $1') // 发现数字前面有&nbsp;的题目,影响解析
        m = str.match(/[a-z]\s\d{1,2}\.*\s[a-z\(]/g)
        if (m && m.length > 2){ // TODO:判断是不是完型填空,算法需要优化
            //r = /(\D)(\d{1,2})\.*(\D)/g
            //r = /([^0-9#:%>])(\d{1,2})\.*([^0-9#:%])/g
            r = /([\s,.])(\d{1,2})\.*([\s,.])/g

            let start = ruleHelper.getStartFromMatch(str.match(r)), cur = -1, num = 1
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
                str = ruleHelper.replByMatch(str, ra)
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
        //r = /([^_#:0-9])(\(*\)*)\s*(\d+)([\.,]*)([^_:])/g //'3': &#39;单引号,':'排除时间
        r = /([^_#:0-9])(\(*\)*)\s*(\d{1,3})([\.,·]*)([^_:])/g
        m = str.match(r)
        if (m && m.length > 2){ // 匹配超过3个以上
            let start = ruleHelper.getStartFromMatch(str.match(r)), cur = -1, num = 1
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
                str = ruleHelper.replByMatch(str, ra)
            }
        }

        if (type === 1){ // 补全对话
            str = str.replace(/([A-Za-z]+:)/g, DIC.P + '$1')
            str = str.replace(/([A-G]\.)/g, DIC.P + '$1')
        } else if (type === 2){ // 完型填空,选项用4个空格隔开
            str = str.replace(/&nbsp;&nbsp;&nbsp;&nbsp;([B-D]\.)/g, '$1') //先清理,防止重复添加
            str = str.replace(/(<br\/>[B-D]|[B-D])(\.)/g, DIC.TAB + '$1$2')
        } else { // 非完形填空,分段换行
            str = str.replace(/([^A-Z])([A-G]\.)/g, '$1' + DIC.P + '$2')
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
            let start = ruleHelper.getStartFromMatch(m), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur - start === num - 1){ //答案也加入序列号验证
                    ra.push([e[0], e.index, e[1] + (num === 1 ? '' : DIC.HR) + (b ? num : cur) + '.' + e[4]])
                    num++
                }
                e = r.exec(str)
            }
            return ruleHelper.replByMatch(str, ra)
        }
    }, '英语', '^0'],

    [function(str){
        //const r = /([^_.])(\s*\([a-z]+\)|\([a-z]+\s[a-z]+\))/g
        const r = /([^_.\s]\s*)(\([a-z]+\)|\([a-z]+\s[a-z]+\))/g
        const m = str.match(r)
        const ra = []
        if (m && m.length > 2) { // 匹配超过3个以上
            let e = r.exec(str)
            while(e){
                ra.push([e[0], e.index, e[1] + DIC.US6 + e[2]])
                e = r.exec(str)
            }

            return ruleHelper.replByMatch(str, ra)
        }
    }, '英语', '0'],
    [function(str){ // (汉字)->______(汉字),(few)->______(few)
        const r = /([^_])(\([\u4E00-\u9FA5]+\))/g
        const m = str.match(r)
        const ra = []
        if (m && m.length > 4) { // 匹配超过5个以上
            let e = r.exec(str)
            while(e){
                ra.push([e[0], e.index, e[1] + DIC.US6 + e[2]])
                e = r.exec(str)
            }

            return ruleHelper.replByMatch(str, ra)
        }
    }, '英语', '0'],
    [/(\(*[1-9]\)|\(*[1-3][0-9]\))/g, DIC.HR + '$1', '英语', '0'], // (1),(2),1),2)
    [/(\(*[2-9]\)|\(*[1-3][0-9]\))/g, DIC.HR + '$1', '英语', '^0'],

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
        SUCCESS: '已领取任务“{se}”{role}',
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
        PROGRESS: '正在汇总报告……',
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
        ONEKEY_FORMAT: '一键整理(实验性功能):\r' +
            '新增 `(键盘Tab上边的那个键)功能和语文韵母前敲1234加声调功能\r' +
            '英语数字前面加 ` 将插入___1___,语文汉字前点 ` 可以加下划线,最后 ` 处将插入______\r' +
            '1. 一键整理,对结果不满意可以按ctr+z撤销\r' +
            '2. 可以自动排版,修复部分OCR识别错误,添加分隔符,换行,上下角标等等\r' +
            '3. 整理前最好先把一些关键字符的识别错误进行修正,主要包括括号,数字和ABCD后面的.等\r' +
            '注: 测试有限,如有bug,或出现诡异行为,请保留样本(点最左边的html,ctrl+a全选,复制到记事本)及时反馈,帮助优化脚本',
        SEARCH_LOSE: '题目差，去录题\r' +
            '不管“搜到”还是“没搜到”，检索结果中的题目都有可能是差题，只要是差题就不符合标准，也就是说这样的题目是不能用的，我们丢掉这样的题目，并且把给出的题目录到系统中。以下情况判为“题目差，去录题”\r' +
            '1.检索结果的内容中出现其它网站名称、链接、水印。\r' +
            '2.检索结果的答案有明显错误、答非所问等。\r' +
            '3.检索结果的内容杂乱，不是一道题，而是一整篇试卷或其他（注意此类情况要区别于阅读题等内容较长的大题、关联题）。\r' +
            '4.检索结果中的公式大量使用非标准公式或符号。\r' +
            '5.检索结果内容缺失：出现图片、表格或其他题目内容缺失或损坏。\r' +
            '6.排版杂乱导致无法阅读。' +
            '7.检索结果的答案出现截图且截图有些内容是可以手动录入的。' +
            '特殊情况\r' +
            '1、有些题有解析，没写答案属于好题还是差题？——如果答案在解析里且答案处写了“见解析”等字眼，判为“有好题，不用录”，否则判为差题\r' +
            '2、题目一样，图不一样，那这种属于没搜到还是好题？——看图会不会影响到整个题目，影响到的话为差题，否则为好题\r' +
            '3、一道题检索到的只有不相关的信息，例如只有第6章公式题目标题，其他的没有，这种情况属于好题还是怎么处理？——属于切题失误，判为“有好题不用录”\r' +
            '4、像排版比较乱的，不仔细看分不清楚哪行，但是仔细看又能接着做题属于好题还是差题。——不影响做题都可以判为好题，出现大量公式错误则判为差题\r' +
            '5、有些题目检索出来的配图很大——只要不影响到做题，判为好题，影响到做题的，判为差题\r' +
            '6、选项重复一遍，但不影响做题属于好题吗？——好题\r' +
            '7、检索结果有的出现带框框的数字或公式，这种属于差题吗？——排版杂乱无法阅读属于差题',
        SEARCH_FAIL: '没搜到，去录题\r' +
            '1、判断依据：本质上不是同一道题。\r' +
            '2、容易误判的情况（以下判断结果应为“没搜到，去录题”）：' +
            '①题型不同、选项不同、所挖的空不同：这些方面只要有所不同，即便看起来搜到的结果能解决问题，也都归为“没搜到，去录题”\r' +
            '②解题相关的条件变化：尤其要注意如数字等一些细节方面与解题相关的条件的不同（可能题目大体看上去没有不同），这些不同对解题及答案有影响，此类归为“没搜到，去录题” \r' +
            '③检索到的题目“小于”给出的题目：即检索到的题目与给出的题目不完全匹配，或是部分相交，这种情况都算做“没搜到，去录题”\r' +
            '例：一道选择题，题干内容一样，截图是四个选项，检索到的题是三个选项，则判为“没搜到，去录题”',
        SEARCH_STANDARD: '有好题，不用录\r' +
            '1、判断依据：检索结果要与给出题目的题型、题目条件、问题都一致。\r' +
            '2、容易误判的情况（以下判断结果应为“没搜到，去录题”）：\r' +
            '①与解题无关的内容不一样：但本质上是同一道题；如：人、物名称，无关描述等，这些内容虽然不同，但本质上仍是同一道题，归为”搜到“。\r' +
            '②搜到的题目“大于”给出的题目：即搜到的题目包含了给出的题目，归为“搜到”\r' +
            '③选项都相同但位置不同：题目问题选项都一样，就选项位置不一样，归为“搜到”\r' +
            '④问法不同，但问题本质，即意思一样：只要是同样的问题，本质上仍是同一道题，归为“搜到”\r' +
            '特殊情况\r' +
            '1、有些题有解析，没写答案属于好题还是差题？——如果答案在解析里且答案处写了“见解析”等字眼，判为“有好题，不用录”，否则判为差题\r' +
            '2、题目一样，图不一样，那这种属于没搜到还是好题？——看图会不会影响到整个题目，影响到的话为差题，否则为好题\r' +
            '3、一道题检索到的只有不相关的信息，例如只有第6章公式题目标题，其他的没有，这种情况属于好题还是怎么处理？——属于切题失误，判为“有好题不用录”\r' +
            '4、像排版比较乱的，不仔细看分不清楚哪行，但是仔细看又能接着做题属于好题还是差题。——不影响做题都可以判为好题，出现大量公式错误则判为差题\r' +
            '5、有些题目检索出来的配图很大——只要不影响到做题，判为好题，影响到做题的，判为差题\r' +
            '6、选项重复一遍，但不影响做题属于好题吗？——好题\r' +
            '7、检索结果有的出现带框框的数字或公式，这种属于差题吗？——排版杂乱无法阅读属于差题',
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

    EDIT_PAGE: '#app > div > div.main-content > div > div',
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
    CHECK:  {
        QUESTION_CON: '#app > div > div.main-content > div > div > div.edit-con > div.update-con',
        QUESTION_BOX: '#app > div > div.main-content > div > div > div:nth-child(5)',
        ANSWER_BOX: '#app > div > div.main-content > div > div > div:nth-child(6)',
    },
    FINALCHECK: {
        QUESTION_BOX: '#app > div > div.main-content > div > div > div:nth-child(5)',
        ANSWER_BOX: '#app > div > div.main-content > div > div > div:nth-child(6)',
    },
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
    GET_TASK: BASEURL + '/editsys/task/receive?tasktype={tasktype}&subject={subject}&education={education}',
    GET_TASK_REMAIN: BASEURL + '/editsys/task/remain?subject={subject}&education={education}',
    GET_MY_TASK: BASEURL + '/editsys/task/mine?pageno={pageno}',
    GET_TASK_SQUARE: BASEURL + '/editsys/task/square',
    GET_PROFILE: BASEURL + '/editsys/user/profile',
    UPLOAD_IMAGE: BASEURL + '/editsys/ueditor/config?action=uploadimage',
    OCR: BASEURL + '/editsys/ocr',
    QUESTION: BASEURL + '/editsys/question?id={id}',
    SHAREQQ: 'http://connect.qq.com/widget/shareqq/index.html?{params}',
    getRandomImg: function(){
        const n = Math.floor(Math.random()*(123-1+1)+1)
        return 'http://pde64pw8u.bkt.clouddn.com/image/random/png/{n}.png'.format({n:n})
    },
    VER: 'https://raw.githubusercontent.com/jacktsui/xusqa/master/ver.json',
}
//<------ strings end.

const UI = {
    scope_dom: {
        nav: '#app > div > div.nav-wrap',
        header: '#app > div > div.main-content > div > header',
        UserCenter: '#app > div > div.main-content > div > div',
        check: '#app > div > div.main-content > div > div',
        //QuestionJudge: '#app > div > div.main-content > div > div',
    },
    css_scope: S.hasOwnProperty('xusqa_ui') ? JSON.parse(S.xusqa_ui) : {},
    setScope(name, el){
        el = el || $(this.scope_dom[name])[0]
        const value = el.attributes[0].name.match(/[0-9a-z]{8}/)[0]
        if (this.css_scope[name] !== value){
            this.css_scope[name] = value
            S.xusqa_ui = JSON.stringify(this.css_scope)
        }
    },
}

const TPL = {
    CONFIG_MAIN: '<div id="xusqa_div_config" style="position: absolute;left: 604px;z-index: 9999;width: 352px;' +
        'background-color: var(--navbgcolor);box-shadow: var(--navbgcolor) 3px 0px 15px;display: none;margin-top: 20px;">' +
        '<div style="width: 0px;top: -30px;z-index: 1000;left: 76px;position: absolute;height: 0px;border-width: 18px;' +
        'border-style: solid;border-color: transparent transparent var(--navbgcolor) transparent;"></div>' +
        '<span style="color: white;">调整一键领取任务顺序，用逗号分隔</span>' +
        '<textarea rows="5" cols="1000" style=" font-size: 16px; width: 92%; overflow:hidden; resize:none;"></textarea>' +
        '<div style="text-align: left;padding-left: 8px;font-size: 14px;">' +
        //'<input type="checkbox" id="xusqa_showHint" checked="checked" name="showHint" title="显示助手提示" style="width: 16px;height: 16px;vertical-align: middle;display: inline-block;margin-bottom: 6px;">' +
        //'<label for="xusqa_showHint">显示助手提示</label>' +
        '<a data-v-'+UI.css_scope.header+' href="javascript:void(0);" class="exit header-btn" style="float: right; margin: 0px 12px 10px 20px; padding: 6px 20px 6px 20px;" title="全部清空后点确定,将重新加载所有有价格的科目.">确定</a></div>',
    CONFIG_BUTTON: '<a data-v-'+UI.css_scope.header+' id="xusqa_div_config_button" href="javascript:void(0);" class="exit header-btn" style="margin-left: 1px; padding: 6px 3px;">┇</a>',
    SNAP_QUESTION_HINT: '<span style="margin-left: 266px;display:inline-block;color: #f56c6c;border-right: 1px solid #f56c6c;padding: 5px;border-top: 1px solid #f56c6c;">助手提示: 在下面题目图片上可以直接框选截图哦</span>',
    SNAP_QUESTION_BUTTON: '<a href="javascript:;" class="xusqa-btn" title="助手提示: 框选以后可以点我直接截图" style="display: inline-block;float: right;background-color: #f78989;color: white;font-size: 16px;width: 60px;text-align: center;position: absolute;left: 561px;top: 324px;">截图</a>',
    GLASS: '<canvas " width="100px" height="100px" style="position: absolute;top: 0px;left: 0px;z-index: 9527;border: 1px solid #67c23a;border-radius: 10px; box-shadow: 0 3px 15px #67c23a;"></canvas>',
    LOCATE_ANSWER: '<a href="javascript:;" class="xusqa-btn" style="margin-left: 30px;display: inline-block;padding: 3px 10px;border: 1px solid #c0c4cc;border-radius: 3px;color: #606266;font-size: 13px;background-color: white;" title="{title}">{text}<a/>',
    SQUARE_UPDATE: '<div id="xusqa-square-update" class="process-task-con">最后刷新时间：<a  style="padding: 0px 10px;color: #f93e53;" >　刚刚　</a><a href="javascript:;" class="xusqa-a-button xusqa-btn">　刷新　</a><a href="javascript:;" class="xusqa-a-button xusqa-btn">分享到QQ</a></div>',
    SQUARE_ROLE: '<a href="javascript:;" class="xusqa-a-button xusqa-btn">{role}</a>',
    JUDGE_RULE_A: '<a href="https://note.youdao.com/share/?id=d98298a63e8656ab277278f5c51efe70&amp;type=note#/" target="_blank" style="text-decoration: underline;color: #00a2d4;display: block;">查看判题规则</a>',
    JUDGE_REFRESH: '<a href="javascript:;" class="xu-img-under-full-btn" title="助手提示: 检索空白或者乱码刷新" style="width: 99%;">快速刷新</a>',
    //JUDGE_FIX: '<a href="javascript:;" class="xu-img-under-full-btn" style="width: 19%;">临时修复空白bug</a>',
    EDIT_PAGE_SAVE: '<a href="javascript:;" class="xu-img-under-btn xusqa-btn" title="助手提示: 录题过程中可以临时保存当前录入内容，防止丢失">暂存题目</a>',
    EDIT_PAGE_RESTORE: '<a href="javascript:;" class="xu-img-under-btn xusqa-btn" style="background-color: gray;" title="助手提示: 恢复为最后一次保存时的状态">恢复题目</a>',
    EDIT_PAGE_SAVE_SAMPLE: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;float: right" title="助手提示: 收集样本,帮助作者优化一键整理,一定要在整理前收集">收集样本</a>',
    EDIT_PAGE_CLEAR_KNOWLEDGE: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;float: right;" title="助手提示：清除无关知识点,下次同一任务的将会自动清除">清除</a>',
    EDIT_PAGE_MOVETO_ANALYSIS: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;float: right;" title="助手提示：将答案内容快速移动到解析">⇩</a>',
    EDIT_PAGE_PICKUP: '<a href="javascript:;" style="color: #337ab7;font-size: 16px;margin-left: 16px;" title="助手提示：从解析中快速提取答案、点评和知识点">⇵</a>',
    OPTIONS:'<div data-v-'+UI.css_scope.UserCenter+' class="list-item"><div data-v-'+UI.css_scope.UserCenter+' class="item-title">助手配置({ver})</div></div>',
    OPTIONS_SWITCH: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">{title}</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><input class="switch switch-anim" type="checkbox" checked /></div></div></div>',
    OPTIONS_NUMBER: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">{title}</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><input class="options-number" type="number" min="{min}" max="{max}" step="{step}" title="{hint}" /></div></div></div>',
    OPTIONS_BUTTON: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">{title}</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><button data-v-'+UI.css_scope.UserCenter+' type="button" class="el-button el-button--info el-button--small options-button"><span>{text}</span></button></div></div></div>',
    OPTIONS_INPUTBUTTON: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">{title}</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><input readonly="readonly" style="width: 232px;margin-right: 10px;"><button data-v-'+UI.css_scope.UserCenter+' type="button" class="el-button el-button--info el-button--small options-button"><span>{text}</span></button></div></div></div>',
    OPTIONS_SEPARATE: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><hr class="options-hr"></div></div>',
    OPTIONS_MANUAL: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">使用手册</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><a target="_blank" href="https://github.com/jacktsui/xusqa/blob/master/manual/README.md" style="text-decoration: underline;color: #00a2d4;">查看使用手册</a></div></div></div>',
    OPTIONS_COPYRIGHT: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">脚本作者</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value">© 2018, 徐。355088586@qq.com</div></div></div>',
    OPTIONS_XUSQA: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">主脚本 版本 {ver}</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><a target="_blank" href="https://github.com/jacktsui/xusqa/raw/master/xusqa.user.js" style="text-decoration: underline;color: #00a2d4;">正在检查更新</a></div></div></div>',
    OPTIONS_XUSQA_KFE: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">公式脚本 版本 {ver_kfe}</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><span style="width: 160px;font-size: 10px;color: #f56c6c;word-break: break-word;display: inline-block;text-align: left;">注:部分用户如出现“公式编辑器无法编辑”的问题,请禁用或删除此脚本.</span><a target="_blank" href="https://github.com/jacktsui/xusqa/raw/master/xusqa.kfe.user.js" style="text-decoration: underline;color: #00a2d4;">正在检查更新</a></div></div></div>',
    //OPTIONS_XUSQA_KFE: '<div data-v-'+UI.css_scope.UserCenter+' class="item-cell-con"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell"><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-title">公式脚本 版本 {ver_kfe}</div><div data-v-'+UI.css_scope.UserCenter+' class="item-cell-value"><a style="font-size: 10px;text-decoration: underline;color: #f56c6c;">因存在未知问题,临时下架</a></div></div></div>',
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

    get showJudgeHint(){
        return this.opts.hasOwnProperty('showJudgeHint') && this.opts.showJudgeHint
    },
    set showJudgeHint(b){
        if (typeof(b) === 'boolean'){
            this.setOptions('showJudgeHint', b)
        } else {
            C.error('设置是否在判题界面显示判题规则提示, true 或者 false')
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

    get passport(){
        return this.opts.hasOwnProperty('passport') && this.opts.passport
    },

    set passport(pass){
        this.setOptions('passport', pass)
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
        return this.opts.hasOwnProperty('crazyMode') && this.opts.crazyMode
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
        return this.opts.hasOwnProperty('epColor') ? this.opts.epColor : 0
    },
    set epColor(index){
        if (index >=0 && index < EPCOLOR.length){
            this.setOptions('epColor', index)
        } else {
            C.log('数值无效,设置护眼色,序号 0-'+(EPCOLOR.length-1))
        }
    },

    get epNavBg(){
        return this.opts.hasOwnProperty('epNavBg') && this.opts.epNavBg ? this.opts.epNavBg : '#606266 url(http://pde64pw8u.bkt.clouddn.com/j.jpg) no-repeat bottom'
    },
    set epNavBg(bg){
        this.setOptions('epNavBg', bg)
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

    get showQInputProgress(){
        return this.opts.hasOwnProperty('showQInputProgress') && this.opts.showQInputProgress
    },

    set showQInputProgress(b){
        if (typeof(b) === 'boolean'){
            this.setOptions('showQInputProgress', b)
        } else {
            C.error('设置是否显示录题进度, true 或者 false')
        }
    },

    get role(){
        return this.opts.hasOwnProperty('role') ? this.opts.role : '题目录入'
    },
    set role(role){
        this.setOptions('role', role)
    },

    get forceShowPreAcc(){
        return this.opts.hasOwnProperty('forceShowPreAcc') ? this.opts.forceShowPreAcc : this.crazyMode
    },
    set forceShowPreAcc(b){
        this.setOptions('forceShowPreAcc', b)
    },

    get optimizeQJudgeShow(){
        return this.opts.hasOwnProperty('optimizeQJudgeShow') && this.opts.optimizeQJudgeShow
    },
    set optimizeQJudgeShow(b){
        this.setOptions('optimizeQJudgeShow', b)
    }
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
        username: undefined,
        qqnumber: undefined,
        permission: null,
        isValidSN: O.passport,
    },
    timer:{}, // 用来统一存放计时器,用于清理计时器,目前没有做特别处理
    squareUpdateTime: new Date(), // 任务广场最后更新时间
    startLoginTime: new Date(), // 记录等待登录开始时间
    simpleSubject: undefined, // 记录提取的样本的subject
    manage: false,
    role: undefined,
};

/*
 * imgAreaSelect jQuery plugin
 * version 0.9.10
 *
 * Copyright (c) 2008-2013 Michal Wojciechowski (odyniec.net)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://odyniec.net/projects/imgareaselect/
 *
 */
/* jshint ignore:start */
(function($) {

var abs = Math.abs,
    max = Math.max,
    min = Math.min,
    round = Math.round;

function div() {
    return $('<div/>');
}

$.imgAreaSelect = function (img, options) {
    var

        $img = $(img),

        imgLoaded,

        $box = div(),
        $area = div(),
        $border = div().add(div()).add(div()).add(div()),
        $outer = div().add(div()).add(div()).add(div()),
        $handles = $([]),

        $areaOpera,

        left, top,

        imgOfs = { left: 0, top: 0 },

        imgWidth, imgHeight,

        $parent,

        parOfs = { left: 0, top: 0 },

        zIndex = 0,

        position = 'absolute',

        startX, startY,

        scaleX, scaleY,

        resize,

        minWidth, minHeight, maxWidth, maxHeight,

        aspectRatio,

        shown,

        x1, y1, x2, y2,

        selection = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 },

        docElem = document.documentElement,

        ua = navigator.userAgent,

        $p, d, i, o, w, h, adjusted;

    function viewX(x) {
        return x + imgOfs.left - parOfs.left;
    }

    function viewY(y) {
        return y + imgOfs.top - parOfs.top;
    }

    function selX(x) {
        return x - imgOfs.left + parOfs.left;
    }

    function selY(y) {
        return y - imgOfs.top + parOfs.top;
    }

    function evX(event) {
        return event.pageX - parOfs.left;
    }

    function evY(event) {
        return event.pageY - parOfs.top;
    }

    function getSelection(noScale) {
        var sx = noScale || scaleX, sy = noScale || scaleY;

        return { x1: round(selection.x1 * sx),
            y1: round(selection.y1 * sy),
            x2: round(selection.x2 * sx),
            y2: round(selection.y2 * sy),
            width: round(selection.x2 * sx) - round(selection.x1 * sx),
            height: round(selection.y2 * sy) - round(selection.y1 * sy) };
    }

    function setSelection(x1, y1, x2, y2, noScale) {
        var sx = noScale || scaleX, sy = noScale || scaleY;

        selection = {
            x1: round(x1 / sx || 0),
            y1: round(y1 / sy || 0),
            x2: round(x2 / sx || 0),
            y2: round(y2 / sy || 0)
        };

        selection.width = selection.x2 - selection.x1;
        selection.height = selection.y2 - selection.y1;
    }

    function adjust() {
        if (!imgLoaded || !$img.width())
            return;

        imgOfs = { left: round($img.offset().left), top: round($img.offset().top) };

        imgWidth = $img.innerWidth();
        imgHeight = $img.innerHeight();

        imgOfs.top += ($img.outerHeight() - imgHeight) >> 1;
        imgOfs.left += ($img.outerWidth() - imgWidth) >> 1;

        minWidth = round(options.minWidth / scaleX) || 0;
        minHeight = round(options.minHeight / scaleY) || 0;
        maxWidth = round(min(options.maxWidth / scaleX || 1<<24, imgWidth));
        maxHeight = round(min(options.maxHeight / scaleY || 1<<24, imgHeight));

        if ($().jquery == '1.3.2' && position == 'fixed' &&
            !docElem['getBoundingClientRect'])
        {
            imgOfs.top += max(document.body.scrollTop, docElem.scrollTop);
            imgOfs.left += max(document.body.scrollLeft, docElem.scrollLeft);
        }

        parOfs = /absolute|relative/.test($parent.css('position')) ?
            { left: round($parent.offset().left) - $parent.scrollLeft(),
                top: round($parent.offset().top) - $parent.scrollTop() } :
            position == 'fixed' ?
                { left: $(document).scrollLeft(), top: $(document).scrollTop() } :
                { left: 0, top: 0 };

        left = viewX(0);
        top = viewY(0);

        if (selection.x2 > imgWidth || selection.y2 > imgHeight)
            doResize();
    }

    function update(resetKeyPress) {
        if (!shown) return;

        $box.css({ left: viewX(selection.x1), top: viewY(selection.y1) })
            .add($area).width(w = selection.width).height(h = selection.height);

        $area.add($border).add($handles).css({ left: 0, top: 0 });

        $border
            .width(max(w - $border.outerWidth() + $border.innerWidth(), 0))
            .height(max(h - $border.outerHeight() + $border.innerHeight(), 0));

        $($outer[0]).css({ left: left, top: top,
            width: selection.x1, height: imgHeight });
        $($outer[1]).css({ left: left + selection.x1, top: top,
            width: w, height: selection.y1 });
        $($outer[2]).css({ left: left + selection.x2, top: top,
            width: imgWidth - selection.x2, height: imgHeight });
        $($outer[3]).css({ left: left + selection.x1, top: top + selection.y2,
            width: w, height: imgHeight - selection.y2 });

        w -= $handles.outerWidth();
        h -= $handles.outerHeight();

        switch ($handles.length) {
        case 8:
            $($handles[4]).css({ left: w >> 1 });
            $($handles[5]).css({ left: w, top: h >> 1 });
            $($handles[6]).css({ left: w >> 1, top: h });
            $($handles[7]).css({ top: h >> 1 });
        case 4:
            $handles.slice(1,3).css({ left: w });
            $handles.slice(2,4).css({ top: h });
        }

        if (resetKeyPress !== false) {
            if ($.imgAreaSelect.onKeyPress != docKeyPress)
                $(document).unbind($.imgAreaSelect.keyPress,
                    $.imgAreaSelect.onKeyPress);

            if (options.keys)
                $(document)[$.imgAreaSelect.keyPress](
                    $.imgAreaSelect.onKeyPress = docKeyPress);
        }

        if (msie && $border.outerWidth() - $border.innerWidth() == 2) {
            $border.css('margin', 0);
            setTimeout(function () { $border.css('margin', 'auto'); }, 0);
        }
    }

    function doUpdate(resetKeyPress) {
        adjust();
        update(resetKeyPress);
        x1 = viewX(selection.x1); y1 = viewY(selection.y1);
        x2 = viewX(selection.x2); y2 = viewY(selection.y2);
    }

    function hide($elem, fn) {
        options.fadeSpeed ? $elem.fadeOut(options.fadeSpeed, fn) : $elem.hide();

    }

    function areaMouseMove(event) {
        var x = selX(evX(event)) - selection.x1,
            y = selY(evY(event)) - selection.y1;

        if (!adjusted) {
            adjust();
            adjusted = true;

            $box.one('mouseout', function () { adjusted = false; });
        }

        resize = '';

        if (options.resizable) {
            if (y <= options.resizeMargin)
                resize = 'n';
            else if (y >= selection.height - options.resizeMargin)
                resize = 's';
            if (x <= options.resizeMargin)
                resize += 'w';
            else if (x >= selection.width - options.resizeMargin)
                resize += 'e';
        }

        $box.css('cursor', resize ? resize + '-resize' :
            options.movable ? 'move' : '');
        if ($areaOpera)
            $areaOpera.toggle();
    }

    function docMouseUp(event) {
        $('body').css('cursor', '');
        if (options.autoHide || selection.width * selection.height == 0)
            hide($box.add($outer), function () { $(this).hide(); });

        $(document).unbind('mousemove', selectingMouseMove);
        $box.mousemove(areaMouseMove);

        options.onSelectEnd(img, getSelection());
    }

    function areaMouseDown(event) {
        if (event.which != 1) return false;

        adjust();

        if (resize) {
            $('body').css('cursor', resize + '-resize');

            x1 = viewX(selection[/w/.test(resize) ? 'x2' : 'x1']);
            y1 = viewY(selection[/n/.test(resize) ? 'y2' : 'y1']);

            $(document).mousemove(selectingMouseMove)
                .one('mouseup', docMouseUp);
            $box.unbind('mousemove', areaMouseMove);
        }
        else if (options.movable) {
            startX = left + selection.x1 - evX(event);
            startY = top + selection.y1 - evY(event);

            $box.unbind('mousemove', areaMouseMove);

            $(document).mousemove(movingMouseMove)
                .one('mouseup', function () {
                    options.onSelectEnd(img, getSelection());

                    $(document).unbind('mousemove', movingMouseMove);
                    $box.mousemove(areaMouseMove);
                });
        }
        else
            $img.mousedown(event);

        return false;
    }

    function fixAspectRatio(xFirst) {
        if (aspectRatio)
            if (xFirst) {
                x2 = max(left, min(left + imgWidth,
                    x1 + abs(y2 - y1) * aspectRatio * (x2 > x1 || -1)));

                y2 = round(max(top, min(top + imgHeight,
                    y1 + abs(x2 - x1) / aspectRatio * (y2 > y1 || -1))));
                x2 = round(x2);
            }
            else {
                y2 = max(top, min(top + imgHeight,
                    y1 + abs(x2 - x1) / aspectRatio * (y2 > y1 || -1)));
                x2 = round(max(left, min(left + imgWidth,
                    x1 + abs(y2 - y1) * aspectRatio * (x2 > x1 || -1))));
                y2 = round(y2);
            }
    }

    function doResize() {
        x1 = min(x1, left + imgWidth);
        y1 = min(y1, top + imgHeight);

        if (abs(x2 - x1) < minWidth) {
            x2 = x1 - minWidth * (x2 < x1 || -1);

            if (x2 < left)
                x1 = left + minWidth;
            else if (x2 > left + imgWidth)
                x1 = left + imgWidth - minWidth;
        }

        if (abs(y2 - y1) < minHeight) {
            y2 = y1 - minHeight * (y2 < y1 || -1);

            if (y2 < top)
                y1 = top + minHeight;
            else if (y2 > top + imgHeight)
                y1 = top + imgHeight - minHeight;
        }

        x2 = max(left, min(x2, left + imgWidth));
        y2 = max(top, min(y2, top + imgHeight));

        fixAspectRatio(abs(x2 - x1) < abs(y2 - y1) * aspectRatio);

        if (abs(x2 - x1) > maxWidth) {
            x2 = x1 - maxWidth * (x2 < x1 || -1);
            fixAspectRatio();
        }

        if (abs(y2 - y1) > maxHeight) {
            y2 = y1 - maxHeight * (y2 < y1 || -1);
            fixAspectRatio(true);
        }

        selection = { x1: selX(min(x1, x2)), x2: selX(max(x1, x2)),
            y1: selY(min(y1, y2)), y2: selY(max(y1, y2)),
            width: abs(x2 - x1), height: abs(y2 - y1) };

        update();

        options.onSelectChange(img, getSelection());
    }

    function selectingMouseMove(event) {
        x2 = /w|e|^$/.test(resize) || aspectRatio ? evX(event) : viewX(selection.x2);
        y2 = /n|s|^$/.test(resize) || aspectRatio ? evY(event) : viewY(selection.y2);

        doResize();

        return false;

    }

    function doMove(newX1, newY1) {
        x2 = (x1 = newX1) + selection.width;
        y2 = (y1 = newY1) + selection.height;

        $.extend(selection, { x1: selX(x1), y1: selY(y1), x2: selX(x2),
            y2: selY(y2) });

        update();

        options.onSelectChange(img, getSelection());
    }

    function movingMouseMove(event) {
        x1 = max(left, min(startX + evX(event), left + imgWidth - selection.width));
        y1 = max(top, min(startY + evY(event), top + imgHeight - selection.height));

        doMove(x1, y1);

        event.preventDefault();

        return false;
    }

    function startSelection() {
        $(document).unbind('mousemove', startSelection);
        adjust();

        x2 = x1;
        y2 = y1;

        doResize();

        resize = '';

        if (!$outer.is(':visible'))
            $box.add($outer).hide().fadeIn(options.fadeSpeed||0);

        shown = true;

        $(document).unbind('mouseup', cancelSelection)
            .mousemove(selectingMouseMove).one('mouseup', docMouseUp);
        $box.unbind('mousemove', areaMouseMove);

        options.onSelectStart(img, getSelection());
    }

    function cancelSelection() {
        $(document).unbind('mousemove', startSelection)
            .unbind('mouseup', cancelSelection);
        hide($box.add($outer));

        setSelection(selX(x1), selY(y1), selX(x1), selY(y1));

        if (!(this instanceof $.imgAreaSelect)) {
            options.onSelectChange(img, getSelection());
            options.onSelectEnd(img, getSelection());
        }
    }

    function imgMouseDown(event) {
        if (event.which != 1 || $outer.is(':animated')) return false;

        adjust();
        startX = x1 = evX(event);
        startY = y1 = evY(event);

        $(document).mousemove(startSelection).mouseup(cancelSelection);

        return false;
    }

    function windowResize() {
        doUpdate(false);
    }

    function imgLoad() {
        imgLoaded = true;

        setOptions(options = $.extend({
            classPrefix: 'imgareaselect',
            movable: true,
            parent: 'body',
            resizable: true,
            resizeMargin: 10,
            onInit: function () {},
            onSelectStart: function () {},
            onSelectChange: function () {},
            onSelectEnd: function () {}
        }, options));

        $box.add($outer).css({ visibility: '' });

        if (options.show) {
            shown = true;
            adjust();
            update();
            $box.add($outer).hide().fadeIn(options.fadeSpeed||0);
        }

        setTimeout(function () { options.onInit(img, getSelection()); }, 0);
    }

    var docKeyPress = function(event) {
        var k = options.keys, d, t, key = event.keyCode;

        d = !isNaN(k.alt) && (event.altKey || event.originalEvent.altKey) ? k.alt :
            !isNaN(k.ctrl) && event.ctrlKey ? k.ctrl :
            !isNaN(k.shift) && event.shiftKey ? k.shift :
            !isNaN(k.arrows) ? k.arrows : 10;

        if (k.arrows == 'resize' || (k.shift == 'resize' && event.shiftKey) ||
            (k.ctrl == 'resize' && event.ctrlKey) ||
            (k.alt == 'resize' && (event.altKey || event.originalEvent.altKey)))
        {
            switch (key) {
            case 37:
                d = -d;
            case 39:
                t = max(x1, x2);
                x1 = min(x1, x2);
                x2 = max(t + d, x1);
                fixAspectRatio();
                break;
            case 38:
                d = -d;
            case 40:
                t = max(y1, y2);
                y1 = min(y1, y2);
                y2 = max(t + d, y1);
                fixAspectRatio(true);
                break;
            default:
                return;
            }

            doResize();
        }
        else {
            x1 = min(x1, x2);
            y1 = min(y1, y2);

            switch (key) {
            case 37:
                doMove(max(x1 - d, left), y1);
                break;
            case 38:
                doMove(x1, max(y1 - d, top));
                break;
            case 39:
                doMove(x1 + min(d, imgWidth - selX(x2)), y1);
                break;
            case 40:
                doMove(x1, y1 + min(d, imgHeight - selY(y2)));
                break;
            default:
                return;
            }
        }

        return false;
    };

    function styleOptions($elem, props) {
        for (var option in props)
            if (options[option] !== undefined)
                $elem.css(props[option], options[option]);
    }

    function setOptions(newOptions) {
        if (newOptions.parent)
            ($parent = $(newOptions.parent)).append($box.add($outer));

        $.extend(options, newOptions);

        adjust();

        if (newOptions.handles != null) {
            $handles.remove();
            $handles = $([]);

            i = newOptions.handles ? newOptions.handles == 'corners' ? 4 : 8 : 0;

            while (i--)
                $handles = $handles.add(div());

            $handles.addClass(options.classPrefix + '-handle').css({
                position: 'absolute',
                fontSize: 0,
                zIndex: zIndex + 1 || 1
            });

            if (!parseInt($handles.css('width')) >= 0)
                $handles.width(5).height(5);

            if (o = options.borderWidth)
                $handles.css({ borderWidth: o, borderStyle: 'solid' });

            styleOptions($handles, { borderColor1: 'border-color',
                borderColor2: 'background-color',
                borderOpacity: 'opacity' });
        }

        scaleX = options.imageWidth / imgWidth || 1;
        scaleY = options.imageHeight / imgHeight || 1;

        if (newOptions.x1 != null) {
            setSelection(newOptions.x1, newOptions.y1, newOptions.x2,
                newOptions.y2);
            newOptions.show = !newOptions.hide;
        }

        if (newOptions.keys)
            options.keys = $.extend({ shift: 1, ctrl: 'resize' },
                newOptions.keys);

        $outer.addClass(options.classPrefix + '-outer');
        $area.addClass(options.classPrefix + '-selection');
        for (i = 0; i++ < 4;)
            $($border[i-1]).addClass(options.classPrefix + '-border' + i);

        styleOptions($area, { selectionColor: 'background-color',
            selectionOpacity: 'opacity' });
        styleOptions($border, { borderOpacity: 'opacity',
            borderWidth: 'border-width' });
        styleOptions($outer, { outerColor: 'background-color',
            outerOpacity: 'opacity' });
        if (o = options.borderColor1)
            $($border[0]).css({ borderStyle: 'solid', borderColor: o });
        if (o = options.borderColor2)
            $($border[1]).css({ borderStyle: 'dashed', borderColor: o });

        $box.append($area.add($border).add($areaOpera)).append($handles);

        if (msie) {
            if (o = ($outer.css('filter')||'').match(/opacity=(\d+)/))
                $outer.css('opacity', o[1]/100);
            if (o = ($border.css('filter')||'').match(/opacity=(\d+)/))
                $border.css('opacity', o[1]/100);
        }

        if (newOptions.hide)
            hide($box.add($outer));
        else if (newOptions.show && imgLoaded) {
            shown = true;
            $box.add($outer).fadeIn(options.fadeSpeed||0);
            doUpdate();
        }

        aspectRatio = (d = (options.aspectRatio || '').split(/:/))[0] / d[1];

        $img.add($outer).unbind('mousedown', imgMouseDown);

        if (options.disable || options.enable === false) {
            $box.unbind('mousemove', areaMouseMove).unbind('mousedown', areaMouseDown);
            $(window).unbind('resize', windowResize);
        }
        else {
            if (options.enable || options.disable === false) {
                if (options.resizable || options.movable)
                    $box.mousemove(areaMouseMove).mousedown(areaMouseDown);

                $(window).resize(windowResize);
            }

            if (!options.persistent)
                $img.add($outer).mousedown(imgMouseDown);
        }

        options.enable = options.disable = undefined;
    }

    this.remove = function () {
        setOptions({ disable: true });
        $box.add($outer).remove();
    };

    this.getOptions = function () { return options; };

    this.setOptions = setOptions;

    this.getSelection = getSelection;

    this.setSelection = setSelection;

    this.cancelSelection = cancelSelection;

    this.update = doUpdate;

    var msie = (/msie ([\w.]+)/i.exec(ua)||[])[1],
        opera = /opera/i.test(ua),
        safari = /webkit/i.test(ua) && !/chrome/i.test(ua);

    $p = $img;

    while ($p.length) {
        zIndex = max(zIndex,
            !isNaN($p.css('z-index')) ? $p.css('z-index') : zIndex);
        if ($p.css('position') == 'fixed')
            position = 'fixed';

        $p = $p.parent(':not(body)');
    }

    zIndex = options.zIndex || zIndex;

    if (msie)
        $img.attr('unselectable', 'on');

    $.imgAreaSelect.keyPress = msie || safari ? 'keydown' : 'keypress';

    if (opera)

        $areaOpera = div().css({ width: '100%', height: '100%',
            position: 'absolute', zIndex: zIndex + 2 || 2 });

    $box.add($outer).css({ visibility: 'hidden', position: position,
        overflow: 'hidden', zIndex: zIndex || '0' });
    $box.css({ zIndex: zIndex + 2 || 2 });
    $area.add($border).css({ position: 'absolute', fontSize: 0 });

    img.complete || img.readyState == 'complete' || !$img.is('img') ?
        imgLoad() : $img.one('load', imgLoad);

    if (!imgLoaded && msie && msie >= 7)
        img.src = img.src;
};

$.fn.imgAreaSelect = function (options) {
    options = options || {};

    this.each(function () {
        if ($(this).data('imgAreaSelect')) {
            if (options.remove) {
                $(this).data('imgAreaSelect').remove();
                $(this).removeData('imgAreaSelect');
            }
            else
                $(this).data('imgAreaSelect').setOptions(options);
        }
        else if (!options.remove) {
            if (options.enable === undefined && options.disable === undefined)
                options.enable = true;

            $(this).data('imgAreaSelect', new $.imgAreaSelect(this, options));
        }
    });

    if (options.instance)
        return $(this).data('imgAreaSelect');

    return this;
};

})(jQuery);

/* jshint ignore:end */

function extend(){
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
}
extend()

/**
 * util 与项目无关的公共函数
 */
const util = {
    cmt: function(f) {
        return f.toString().replace(/^[\s\S]*\/\*.*/, '').replace(/.*\*\/[\s\S]*$/, '').replace(/\r\n|\r|\n/g, '\n').format({
            nav: UI.css_scope.nav,
            header: UI.css_scope.header,
            UserCenter: UI.css_scope.UserCenter,
            answerInPage: UI.css_scope.answerInPage,
            questionInPage: UI.css_scope.questionInPage,
            check: UI.css_scope.check,
            QuestionJudge: UI.css_scope.QuestionJudge})
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

    timeAgo: function(milliseconds){
        const ago = [
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
        ]
        const sec = milliseconds/1000
        for(let i of ago){
            if (sec >= i[0]){
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

    binarySearch: function(arr, target) {
        let s = 0;
        let e = arr.length - 1;
        let m = Math.floor((s + e) / 2);
        let sortTag = arr[s] <= arr[e];
        //确定排序顺序

        while (s < e && arr[m] !== target) {
            if (arr[m] > target) {
                if (sortTag) {
                    e = m - 1
                } else {
                    s = m + 1
                }
            } else {
                if (sortTag) {
                    s = m + 1
                } else {
                    e = m - 1
                }
            }
            m = Math.floor((s + e) / 2);
        }

        if (arr[m] == target) {
            return true
        } else {
            return false
        }
    },

    progress(pos, max){
        pos = pos > max ? max : pos
        pos = pos < 0 ? 0 : pos
        return '正在汇总……<br/>' + new Array(pos).join('▮') + new Array(max-pos).join('▯')
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
        const v = stage.editPage.v
        return assort((v.data && v.data.subject) || v.subject)
    },

    getInputEducation: function(){
        const v = stage.editPage.v
        return v.data && v.data.education
    },

    getInputQuestionId: function(){
        const v = stage.editPage.v
        return v.data.id
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

    cloneButton: function(button, text, title){
        if (typeof(button) === 'string'){
            button = $(button)
        }
        return button.clone().addClass('xusqa-btn').text(text).attr('title', title)
    },

    getFirstDay: function(now){
        return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    },

    getPreMonthFirstDay: function(now){
        let y = now.getFullYear()
        let m = now.getMonth()
        if (m === 0){
            m = 11
            y -= 1
        } else {
            m -= 1
        }

        return new Date(y, m, 1).getTime()
    },

    getPre2MonthFirstDay: function(now){
        let y = now.getFullYear()
        let m = now.getMonth()
        if (m === 0){
            y -= 1
            m = 10
        } else if(m === 1){
            y -= 1
            m = 11
        } else{
            m -= 2
        }
        return new Date(y, m ,1).getTime()
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

    alternateRole: function(role){ //角色轮换
        if(role === '题目录入'){
            return '题目审核'
        } else if(role === '题目审核'){
            return '图片裁切'
        } else{
            return '题目录入'
        }
    },

    sn2num: function(sn){
        for(let i in DIC.SN){
            if (DIC.SN[i] === sn){
                return i
            }
        }
        return sn
    },
}

// css------>
function refreshNavImage(){
    function navTextStyle(on){
        if (on){
            if ($('#xusqa-nav-img').length){
                return
            }
            util.addStyle(util.cmt(function(){/*!CSS
                .list li a[data-v-{nav}] {
                    background: linear-gradient(30deg, #333, #fff);
                    -webkit-background-clip: text;
                    color: transparent;
                }
                .list li .router-link-active[data-v-{nav}] {
                    background: linear-gradient(30deg, #67c23a, #f56c6c);
                    -webkit-background-clip: text;
                    color: transparent;
                    text-shadow: 6px 6px 18px #ffffffdd;
                }
                .show-btn[data-v-{nav}] {
                    filter: invert(100%);
                }
                */
            }), 'xusqa-nav-img')
        } else {
            $('#xusqa-nav-img').remove()
        }
    }
    document.documentElement.style.setProperty('--bgcolor', EPCOLOR[O.epColor][1])
    document.documentElement.style.setProperty('--navbgcolor', O.epColor === 0 ? '#337ab7' : '#606266')
    if (O.navImage){
        navTextStyle(true)
        document.documentElement.style.setProperty('--navbg', '#606266 url(https://bing.ioliu.cn/v1/rand?w=180&h=1280)')
    } else {
        if (O.epColor === 0){
            document.documentElement.style.setProperty('--navbg', '#337ab7')
            navTextStyle(false)
        } else {
            navTextStyle(true)
            document.documentElement.style.setProperty('--navbg', O.epNavBg)
        }
    }
}

// 护眼色
util.addStyle(util.cmt(function(){/*!CSS
:root{
    --bgcolor: #FFFFFF;
    --navbg: #337ab7;
    --navbgcolor: #337ab7;
}
body {
    background-color: var(--bgcolor) !important;
}

.fixed-box_content[data-v-{answerInPage}] {
    background: var(--bgcolor);
}
.fixed-box_content[data-v-{questionInPage}] {
    background: var(--bgcolor);
}

.nav[data-v-{nav}] {
    background-color: var(--navbgcolor);
    box-shadow: 3px 0 15px var(--navbgcolor);
    background: var(--navbg);
}
header[data-v-{header}] {
    background: var(--navbgcolor);
    box-shadow: 0 3px 15px var(--navbgcolor);
}
*/
}))

// css 替换
util.addStyle(util.cmt(function(){/*!CSS
.search-result[data-v-{QuestionJudge}] {
    background: white;
}
#answerCutBox {
    top: 182px;
}

.box_min .region-con[data-v-{answerInPage}] {
    display: block;
}

.latex[data-v-{answerInPage}] {
    margin-right: 16px;
}

.submit-region[data-v-{answerInPage}] {
    overflow: hidden;
}

.latex[data-v-{questionInPage}] {
    margin-right: 16px;
}

.item-cell-title[data-v-{UserCenter}], .item-cell-value[data-v-{UserCenter}] {
    vertical-align: middle;
}
.update-con[data-v-{check}]{
    float: left;
    max-width: 649px;
}
*/
}))

if (O.optimizeQJudgeShow){
    util.addStyle(util.cmt(function(){/*!CSS
        .edit-page[data-v-{QuestionJudge}] {
            width: 900px;
        }
        .edit-con[data-v-{QuestionJudge}] {
            min-width: 902px;
        }
        .search-title[data-v-{QuestionJudge}] {
            width: 900px;
            min-width: 900px;
        }
        .search-result[data-v-{QuestionJudge}] {
            width: 870px;
            min-width: 870px;
            padding: 15px;
            background: var(--bgcolor);
        }
        .search-btns[data-v-{QuestionJudge}] {
            width: 900px;
        }
    }
*/
}))
}

// add css sheet to header, not comment
util.addStyle(util.cmt(function(){/*!CSS
.el-message {
    width: fit-content;
}
.el-message__content thead {
    border-bottom: 1px solid;
}
.el-message__content tfoot {
    border-top: 1px solid;
}
.el-message__content th {
    padding: 5px 5px;
    border: none;
}
.el-message__content td {
    padding: 5px 10px;
    border: none;
}
.el-message__content tbody tr:hover {
    background: #67c23a1d;
}
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

.xusqa-corner-a {
    position: absolute;
    top: -10px;
    left: 20px;
    width: 40px;
    text-align: center;
    color: white;
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

.switch {
    width: 57px;
    height: 28px;
    position: relative;
    border: 1px solid #cdcdcd;
    background-color: #dfdfdf;
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
    border-color: #3a8ee6;
    box-shadow: #fdfdfd 0 0 0 16px inset;
    background-color: #fdfdfd;
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
    box-shadow: #409eff 0 0 0 16px inset;
    background-color: #fdfdfd;
    transition: border ease 0.4s, box-shadow ease 0.4s, background-color ease 1.2s;
}
.switch.switch-anim:checked:before {
    transition: left 0.3s;
}
.options-number {
    width: 49px;
    margin: 3px 3px 3px 4px;
    border-radius: 3px;
    padding: 3px;
    border: 1px solid #cdcdcd;
}
.options-button {
    width: 57px;
    padding: 7px 9px;
    margin: 3px 4px 3px 4px;
}
.options-hr {
    margin: 0 auto;
    border: 0;
    height: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
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

.xu-img-under-btn {
    display: inline-block;
    float: right;
    background-color: #337ab7;
    color: white;
    font-size: 16px;
    padding: 2px 16px;
    margin-left: 16px;
}
.xu-img-under-full-btn {
    display: inline-block;
    background-color: rgba(0,0,0,.1);
    color: #337ab7;
    font-size: 16px;
    padding: 2px 0px;
    width: 99%;
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 3px;
}
.xu-btn-exit {
    color: #ccc;
    font-size: 12px;
    text-decoration: underline;
    margin-left: 6px;
}
*/
}))

/*
 * imgAreaSelect animated border style
 */
util.addStyle(util.cmt(function(){/*!CSS
.imgareaselect-border1 {
    background: url(data:image/gif;base64,R0lGODlhAQAGAKEAAP///wAAADY2Nv///yH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQACgD/ACwAAAAAAQAGAAACAxQuUgAh+QQBCgADACwAAAAAAQAGAAACA5SAUgAh+QQBCgADACwAAAAAAQAGAAACA5SBBQAh+QQBCgADACwAAAAAAQAGAAACA4QOUAAh+QQBCgADACwAAAAAAQAGAAACAwSEUAAh+QQBCgADACwAAAAAAQAGAAACA4SFBQA7) repeat-y left top;
}

.imgareaselect-border2 {
    background: url(data:image/gif;base64,R0lGODlhBgABAKEAAP///wAAADY2Nv///yH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQACgD/ACwAAAAABgABAAACAxQuUgAh+QQBCgADACwAAAAABgABAAACA5SAUgAh+QQBCgADACwAAAAABgABAAACA5SBBQAh+QQBCgADACwAAAAABgABAAACA4QOUAAh+QQBCgADACwAAAAABgABAAACAwSEUAAh+QQBCgADACwAAAAABgABAAACA4SFBQA7) repeat-x left top;
}

.imgareaselect-border3 {
    background: url(data:image/gif;base64,R0lGODlhAQAGAKEAAP///wAAADY2Nv///yH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQACgD/ACwAAAAAAQAGAAACAxQuUgAh+QQBCgADACwAAAAAAQAGAAACA5SAUgAh+QQBCgADACwAAAAAAQAGAAACA5SBBQAh+QQBCgADACwAAAAAAQAGAAACA4QOUAAh+QQBCgADACwAAAAAAQAGAAACAwSEUAAh+QQBCgADACwAAAAAAQAGAAACA4SFBQA7) repeat-y right top;
}

.imgareaselect-border4 {
    background: url(data:image/gif;base64,R0lGODlhBgABAKEAAP///wAAADY2Nv///yH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQACgD/ACwAAAAABgABAAACAxQuUgAh+QQBCgADACwAAAAABgABAAACA5SAUgAh+QQBCgADACwAAAAABgABAAACA5SBBQAh+QQBCgADACwAAAAABgABAAACA4QOUAAh+QQBCgADACwAAAAABgABAAACAwSEUAAh+QQBCgADACwAAAAABgABAAACA4SFBQA7) repeat-x left bottom;
}

.imgareaselect-border1, .imgareaselect-border2,
.imgareaselect-border3, .imgareaselect-border4 {
    filter: alpha(opacity=50);
    opacity: 0.5;
}

.imgareaselect-handle {
    background-color: #fff;
    border: solid 1px #000;
    filter: alpha(opacity=50);
    opacity: 0.5;
}

.imgareaselect-outer {
    background-color: #000;
    filter: alpha(opacity=50);
    opacity: 0.5;
}

.imgareaselect-selection {
}
*/
}))
//<------ css end

/**
 * 功能: 自定义查询
 * 汇总自定义日期区间[dStart, dEnd)的任务报告
 */
function report(dStart, dEnd) {
    const arrtask = {}
    let progPos = 0
    const progMax = 20

    const now = new Date()
    if (typeof(dStart) == 'number'){ // example: 9 表示查询9月任务数据
        let m = dStart
        let y = now.getFullYear()
        dStart = new Date(y, m - 1, 1)
        if (m == 12){
            y += 1
            m = 0
        }
        dEnd = new Date(y, m, 1)
    } else if (typeof(dStart) === 'string' && typeof(dEnd) === 'string'){ // example: ('2018-09-01', '2018-10-01')
        dStart = new Date(dStart)
        dEnd = new Date(dEnd)
    }

    const progStep = (now.getTime() - dStart.getTime())/progMax
    const msg = helper.msg({
        message: util.progress(0,progMax),
        dangerouslyUseHTMLString: true,
        duration: 0,
    })

    function doCollect(task) {
        for (let t of task) {
            const pos = Math.floor((now.getTime() - t.finishedtime)/progStep)
            if (pos > progPos){
                progPos = pos
                msg.message = util.progress(progPos, progMax)
            }

            if (t.finishedtime >= dStart.getTime()){
                if (t.finishedtime >= dEnd.getTime()){
                    continue
                }

                if (t.tasktype !== stage.role){
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
                        price: 0,
                        presalary: 0.0,
                    }
                }
                arrtask[key].totalcount += t.totalcount
                arrtask[key].finishedcount += t.finishedcount
                arrtask[key].returntimes += (t.status === '已退回' ? 1 : 0)
                let d0, d1
                if(t.tasktype === '题目录入'){
                    arrtask[key].inputcount += parseInt(t.remark.match(/\d+/)) // 录完2题
                    const r = t.remark2.match(/\d+/g) // 已被审核4题，通过4题
                    d0 = r[0]; d1 = r[1]
                } else if(t.tasktype === '题目审核'){
                    const r = t.remark.match(/\d+/g) // 审完0题，通过0题
                    d0 = r[0]; d1 = r[1]
                }

                arrtask[key].checkcount += parseInt(d0)
                arrtask[key].passcount += parseInt(d1)
            } else {
                return false
            }
        }

        return true
    }

    function createTable(result) {
        let nTotal = 0, nFinished = 0, nReturnTimes = 0, nInput = 0, nCheck = 0, nPass = 0, nPreSalary = 0.0
        let thtm = '<table style="margin: 10px 20px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'
        thtm += '<caption>自定义查询 查询期间: [' + dStart.format('yyyy-MM-dd') + ',' + dEnd.format('yyyy-MM-dd') + ')</caption>'
        thtm += '<thead><tr>'
        thtm += '<th>&nbsp;</th><th>总量</th><th>完成量</th><th>已退回</th>' + (stage.role === '题目录入' ? '<th>录入量</th>' : '') + '<th>已审核</th><th>通过</th><th>通过率</th><th>劳务预估</th>'
        thtm += '</tr></thead><tbody>';

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

            if (stage.role === '题目录入'){
                result[key].price = SE[key][0]
                result[key].presalary = result[key].inputcount * result[key].price +
                (result[key].finishedcount - result[key].inputcount) * 0.05
            } else if (stage.role === '题目审核') {
                result[key].price = SE[key][1]
                result[key].presalary = result[key].checkcount * result[key].price
            }

            nPreSalary += result[key].presalary || 0

            thtm += '<tr>' +
                '<td style="text-align: center;">' + key + '</td>' + // ex. 高中-数学
                '<td style="text-align: right;">' + result[key].totalcount + '</td>' + // 总量
                '<td style="text-align: right;">' + result[key].finishedcount + '</td>' + // 完成量
                '<td style="text-align: right;">' + result[key].returntimes + '</td>' + // 退回次数
                (stage.role === '题目录入' ? '<td style="text-align: right;">' + result[key].inputcount + '</td>' : '') + // 录入量
                '<td style="text-align: right;">' + result[key].checkcount + '</td>' + // 已审核
                '<td style="text-align: right;">' + result[key].passcount + '</td>' + // 通过
                '<td style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</td>' + // 通过率
                '<td style="text-align: right;">' + result[key].presalary.toFixed(2) + '</td>' + // 劳务预估
                '</tr>'
        }

        let passrate = nPass / nCheck

        thtm += '</tbody><tfoot><tr>' +
            '<th style="text-align: center;">全部</th>' +
            '<th style="text-align: right;">' + nTotal + '</th>' +
            '<th style="text-align: right;">' + nFinished + '</th>' +
            '<th style="text-align: right;">' + nReturnTimes + '</th>' +
            (stage.role === '题目录入' ? '<td style="text-align: right;">' + nInput + '</th>' : '') +
            '<th style="text-align: right;">' + nCheck + '</th>' +
            '<th style="text-align: right;">' + nPass + '</th>' +
            '<th style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</th>' +
            '<th style="text-align: right;">' + nPreSalary.toFixed(2) + '</th>' +
            '</tr></tfoot>'
        thtm += '</table>'

        return thtm
    }

    function collectionFinished(){
        helper.closeMessage()
        helper.msg({
            message: createTable(arrtask),
            type: 'success',
            dangerouslyUseHTMLString: true,
            duration: 0,
            showClose: true,
        })
    }

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
                if (t.tasktype !== stage.role){
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
                        price: 0,
                        presalary: 0.0,
                    }
                }
                arrtask[key].totalcount += t.totalcount
                arrtask[key].finishedcount += t.finishedcount
                arrtask[key].returntimes += (t.status === '已退回' ? 1 : 0)
                let d0, d1
                if(t.tasktype === '题目录入'){
                    arrtask[key].inputcount += parseInt(t.remark.match(/\d+/)) // 录完2题
                    const r = t.remark2.match(/\d+/g) // 已被审核4题，通过4题
                    d0 = r[0]; d1 = r[1]
                } else if(t.tasktype === '题目审核'){
                    const r = t.remark.match(/\d+/g) // 审完0题，通过0题
                    d0 = r[0]; d1 = r[1]
                }

                arrtask[key].checkcount += parseInt(d0)
                arrtask[key].passcount += parseInt(d1)
            } else {
                return false
            }
        }

        return true
    }
    
    function createTable(result) {
        let nTotal = 0, nFinished = 0, nReturnTimes = 0, nInput = 0, nCheck = 0, nPass = 0, nPreSalary = 0.0
        let thtm = '<table style="margin: 10px 20px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'
        thtm += '<caption>今日战绩 查询时间: ' + new Date().format('hh:mm:ss') + '</caption>'
        thtm += '<thead><tr>'
        thtm += '<th>&nbsp;</th><th>总量</th><th>完成量</th><th>已退回</th>' + (stage.role === '题目录入' ? '<th>录入量</th>' : '') + '<th>已审核</th><th>通过</th><th>通过率</th><th>劳务预估</th>'
        thtm += '</tr></thead><tbody>';

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

            if (stage.role === '题目录入'){
                result[key].price = SE[key][0]
                result[key].presalary = result[key].inputcount * result[key].price +
                (result[key].finishedcount - result[key].inputcount) * 0.05
            } else if (stage.role === '题目审核') {
                result[key].price = SE[key][1]
                result[key].presalary = result[key].checkcount * result[key].price
            }

            nPreSalary += result[key].presalary || 0

            thtm += '<tr>' +
                '<td style="text-align: center;">' + key + '</td>' + // ex. 高中-数学
                '<td style="text-align: right;">' + result[key].totalcount + '</td>' + // 总量
                '<td style="text-align: right;">' + result[key].finishedcount + '</td>' + // 完成量
                '<td style="text-align: right;">' + result[key].returntimes + '</td>' + // 退回次数
                (stage.role === '题目录入' ? '<td style="text-align: right;">' + result[key].inputcount + '</td>' : '') + // 录入量
                '<td style="text-align: right;">' + result[key].checkcount + '</td>' + // 已审核
                '<td style="text-align: right;">' + result[key].passcount + '</td>' + // 通过
                '<td style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</td>' + // 通过率
                '<td style="text-align: right;">' + result[key].presalary.toFixed(2) + '</td>' + // 劳务预估
                '</tr>'
        }

        let passrate = nPass / nCheck

        thtm += '</tbody><tfoot><tr>' +
            '<th style="text-align: center;">全部</th>' +
            '<th style="text-align: right;">' + nTotal + '</th>' +
            '<th style="text-align: right;">' + nFinished + '</th>' +
            '<th style="text-align: right;">' + nReturnTimes + '</th>' +
            (stage.role === '题目录入' ? '<td style="text-align: right;">' + nInput + '</th>' : '') +
            '<th style="text-align: right;">' + nCheck + '</th>' +
            '<th style="text-align: right;">' + nPass + '</th>' +
            '<th style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</th>' +
            '<th style="text-align: right;">' + nPreSalary.toFixed(2) + '</th>' +
            '</tr></tfoot>'
        thtm += '</table>'

        return thtm
    }

    function collectionFinished(){
        helper.closeMessage()
        helper.msg({
            message: createTable(arrtask),
            type: 'success',
            dangerouslyUseHTMLString: true,
            duration: 0,
            showClose: true,
        })
    }

    helper.msg({
        message: STR.TASK_REPORT.PROGRESS,
        type: 'info',
        duration: 0,
    })

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
function preMonthTaskReport() {
    function getPre2MonthNccTaskIds(m){
        const k = 'xusqa_ncc_month_' + m
        if (S.hasOwnProperty(k)){
            return JSON.parse(S[k])
        } else {
            return []
        }
    }

    let arrtask = {}
    let totalPages
    const now = new Date()
    const firstDay = helper.getFirstDay(now)
    const preMonthFirstDay = helper.getPreMonthFirstDay(now)

    const pre2m = helper.getPre2Month(now)
    const pre2MonthNccTaskIds = getPre2MonthNccTaskIds(pre2m) // 上月已结算任务Id
    let accCls = false
    const k = 'xusqa_cls_month_' + helper.getPreMonth(now)
    if (S.hasOwnProperty(k)){
        arrtask = JSON.parse(S[k])
        accCls = true
    }

    function doCollect(task) {
        function c(t){
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

        for (let t of task) {
            if (t.finishedtime >= firstDay){
                continue
            }

            if (t.finishedtime >=preMonthFirstDay){ // 上月的任务
                if (t.salary){
                    c(t)
                }
            } else { // 上上月
                if (pre2MonthNccTaskIds.length){
                    if (t.id < pre2MonthNccTaskIds[pre2MonthNccTaskIds.length - 1]){
                        return false
                    } else if (~pre2MonthNccTaskIds.indexOf(t.id)) {
                        c(t)
                    }
                } else {
                    return false
                }
            }
        }

        return true
    }

    function createTable(result) {
        let nTotal = 0, nFinished = 0, nReturnTimes = 0, nInput = 0, nCheck = 0, nPass = 0, dPreSalary=0.0, dSalary=0.0
        let thtm = '<table style="margin: 10px 20px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'

        thtm += '<caption>' + helper.getPreMonth(now) + ' 劳务结算</caption>'
        thtm += '<thead>><tr>'
        thtm += '<th>&nbsp;</th><th>总量</th><th>完成量</th><th>已退回</th><th>录入量</th><th>已审核</th><th>通过</th><th>通过率</th></th><th>助手核算</th><th>劳务结算</th>'
        thtm += '</tr></thead><tbody>';

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

            result[key].price = SE[key][0]
            result[key].presalary = result[key].passcount * SE[key][0] + // 通过的 数量*价格
                (result[key].checkcount - result[key].passcount) * SE[key][0] * (1/* - 0.2*/) + // 未审核通过的题扣除20%
                (result[key].finishedcount - result[key].inputcount) * 0.05 // 判好题的 数量*0.05

            dPreSalary += result[key].presalary || 0

            thtm += '<tr>' +
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

        thtm += '</tbody><tfoot><tr>' +
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

        thtm += '</tfoot></table>'

        thtm += '<div style=" font-size: 12px; font-style: italic; margin-bottom: 16px;">注:'
        thtm += bReward ? '(满足奖励条件,合计结算金额已×1.2)' : '(未满足奖励条件)'
        if (!pre2MonthNccTaskIds.length){
            thtm += '数据未包含' + pre2m + '未结算数据.'
        }
        thtm += '数据仅供参考.</div>'

        return thtm
    }

    function collectionFinished(){
        if (accCls){
            arrtask = JSON.parse(S[k])
        } else {
            S[k] = JSON.stringify(arrtask)
        }
        helper.closeMessage()
        helper.msg({
            message: createTable(arrtask),
            type: 'success',
            dangerouslyUseHTMLString: true,
            duration: 0,
            showClose: true,
        })
    }

    helper.msg({
        message: STR.TASK_REPORT.PROGRESS,
        duration: 0,
    })
    /*\
     {  "code":200,
        "data":{
            "task":[
                {"totalcount":2,"finishedcount":2,"tasktype":"题目录入","education":"高中","subject":"理数","finishedtime":1529671499818,"remark":"录完1题","id":205978,"salary":0.0,"remark2":"已被审核0题，通过0题","status":"已完成"},
            ],
            "totalSalary":0, "pageno":1, "totalPages":22, "lastMonthSalary":0, "totalElements":218
        }, "message":"SUCCESS" }
    \*/
    if (accCls){
        collectionFinished()
        return
    }

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
 * 功能: 任务报告
 * 汇总任务,计算录入量,通过率等
 * 服务器没有对连续请求做优化,查询一页再查询另一页会非常慢;异步查询会返回全部数据,没法控制停止时机
 */
function monthInputTaskReport(stopDate) {
    let totalPages
    let lastMonthSalary
    const now = new Date()

    let arrtask = {} // 上月未结算任务
    let arrtaskId = [] // 上月未结算任务Id
    const arrTaskThisMonth = {} // 本月录入任务

    const firstDay = helper.getFirstDay(now) // 本月的开始时间
    const preMonthFirstDay = helper.getPreMonthFirstDay(now) // 上月的开始时间
    const nccMonthKey = 'xusqa_ncc_month_' + helper.getPreMonth(now)
    const closeAcc = S.hasOwnProperty(nccMonthKey)
    let tsc = 0 // 记录上月结算任务数量
    let closeAccDone

    if (closeAcc && S.hasOwnProperty('xusqa_acc_premonth')){  // 上月未结算已缓存
        arrtask = JSON.parse(S.xusqa_acc_premonth)
        closeAccDone = true
    }

    if (!stopDate){
        stopDate = helper.getPreMonthFirstDay(now)
    }

    let progStep, progPos = 0
    const progMax = 20
    if (closeAccDone || !O.forceShowPreAcc){ // 已缓存上月未结,只查询本月数据
        progStep = (now.getTime() - firstDay)/progMax
    } else {
        progStep = (now.getTime() - stopDate)/progMax
    }

    const msg = helper.msg({
        message: util.progress(0,progMax),
        dangerouslyUseHTMLString: true,
        duration: 0,
    })

    function doCollect(task) {
        function c(arr, t){
            if (t.tasktype !== stage.role){
                return
            }
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
        for (let t of task) {
            // 更新汇总进度
            const pos = Math.floor((now.getTime() - t.finishedtime)/progStep)
            if (pos > progPos){
                progPos = pos
                msg.message = util.progress(progPos, progMax)
            }

            if (t.finishedtime > firstDay){
                c(arrTaskThisMonth, t)
            } else if(lastMonthSalary || O.forceShowPreAcc) {
                if (closeAccDone){ // 已经缓存上月未结算数据
                    return false
                }
                if (stopDate && stopDate > t.finishedtime){
                    return false
                }
                if (t.finishedcount !== 0 && t.salary === 0){ // 上月未结算任务
                    arrtaskId.push(t.id)
                    c(arrtask, t)
                }
                if (t.finishedtime > preMonthFirstDay && t.salary){ // 上月有了结算数据
                    tsc++
                }
            } else {
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
            tr += '<thead><tr>'
            tr += '<th>' + title + '</th><th>总量</th><th>完成量</th><th>已退回</th><th>录入量</th><th>已审核</th><th>通过</th><th>通过率</th></th><th>劳务预估</th>' //'<th>劳务结算</th>'
            tr += '</tr></thead><tbody>';

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

                result[key].price = SE[key][0]
                result[key].presalary = result[key].inputcount * result[key].price + // 判好题的 数量*0.05
                    (result[key].finishedcount - result[key].inputcount) * 0.05

                /*
                result[key].presalary = result[key].passcount * SE[key][0] + // 通过的 数量*价格
                    //(result[key].checkcount - result[key].passcount) * SE[key][0] * (1 - 0.2) + // 未审核通过的题扣除20%
                    (result[key].checkcount - result[key].passcount) * SE[key][0] * (1 - 0.0) +
                    (result[key].finishedcount - result[key].inputcount) * 0.05 // 判好题的 数量*0.05

                // 未审核的按照当前通过率预估
                if (result[key].inputcount >= result[key].checkcount) { // why appear, i don't know
                    let notcheck = result[key].inputcount - result[key].checkcount
                    let prepass = (notcheck * (passrate ? passrate : 0)).toFixed(0)
                    result[key].presalary += prepass * SE[key][0] + (notcheck - prepass) * SE[key][0] // * 0.8 issue by 花落流年殇
                }*/

                dPreSalary += result[key].presalary || 0

                tr += '<tr>' +
                    '<td style="text-align: center;">' + key + '</td>' + // ex. 高中-数学
                    '<td style="text-align: right;">' + result[key].totalcount + '</td>' + // 总量
                    '<td style="text-align: right;">' + result[key].finishedcount + '</td>' + // 完成量
                    '<td style="text-align: right;">' + result[key].returntimes + '</td>' + // 退回次数
                    '<td style="text-align: right;">' + result[key].inputcount + '</td>' + // 录入量
                    '<td style="text-align: right;">' + result[key].checkcount + '</td>' + // 已审核
                    '<td style="text-align: right;">' + result[key].passcount + '</td>' + // 通过
                    '<td style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</td>' + // 通过率
                    '<td style="text-align: right;">' + (result[key].presalary).toFixed(2) + '</td>' + // 劳务费预估
                    //'<td style="text-align: right;">' + (result[key].salary).toFixed(2) + '</td>' + // 劳务结算
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
            tr += '<tr style="font-style: italic;">' +
                '<td style="text-align: center;">小计:</td>' +
                '<td style="text-align: right;">' + nTotal + '</td>' +
                '<td style="text-align: right;">' + nFinished + '</td>' +
                '<td style="text-align: right;">' + nReturnTimes + '</td>' +
                '<td style="text-align: right;">' + nInput + '</td>' +
                '<td style="text-align: right;">' + nCheck + '</td>' +
                '<td style="text-align: right;">' + nPass + '</td>' +
                '<td style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</td>' +
                '<td style="text-align: right;">' + dPreSalary.toFixed(2) + '</td>' +
                //'<td style="text-align: right;">' + dSalary.toFixed(2) + '</td>' +
                '</tr></tbody>'

            return tr
        }

        let thtm = '<table style="margin: 10px 10px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'
        thtm += '<caption>查询时间: ' + new Date().format('yyyy-MM-dd hh:mm:ss') + '</caption>'
        thtm += c(arrTaskThisMonth, '本月录入')
        thtm += c(arrtask, '上月未结')

        let b = nsCheck >=500 && nsPass / nsCheck > 0.8
        dsPreSalary = b ? dsPreSalary*1.2 : dsPreSalary
        dsSalary = b ? dsSalary*1.2 : dsSalary
        thtm += '<tfoot style="font-weight: bold;"><tr>' +
            '<td style="text-align: center;">合计:</td>' +
            '<td style="text-align: right;">' + nsTotal + '</td>' +
            '<td style="text-align: right;">' + nsFinished + '</td>' +
            '<td style="text-align: right;">' + nsReturnTimes + '</td>' +
            '<td style="text-align: right;">' + nsInput + '</td>' +
            '<td style="text-align: right;">' + nsCheck + '</td>' +
            '<td style="text-align: right;">' + nsPass + '</td>' +
            '<td style="text-align: right;">' + (nsPass/nsCheck * 100).toFixed(2) + (nsCheck === 0 ? '' : '%') + '</td>' +
            '<td style="text-align: right;">' + dsPreSalary.toFixed(2) + '</td>' +
            //'<td style="text-align: right;">' + dsSalary.toFixed(2) + '</td>' +
            '</tr></tfoot>'

        thtm += '</table>'
        thtm += '<div style=" font-size: 12px; font-style: italic; margin-bottom: 16px;">注:'
        thtm += b ? '(满足奖励条件,合计结算金额已×1.2)' : '(未满足奖励条件)'
        if (!lastMonthSalary){
            thtm += '上月任务还未结算,'
            if (!O.forceShowPreAcc){
                thtm += '暂时无上月未结数据,'
            }
        }
        thtm += '数据仅供参考.</div>'

        return thtm
    }

    function collectionFinished(){
        helper.closeMessage()
        helper.msg({
            message: createTable(),
            type: 'success',
            dangerouslyUseHTMLString: true,
            duration: 0,
            showClose: true,
        })

        if (!closeAcc && tsc > 0){
            S[nccMonthKey] = JSON.stringify(arrtaskId) // 保存上月未结任务Id
            S.removeItem('xusqa_acc_premonth') // 移除旧的未结算汇总缓存
        }

        if(closeAcc && !S.hasOwnProperty('xusqa_acc_premonth')){ // 保存新的上月未结汇总数据
            S.xusqa_acc_premonth = JSON.stringify(arrtask)
        }
    }

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
        lastMonthSalary = data.data.lastMonthSalary
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
 * 功能: 任务报告
 * 汇总任务,计算录入量,通过率等
 * 服务器没有对连续请求做优化,查询一页再查询另一页会非常慢;异步查询会返回全部数据,没法控制停止时机
 */
function monthCheckTaskReport() {
    const arr = {}
    let totalPages
    const now = new Date()
    const firstDay = helper.getFirstDay(now)

    let progStep, progPos = 0
    const progMax = 20
    progStep = (now.getTime() - firstDay)/progMax

    const msg = helper.msg({
        message: util.progress(0,progMax),
        dangerouslyUseHTMLString: true,
        duration: 0,
    })

    function doCollect(task) {
        for (let t of task) {
            const pos = Math.floor((now.getTime() - t.finishedtime)/progStep)
            if (pos > progPos){
                progPos = pos
                msg.message = util.progress(progPos, progMax)
            }

            if (t.finishedtime > firstDay){
                if (t.tasktype !== stage.role){
                    continue
                }
                const key = t.subject + '-' + t.education
                if (!arr.hasOwnProperty(key)) {
                    arr[key] = {
                        totalcount: 0,
                        finishedcount: 0,
                        returntimes: 0,
                        checkcount: 0,
                        passcount: 0,
                        presalary: 0.0,
                        salary: 0.0
                    }
                }
                arr[key].totalcount += t.totalcount
                arr[key].finishedcount += t.finishedcount
                arr[key].returntimes += (t.status === '已退回' ? 1 : 0)
                const [d0,d1] = t.remark.match(/\d+/g) // 审完4题，通过4题
                arr[key].checkcount += parseInt(d0)
                arr[key].passcount += parseInt(d1)
                arr[key].salary += t.salary
            } else {
                return false
            }
        }
        return true
    }

    function createTable() {
        let nTotal = 0, nFinished = 0, nReturnTimes = 0, nCheck = 0, nPass = 0, dPreSalary=0.0, dSalary=0.0
        function c(result){
            let tr = ''
            tr += '<thead><tr>'
            tr += '<th></th><th>总量</th><th>完成量</th><th>已退回</th>><th>已审核</th><th>通过</th><th>通过率</th></th><th>劳务预估</th><th>劳务结算</th>'
            tr += '</tr></thead><tbody>';

            for (let key in result) {
                nTotal += result[key].totalcount
                nFinished += result[key].finishedcount
                nReturnTimes += result[key].returntimes
                nCheck += result[key].checkcount
                nPass += result[key].passcount
                let passrate = (result[key].passcount / result[key].checkcount)
                passrate = passrate > 1 ? 1 : passrate //
                dSalary += result[key].salary

                result[key].price = SE[key][1]
                result[key].presalary = result[key].checkcount * SE[key][1]
                dPreSalary += result[key].presalary || 0

                tr += '<tr>' +
                    '<td style="text-align: center;">' + key + '</td>' + // ex. 高中-数学
                    '<td style="text-align: right;">' + result[key].totalcount + '</td>' + // 总量
                    '<td style="text-align: right;">' + result[key].finishedcount + '</td>' + // 完成量
                    '<td style="text-align: right;">' + result[key].returntimes + '</td>' + // 退回次数
                    '<td style="text-align: right;">' + result[key].checkcount + '</td>' + // 已审核
                    '<td style="text-align: right;">' + result[key].passcount + '</td>' + // 通过
                    '<td style="text-align: right;">' + (passrate * 100).toFixed(2) + (passrate ? '%' : '') + '</td>' + // 通过率
                    '<td style="text-align: right;">' + (result[key].presalary).toFixed(2) + '</td>' + // 劳务费预估
                    '<td style="text-align: right;">' + (result[key].salary).toFixed(2) + '</td>' + // 劳务结算
                    '</tr>'
            }
            tr += '</tbody>'
            return tr
        }

        let thtm = '<table style="margin: 10px 20px 10px 0px;font-size: 14px;border-collapse:collapse;;border: none;">'
        thtm += '<caption>查询时间: ' + new Date().format('yyyy-MM-dd hh:mm:ss') + '</caption>'
        thtm += c(arr)
        thtm += '<tfoot><tr>' +
            '<td style="text-align: center;">合计:</td>' +
            '<td style="text-align: right;">' + nTotal + '</td>' +
            '<td style="text-align: right;">' + nFinished + '</td>' +
            '<td style="text-align: right;">' + nReturnTimes + '</td>' +
            '<td style="text-align: right;">' + nCheck + '</td>' +
            '<td style="text-align: right;">' + nPass + '</td>' +
            '<td style="text-align: right;">' + (nPass/nCheck * 100).toFixed(2) + '%</td>' +
            '<td style="text-align: right;">' + dPreSalary.toFixed(2) + '</td>' +
            '<td style="text-align: right;">' + dSalary.toFixed(2) + '</td>' +
            '</tr></tfoot>'

        thtm += '</table>'

        return thtm
    }

    function collectionFinished(){
        helper.closeMessage()
        helper.msg({
            message: createTable(),
            type: 'success',
            dangerouslyUseHTMLString: true,
            duration: 0,
            showClose: true,
        })
    }
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

        if (stage.manage){
            const $role = $(TPL.SQUARE_ROLE.format({role: stage.role})).appendTo($squareUpdate)
            $role.on('click', function(){
                stage.role = helper.alternateRole(stage.role)
                O.role = stage.role
                $role.text(stage.role)
                doExtraTaskList()
            })
        }
    }

    function resetRefresh(qssumary){
        if (location.hash.indexOf('#/task/choose') === -1){
            return
        }

        stage.squareUpdateTime = new Date()
        clearInterval(stage.timer.lastUpdateTimer)
        $squareUpdate.children('a:first-child').text(util.timeAgo(0))

        stage.timer.lastUpdateTimer = setInterval(function(){
            if ($squareUpdate.length){
                const now = new Date()
                const ta = util.timeAgo(now - stage.squareUpdateTime)
                $squareUpdate.children('a:first-child').text(ta)
            } else {
                clearInterval(stage.timer.lastUpdateTimer)
            }
        }, 1000*30)

        // qq 分享
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
        $squareUpdate.children('a:nth-child(3)').attr({href: qhref, target: '_blank'});
    }

    function getRemainByRole(rms, role){
        for(let i of rms){
            if (i.taskname === role){
                return i
            }
        }
    }

    function setLiCorner(li) {
        const [s,e] = li.lastChild.innerText.split('-')
        /*\
         > {"code":200,"data":[{"count":0,"taskname":"题目录入","permission":1,"remark":""}],"message":"SUCCESS"}
         > {"code":200,"data":[{"count":90,"taskname":"题目录入","permission":-2,"remark":""}],"message":"SUCCESS"}
         > {"code":200,"data":[{"count":4,"taskname":"图片裁切"},{"count":3054,"taskname":"题目录入","permission":-2,"remark":""},{"count":52,"taskname":"题目审核"}],"message":"SUCCESS"}
        \*/
        $.get(encodeURI(URL.GET_TASK_REMAIN.format({subject: s, education: e})), function(data/*, status*/) {
            const rm = getRemainByRole(data.data, stage.role) || data.data[0]
            const taskname = stage.manage ? stage.role : rm.taskname
            const se = s + '-' + e
            const b = helper.isExcludedSE(se)

            if (li.childNodes.length === 2){ // 清除之前的角标
                li.firstChild.remove()
            }

            const pm = stage.manage || rm.permission === 1
            if (rm.count !== 0 || !pm) { // 设置新角标
                const $corner = $('<div class="xusqa-corner' + (pm ? (b ? '-excluded' : '') : '-gray') + '"><a class="xusqa-corner-a" style="font-size: ' +
                    (pm && !b ? '15' : '12') + 'px;"' +
                    (pm && !b ? ' href="javascript:void(0);"' : '') + '>' +
                    ((pm || rm.count > 0) ? rm.count : STR.EXTRA_TASK_SQUARE.WAIT_APPROVAL) +
                    '</a></div>').prependTo(li)

                if (pm && !b) { // 角标点击事件
                    $corner.find('a').click(function() {
                        $.get(encodeURI(URL.GET_TASK.format({tasktype: taskname, subject: s, education: e})), function(data/*, status*/) {
                            if (data.code === 200) {
                                helper.msg.success(STR.ONEKEY_GET_TASK.SUCCESS.format({se: se, role: taskname}))
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
        $.get(encodeURI(URL.GET_TASK.format({tasktype: stage.role, subject: s, education: e})), (function(se){
            return function(data/*, status*/){
                if (data.code === 200){
                    _status = 200
                    helper.msg.success(STR.ONEKEY_GET_TASK.SUCCESS.format({se: se, role: stage.role}))
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
                ruleHelper.setRuleflag(html)
                const root = U.htmlparser(preFormat(html))
                root.traversal(function(node) {
                    if (node.type === 'text') {
                        node.data = format(node.data)
                    }
                })
                cont.innerHTML = afterFormat(root.toHtml())
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

    function showQInputProgress(){
        queryQInputProgress(function(total, cur, input){
            const $title = $('#app > div > div.main-content > div > div > div.position > div')
            $title.text($title.text() + ' - 进度' + cur + '/' + total + '(已录入' + input + '题)')
        })
    }
    if (O.showQInputProgress){
        showQInputProgress()
    }
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
function registerQuestionSave(pot){
    let $con
    if (pot.role === '题目录入'){
        $con = $(DOM.EDIT_PAGE_QUESTION_CON)
    } else {
        $con = $(DOM.CHECK.QUESTION_CON)
    }
    const $titleQ = $con.find('> div:nth-child(1)')
    const $titleY = $con.find('> div:nth-child(5)') // 解析标题
    const $titleK = $con.find('> div:nth-child(9)') // 知识点标题
    const $imgQ = $(DOM.QUESTION_IMG)
    const taskId = helper.getTaskId()

    const $save = $(TPL.EDIT_PAGE_SAVE).insertAfter($imgQ)
    $save.click(function(){
        helper.saveQuestion()
    })
    const $restore = $(TPL.EDIT_PAGE_RESTORE).insertAfter($imgQ)
    $restore.click(function(){
        helper.restoreQuestion()
    })

    if (pot.role === '题目审核'){
        $save.css({'float': 'left'})
        $restore.css({'float': 'left'})
    }
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
        //r = /(\d+\.)\s*([A-DTF]|[a-zA-Z\/]+)\s+/g
        r = /(\d+\.)\s*(([a-zA-Z\/]+)|([A-DFT])[\s,.]+)/g
        m = analysis.match(r)
        if (m && m.length > 2){
            const u1 = helper.getEditor(1)
            let answer = '<p>'
            let e = r.exec(analysis)
            while(e){
                answer += e[1] + (e[3] || e[4]) + '</p><hr/>'
                e = r.exec(analysis)
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

        r = /\s*本*题*考查([\u4E00-\u9FA5、]+)[.。]/g
        m = analysis.match(r)
        if (m && m.length === 1){
            const u4 = helper.getEditor(4)
            m = analysis.match(/\s*本*题*考查([\u4E00-\u9FA5、]+)[.。]/)
            let knowledge = m[1]
            u4.setContent(knowledge, u4.getContent())
            analysis = analysis.slice(0, m.index) + analysis.slice(m.index+m[0].length)
        }

        u2.setContent(analysis, false)
    })

    function getKnowledge(){
        return helper.getEditor(4).getContent()
    }

    function clearKnowledge(){
        helper.getEditor(4).setContent('', false)
    }

    $(TPL.EDIT_PAGE_CLEAR_KNOWLEDGE).insertBefore($titleK).click(function(){
        const d = {
            taskId: taskId,
            content: getKnowledge(),
        }
        S.xusqa_clearKnowledge = JSON.stringify(d)
        clearKnowledge()
    })

    if (S.hasOwnProperty('xusqa_clearKnowledge')){
        const d = JSON.parse(S.xusqa_clearKnowledge)
        if (d.taskId === taskId){
            clearKnowledge()
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

        UI.setScope('answerInPage', $boxA[0])
        UI.setScope('questionInPage', $boxQ[0])

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
        setTimeout(registerQuestionSave, 1000, {role: '题目录入'})
    }
    doRegister()

    ruleHelper.clearRuleFlag()
}

function doExtendCheckPage(){
    let timer
    function doRegister(){
        clearTimeout(timer)
        if (!document.isReady){
            timer = setTimeout(doRegister, 200)
            return
        }
        const $boxA = $(DOM.CHECK.ANSWER_BOX)
        const $boxQ = $(DOM.CHECK.QUESTION_BOX)
        const $btnALatex = $boxA.find(DOM.ANSWER_BOX_LATEX_BTN)
        const $btnQLatex = $boxQ.find(DOM.QUESTION_BOX_LATEX_BUTTON)
        if(!($btnALatex.length && $btnQLatex.length)){
            timer = setTimeout(doRegister, 200)
            return
        }
        const $ep = $(DOM.EDIT_PAGE)
        UI.setScope('check', $ep[0])
        stage.editPage.v = $ep[0].__vue__

        /*
        registerLocateButton({
            $box: $boxA,
            //$jmp: $boxA.find(DOM.ANSWER_BOX_JUMP_BTN),
            $ipt: $boxA.find(DOM.ANSWER_BOX_JUMP_INPUT),
            ctn: DOM.ANSWER_BOX_IMG_CTN,
            cls: DOM.ANSWER_BOX_CLOSE
        }) // register locate pre answer position
        */

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
        //fixAnswerAddCut()
        //fixQuestionAddCut()

        // register question snap
        // delay load, if not, event added will be clear, why? test editpage.__vue__._isMounted
        setTimeout(registerQuestionSnap, 1000)
        setTimeout(registerQuestionSave, 1000, {role: '题目审核'})
    }
    doRegister()
}

function doExtendFinalCheckPage(){
    let timer
    function doRegister(){
        clearTimeout(timer)
        if (!document.isReady){
            timer = setTimeout(doRegister, 200)
            return
        }
        const $boxA = $(DOM.FINALCHECK.ANSWER_BOX)
        const $boxQ = $(DOM.FINALCHECK.QUESTION_BOX)
        const $btnALatex = $boxA.find(DOM.ANSWER_BOX_LATEX_BTN)
        const $btnQLatex = $boxQ.find(DOM.QUESTION_BOX_LATEX_BUTTON)
        if(!($btnALatex.length && $btnQLatex.length)){
            timer = setTimeout(doRegister, 200)
            return
        }

        stage.editPage.v = $(DOM.EDIT_PAGE)[0].__vue__

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

        // register question snap
        // delay load, if not, event added will be clear, why? test editpage.__vue__._isMounted
        //setTimeout(registerQuestionSnap, 1000)
        //setTimeout(registerQuestionSave, 1000)
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
            const $btnQJudge = $(DOM.QJUDGE_BTN)
            if (O.showJudgeHint){
                $btnQJudge.addClass('xusqa-btn')
                $btnQJudge.filter(':nth-child(1)').attr('title', STR.HINT.SEARCH_STANDARD)
                $btnQJudge.filter(':nth-child(2)').attr('title', STR.HINT.SEARCH_FAIL)
                $btnQJudge.filter(':nth-child(3)').attr('title', STR.HINT.SEARCH_LOSE)
            }
            $(TPL.JUDGE_RULE_A).insertAfter($btnQJudge.last())
            execCommand('registerQjudgeEncircle')
            UI.setScope('QuestionJudge', $btnQJudge[0])
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
            if (O.optimizeQJudgeShow){
                $(TPL.JUDGE_REFRESH).insertAfter($qimg).on('click', function(){
                    location.reload()
                })
            }
            //$(TPL.JUDGE_FIX).insertAfter($qimg).on('click', function(){
            //    const r = $('#searchResult')
            //    const v = $('#app > div > div.main-content > div > div')[0].__vue__
            //    r.html(v.data.simquestion)
            //})
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

function queryQInputProgress(f){
    $.get(URL.GET_MY_TASK.format({pageno:1}), function(data){
        if (data.code === 200){
            const t = data.data.task[0]
            if (f && typeof(f) === 'function'){
                f(t.totalcount, t.finishedcount+1, parseInt(t.remark.match(/\d+/)))
            }
        }
    })
}

function registerOption(){
    const $option = $(TPL.OPTIONS.format({ver: stage.profile.isValidSN ? '专业版' : '基础版'})).insertAfter($(DOM.POSITION))

    if (stage.role === '题目录入'){
        //const $switch_showJudgeHint = $(TPL.OPTIONS_SWITCH.format({title: '判题时显示判题规则提示'})).appendTo($option).find('input')
        //$switch_showJudgeHint.prop('checked', O.showJudgeHint).on('change', function(){
        //    O.showJudgeHint = $switch_showJudgeHint.prop('checked')
        //})
        const $switch_optimizeQJudgeShow = $(TPL.OPTIONS_SWITCH.format({title: '判题界面优化(底色,宽度)'})).appendTo($option).find('input')
        $switch_optimizeQJudgeShow.prop('checked', O.optimizeQJudgeShow).on('change', function(){
            O.optimizeQJudgeShow = $switch_optimizeQJudgeShow.prop('checked')
        })
        const $switch_showQInputProgress = $(TPL.OPTIONS_SWITCH.format({title: '录题时显示当前进度'})).appendTo($option).find('input')
        $switch_showQInputProgress.prop('checked', O.showQInputProgress).on('change', function(){
            O.showQInputProgress = $switch_showQInputProgress.prop('checked')
        })
    }

    const $switch_autoSliceAnalysis = $(TPL.OPTIONS_SWITCH.format({title: '框的狠自动分割答案和解析'})).appendTo($option).find('input')
    $switch_autoSliceAnalysis.prop('checked', O.autoSliceAnalysis).on('change', function(){
        O.autoSliceAnalysis = $switch_autoSliceAnalysis.prop('checked')
    })

    const $number_glassMinZoom = $(TPL.OPTIONS_NUMBER.format({title: '放大镜最小放大倍数 [1,5]',hint: '助手提示: 建议设为 1.5-3 倍', min:1, max:5, step:0.1})).appendTo($option).find('input')
    $number_glassMinZoom.val(O.glassMinzoom).on('change', function(){
        O.glassMinzoom = $number_glassMinZoom.val()
    })
    //const $switch_newNum = $(TPL.OPTIONS_SWITCH.format({title: '小题序号是否从 1 开始重新排'})).appendTo($option).find('input')
    //$switch_newNum.prop('checked', O.newNum).on('change', function(){
    //    O.newNum = $switch_newNum.prop('checked')
    //})

    $(TPL.OPTIONS_SEPARATE).appendTo($option)

    const $switch_forceShowPreAcc = $(TPL.OPTIONS_SWITCH.format({title: '未结算时强制显示上月未结'})).appendTo($option).find('input')
    $switch_forceShowPreAcc.prop('checked', O.forceShowPreAcc).on('change', function(){
        O.forceShowPreAcc = $switch_forceShowPreAcc.prop('checked')
    })

    $(TPL.OPTIONS_SEPARATE).appendTo($option)

    const $switch_showHint = $(TPL.OPTIONS_SWITCH.format({title: '显示助手提示'})).appendTo($option).find('input')
    $switch_showHint.prop('checked', O.showHint).on('change', function(){
        O.showHint = $switch_showHint.prop('checked')
    })
    function getUrlFromepNavBg(){
        if (O.epNavBg){
            const m = O.epNavBg.match(/url\((.+)\)/)
            if (m){
                return m[1]
            }
        }
        return ''
    }

    const $switch_epColor = $(TPL.OPTIONS_BUTTON.format({title: '设置护眼色,点击按钮切换'})).appendTo($option).find('button')
    $switch_epColor.find('span').text(EPCOLOR[O.epColor][0])
    $switch_epColor.on('click', function(){
        O.epColor = (O.epColor + 1) % EPCOLOR.length
        refreshNavImage()
        $switch_epColor.find('span').text(EPCOLOR[O.epColor][0])
    })
    const $inputbutton_epNavBg = $(TPL.OPTIONS_INPUTBUTTON.format({title: '自定义左侧导航栏背景图片',text:(O.navImage ? '随机' : '自定义')})).appendTo($option)
    const $button_epNavBg = $inputbutton_epNavBg.find('input').val(getUrlFromepNavBg())
    $button_epNavBg.toggle(!O.navImage)
    $button_epNavBg.on('click', function(){
        V.$prompt('请输入图片地址,什么都不填并确认将恢复为助手默认', '图片地址').then(function(result){
            const url = result.value
            $button_epNavBg.val(url)
            O.epNavBg = url ? 'url(' + url + ')' : ''
            refreshNavImage()
        })
    })
    $inputbutton_epNavBg.find('button').on('click', function(){
        O.navImage = !O.navImage
        $inputbutton_epNavBg.find('span').text(O.navImage ? '随机' : '自定义')
        $button_epNavBg.toggle(!O.navImage)
        refreshNavImage()
    })

    $(TPL.OPTIONS_SEPARATE).appendTo($option)

    const $xusqa = $(TPL.OPTIONS_XUSQA.format({ver: ver})).appendTo($option)
    const $xusqa_kfe = $(TPL.OPTIONS_XUSQA_KFE.format({ver_kfe: ver_kfe})).appendTo($option)
    $(TPL.OPTIONS_MANUAL).appendTo($option)
    $(TPL.OPTIONS_COPYRIGHT).appendTo($option)
    $.get(URL.VER, function(data, status){
        if (status === 'success'){
            const v= JSON.parse(data)
            if (v.ver > ver){
                $xusqa.find('a').text('有新版本 ' + v.ver)
            } else {
                $xusqa.find('a').text('已是最新版本')
            }
            if (v.ver_kfe > ver_kfe){
                $xusqa_kfe.find('a').text('有新版本 ' + v.ver_kfe)
            } else {
                $xusqa_kfe.find('a').text('已是最新版本')
            }
        }
    })
}

function showSalary(){
    const $salaryItem = $('#app > div > div.main-content > div > div > div:nth-child(3)')
    $.get(URL.GET_MY_TASK.format({pageno:1}), function(data){
        if (data.code === 200){
            const d = data.data
            $salaryItem.find('> div:nth-child(4) > div > div.item-cell-value').text(d.totalSalary)
            $salaryItem.find('> div:nth-child(3) > div > div.item-cell-value').text(d.lastMonthSalary)
        }
    })
}

function registerDbsn(){
    clearTimeout(stage.timer.registerDbsn)
    const $sn = $(DOM.DBSN)
    if ($sn.length){
        $sn.dblclick(function(){
            V.$prompt('请确认QQ号是否一致,并输入序列号','序列号').then(function(result){
                    const sn = result.value
                    if (sn){
                        O.sn = sn
                        stage.profile.isValidSN = util.de(sn) === stage.profile.qqnumber
                    }
                })
        })

        UI.setScope('UserCenter')

        showSalary()
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
    const $exit = $(DOM.EXIT)
    const $user = $(DOM.USER)
    function addHeaderButton(text) {
        return helper.cloneButton($exit, text).insertAfter($user)
    }

    UI.setScope('nav')
    UI.setScope('header')

    addHeaderButton(STR.MODULE.TASK_REPORT).click(function(){
        if (stage.role === '题目录入'){
            monthInputTaskReport()
        } else {
            monthCheckTaskReport()
        }

    })
    addHeaderButton(STR.MODULE.TASK_TODAY).click(todayTaskReport)

    const $btnOneKeyGetTask = addHeaderButton(STR.MODULE.ONEKEY_GET_TASK).click(function(){
        return execCommand('doOneKeyGetTask')
    })

    $exit.removeClass()
    $exit.addClass('xu-btn-exit')
    $exit.insertAfter($user)

    const $btnConfig = $(TPL.CONFIG_BUTTON).insertAfter($btnOneKeyGetTask)
    const $config = $(TPL.CONFIG_MAIN).insertAfter($btnConfig)
    $btnConfig.click(function(){
        if ($config.is(':visible')){
            $config.hide()
        } else {
            $config.children('textarea').val(O.onekeyGetTaskSEs)
            //$config.find('input:checkbox').attr('checked', O.showHint)
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
                //O.showHint = $config.find('input:checkbox').prop('checked')
                $config.hide()
                helper.msg.success(STR.CONFIG.SUCCESS + (msg ? msg + '在排除列表,已被自动屏蔽.' : ''))
            } else { // 清空的话自动全部加载
                $config.children('textarea').val(helper.getDefaultSEs())
            }
        }
    })
}

function initUE(){
    clearTimeout(stage.timer.initUETimer)
    if (window.UE){
        U = window.UE
        if (stage.manage){
            doExtendUE()
        } else {
            execCommand('doExtendUE')
        }
    } else{
        stage.timer.initUETimer = setTimeout(initUE, 0)
    }
}

function initVue(){
    clearTimeout(stage.timer.initVueTimer)

    if (window.app && window.app.__vue__){
        V = window.app.__vue__

        stage.manage = V.$store.getters.getPermissionsConfig.manage
        if (!stage.manage){
            for (let i of V.$store.getters.getAccountPermissions){
                if (~['图片裁切', '题目录入', '题目审核'].indexOf(i.name)){
                    stage.role = i.name
                }
            }
            stage.role =stage.role || '题目录入'
        } else {
            stage.role = O.role
        }

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
                } else if (to.name == 'Check'){
                    if (!U){
                        initUE()
                    }
                    doExtendCheckPage()
                } else if (to.name === 'questionsearch'){
                    if (!U){
                        initUE()
                    }
                    doExtendFinalCheckPage()
                } else if (to.name === 'QuestionJudge') {
                    registerQjudgeHint()
                } else if (to.name === 'TaskChoose'){
                    extraTaskList()
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
            const d = data.data
            var a = []
            for(let es of d.permission){
                const se = es.slice(2) + '-' + es.slice(0,2)
                if (SE[se]){
                    a.push(se)
                }
            }
            stage.profile.permission = a
            stage.profile.username = d.username
            stage.profile.qqnumber = d.qqnumber
            stage.profile.isValidSN = util.de(O.sn) === d.qqnumber
            O.passport = stage.profile.isValidSN
        }
    })
}

function waitLogin(){
    function isLogin(){
        if (V && V.$store){
            return V.$store.getters.isLogin
        }
    }

    function onLogin(){
        getProfile()
        registerUI()
    }

    clearTimeout(stage.timer.waitLoginTimer)
    if (isLogin() && $(DOM.USER).length) {
        onLogin()
    } else {
        const now = new Date()
        if (now - stage.startLoginTime < 60*1000*2){ // 最大登录等待时间,超过 2 分钟不再重试
            stage.timer.waitLoginTimer = setTimeout(waitLogin, 1000, onLogin) // 1 秒后重试
        }
    }
}

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
    'doExtendCheckPage': doExtendCheckPage,
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

/**
 * 脚本入口
 */
function init(){
    refreshNavImage()
    initVue()
    waitLogin()
}
init()
/*\
 * API 调用方法：
 * window.xusqapi.fnname(params1,param2,...)
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

    get epNavBg(){
        return O.epNavBg
    },
    set epNavBg(bg){
        O.epNavBg = bg
    },

    get subject(){
        return helper.getInputSubject()
    },

    get education(){
        return helper.getInputEducation()
    },

    get passport(){
        return O.passport
    },

    get clearFlag(){
        return O.clearFlag
    },
    set clearFlag(clearFlag){
        O.clearFlag = clearFlag
    },

    get ver(){
        return ver
    },

    get ver_kfe(){
        return ver_kfe
    },
    set ver_kfe(ver){
        ver_kfe = ver
    },

    get optimizeQJudgeShow(){
        return O.optimizeQJudgeShow
    },
    set optimizeQJudgeShow(b){
        O.optimizeQJudgeShow = b
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
        ruleHelper.saveUserRules()
    },

    saveQuestion: function(){
        helper.saveQuestion()
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

    fixReport: function(stopDate){
        const r = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/
        if (r.test(stopDate)){
            S.removeItem('xusqa_acc_premonth')
            monthInputTaskReport(new Date(stopDate).getTime())
        } else {
            C.log('命令日期格式错误，请使用以下格式: xusqapi.fixReport(\'2018-08-01\')')
        }
    },

    queryQInputProgress: function(){
        queryQInputProgress(function(totalcount, current, inputcount){
            C.log('进度' + current + '/' + totalcount + '(已录入' + inputcount + '题)')
        })
    },

    getScope: function(name){
        return UI.css_scope[name]
    },

    replace: function(uid, regexp, replacement){
        const u = helper.getEditor(uid)
        u.body.innerHTML = u.body.innerHTML.replace(regexp, replacement)
    },

    report: function(dStart, dEnd){
        report(dStart, dEnd)
    },

    preMonthTaskReport: function(){
        preMonthTaskReport()
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