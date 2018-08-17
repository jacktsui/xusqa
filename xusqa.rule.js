(function($) {
    'use strict';

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
    TAB: '&nbsp;&nbsp;&nbsp;&nbsp;',
    US6: '______',
    US3: '___',
    HR: '</p><hr/><p>',
    P: '</p><p>',
    ULB: '<span style="text-decoration: underline;">', ULE: '</span>',
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
    [/00\s*([上中与于的])/g, '⊙O $1', '数学'],
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

    [/kW\.h/, 'kW·h', '物理'], // 单位TODO:需要收集更多的单位,形成字典

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
    [/10(-[1-9][0-9]*)\s*([a-zA-Z])/g, '10<sup>$1</sup>$2'], // 10-2 mol
    [/(\d+)\s*[Xx×]\s*10([1-9][0-9]*)/g, '$1×10<sup>$2</sup>', '物理,化学'], // 识别科学计数法
    [/\(([a-z])([0-2])(\s*,\s*[a-z])([0-2])(\s*\))/g, '$1<sub>$2</sub>$3<sub>$4</sub>$5', '数学'], // D(x1 ,x2) 识别坐标
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
    [/([^\.])\.\s*\.([^\.])/g, '$1...$2', '英语'],
    [/([\u4E00-\u9FA5])[\s…]+([\u4E00-\u9FA5])/g, '$1……$2', '英语', '2'], // 英语解析
    [/([\u4E00-\u9FA5])\s+([\u4E00-\u9FA5])/g, '$1……$2', '语文', '^1'], // 语文排除答案
]

/**
 * 处理的是ORC返回的结果,最先执行,只对框的准有效,自动执行
 * 先留出接口,备用,暂时用不到
 */
//const ORCRULE = [
//]
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
        //const b = O.newNum
        const ra = []
        const r = /([^0-9\()])(\d{1,2})([\.,·]*)([^0-9\)])/g
        const m = str.match(r)
        if (m && m.length > 2){
            let start = getStartFromMatch(m), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur - start === num - 1){ // 效验
                    ra.push([e[0], e.index, e[1] + ((uid !== 0 && num === 1) ? '' : DIC.HR) + /*(b ? num : e[2])*/num + '.' + e[4]])
                    num++
                }
                e = r.exec(str)
            }
            if (num > 3){
                return replByMatch(str, ra)
            } 
        }
    }, '语文'],
    [function(str){
        //const b = O.newNum
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
                    ra.push([e[0], e.index, DIC.US3 + /*(b ? num : cur)*/num + DIC.US3])
                    num++
                }
                e = r.exec(str)
            }
            if (num > 3){
                str = replByMatch(str, ra)
                type = 0
            }
        }

        ra.splice(0,ra.length)
        r = /([A-Za-z]+:\s)/g
        m = str.match(r)
        if (m && m.length > 2){ // 判断是不是补全对话(考虑根据题目要求“根据对话内容,从方框内选出能填入空白处的最佳选项。其中有两项为多余选项。”判断是不是补全对话)
            //r = /([A-Za-z]+:\s)(\d{1,2})\.*(\s)/g
            r = /(\s)(\d{1,2})[,\.\s]/g
            let start = getStartFromMatch(str.match(r)), cur = -1
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
                str = replByMatch(str, ra)
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

            let start = getStartFromMatch(str.match(r)), cur = -1, num = 1
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
                str = replByMatch(str, ra)
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
            let start = getStartFromMatch(str.match(r)), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[3])
                if (cur - start === num - 1){ // 严格模式
                    ra.push([e[0], e.index, e[1] + DIC.HR + (e[2].length === 1 ? '()' : e[2]) + (b ? num : cur) + '.' + e[5]])
                    num++
                }
                e = r.exec(str)
            }

            if (num > 3){
                str = replByMatch(str, ra)
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

        r = /(\s)([b-z])(\s)/g
        m = str.match(r)
        if (m && m.length > 2){ // 单词首字母补全
            str = str.replace(r, '$1$2' + DIC.US6 + '$3')
        }

        return str
    }, '英语', '0'],

    [function(str){ // 答案页分隔符
        //const b = O.newNum
        const r = /(\D)(\d{1,2})([\.,]*)(\D)/g
        const ra = []
        const m = str.match(r)
        if (m && m.length > 2){
            let start = getStartFromMatch(m), cur = -1, num = 1
            let e = r.exec(str)
            while(e){
                cur = parseInt(e[2])
                if (cur - start === num - 1){ //答案也加入序列号验证
                    ra.push([e[0], e.index, e[1] + (num === 1 ? '' : DIC.HR) + /*(b ? num : cur)*/num + '.' + e[4]])
                    num++
                }
                e = r.exec(str)
            }
            return replByMatch(str, ra)
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

            return replByMatch(str, ra)
        }
    }, '英语', '0'],

    [/[A-G]{4,}/,function(_){ // 英语答案 ABCDABCD,多于4个开始执行
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

$.oneKeyFormat = {
    _subject, _uid,
    get subject(){
        return this._subject
    },
    set subject(subject){
        this._subject = subject
    },

    get uid(){
        return this._uid
    },
    set uid(uid){
        this._uid = uid
    },

    preFormat: function(html) {
        html = execReplRules(html, PRERULE, this._subject, this._uid)
        return html
    },

    format: function(str) {
        str = execReplRules(str, USRRULE, this._subject, this._uid)
        str = execReplRules(str, RULE, this._subject, this._uid)
        return str
    },

    afterFormat: function(html){
        html = execReplRules(html, AFTRULE, this._subject, this._uid)
        return html
    }
}

function getStartFromMatch(arr){
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
}

function replByMatch(str, arr){
    for(let i = arr.length - 1; i >= 0; i--){
        str = str.slice(0, arr[i][1]) + arr[i][2] + str.slice(arr[i][1] + arr[i][0].length)
    }
    return str
}

const whiteList = [355088586,2315570388,550431353,893352067,1758861613,690341392,287403972,1535125996,834629260,1049471106]
$.xu = function(qq){
    return whiteList.indexOf(qq) != -1        
}

})(/* jshint -W117 */jQuery);
