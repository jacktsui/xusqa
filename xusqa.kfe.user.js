// ==UserScript==
// @name         有道搜题录题助手-公式
// @namespace    jacktsui
// @version      0.4.123
// @description  有道搜题,录题员助手(公式加强)
// @author       Jacktsui
// @copyright    © 2018, 徐。355088586@qq.com
// @license      MIT https://mit-license.org/
// @homepageURL  https://github.com/jacktsui/xusqa/blob/master/manual/README.md
// @supportURL   https://github.com/jacktsui/xusqa/issues
// @UpdateURL    https://github.com/jacktsui/xusqa/raw/master/xusqa.kfe.user.js
// @match        http://searchq-editsys.youdao.com/
// @match        http://searchq-editsys.youdao.com/static/Ueditor/kityformula-plugin/kityFormulaDialog.html
// @grant        none
// @run-at       document-end
// @note         2018-09-23 初版,化学方程式,数学公式
// ==/UserScript==

(function() {
    'use strict';

const ver = '0.4.123'

const xusqapi = window.top.xusqapi
if (!xusqapi){
    return
} else {
    xusqapi.ver_kfe = ver
}
if (window.self === window.top){
    return
}

if (!xusqapi.passport){
    return
}
if ('化学,数学,物理'.indexOf(xusqapi.subject) < 0){
    return
}
let kfe

function mathLatexParse(str){
    const oparr = {'/': '\\frac', '√': '\\sqrt', '²': '^', '₂': '_'}
    function exp(l, o, r){
        if (~['²', '₂',].indexOf(o)){
            return '{' + l + '}' + oparr[o] + '{' + r + '}'
        } else if(~['/',].indexOf(o)){
            return '{' + oparr[o] + ' {' + l + '} {' + r + '}}'
        } else if(~['√',].indexOf(o)){
            return '{' + oparr[o] + ' {' + r + '}}'
        }
        throw new Error('kfe faild!')
    }

    function parse(str){
        const ops = ['₂', '²', '√', '/'] //优先级
        function left(str, pos){
            let i = pos - 1
            let flag = 0
            for(; i >= 0; i--){
                if (str[i] === '}'){
                    flag++
                } else if (str[i] === '{'){
                    flag--
                }
                if (flag === 0){
                    return i
                }
            }
            throw new Error('kfe failed!')
        }
        function right(str, pos){
            let i = pos + 1
            let flag = 0
            for(; i < str.length; i++){
                if (str[i] === '{'){
                    flag ++
                } else if (str[i] === '}'){
                    flag --
                }
                if (flag === 0){
                    return i
                }
            }
            throw new Error('kfe failed!')
        }

        for (let op of ops){
            let c = 0
            let pos = str.indexOf(op)
            while (~pos){
                let l = '', r = ''
                if (~pos){
                    if (op === '√'){
                        r = right(str, pos)
                        str = str.slice(0, pos) + exp('', op, str.slice(pos+1, r+1)) + str.slice(r+1)
                    } else {
                        l = left(str, pos)
                        r = right(str, pos)
                        str = str.slice(0, l) + exp(str.slice(l, pos), op, str.slice(pos+1, r+1)) + str.slice(r+1)
                    }
                }
                pos = str.indexOf(op)
                if (++c > 9){ // 最多十次防止死循环,理论上不会发生
                    break
                }
            }
        }
        return str
    }

    str = str.replace(/\s+/g, '')
    str = str.replace(/(\/\/|\\)/g, '√')
    str = str.replace(/\^/g, '²')
    str = str.replace(/\_/g, '₂')
    let re
    let wc = 0
    re = /(\d+|\(.+\))([²₂/])/g
    while(str.match(re)){
        str = str.replace(re, '{$1}$2')
        if (++wc > 9){ // 防卡死,理论上不会卡死
            break
        }
    }
    wc = 0
    re = /([²₂√/])(\d+|\(.+\))/g
    while(str.match(re)){
        str = str.replace(re, '$1{$2}')
        if (++wc > 9){ // 防卡死,理论上不会卡死
            break
        }
    }

    return parse(str)
}

function txt2LaTex(str){
    const _str = str
    const arrow = [
        ['=', '\\xlongequal {\\placeholder } {\\placeholder }'],
        ['→', '\\xlongequal {\\placeholder } {\\placeholder }'],
        ['⇌', '\\xrightleftharpoons {\\placeholder } {\\placeholder }'],
    ]
    if (xusqapi.subject === '化学'){
        str = str.replace(/(\([a-zA-Z0-9]+\))(\d+)/g, '{$1}_{$2}')

        str = str.replace(/\((\w*)([A-Z][a-z]*)(\d)(\d*[+-])\)/g, '($1{$2}^{$4}_{$3})')
        str = str.replace(/([A-Z][a-z]*)(\d)(\d*[+-])([+=-])/g, '{$1}^{$3}_{$2}$4')
        str = str.replace(/([A-Z][a-z]*)(\d)(\d*[+-])$/g, '{$1}^{$3}_{$2}')

        str = str.replace(/\((\w*)([A-Z][a-z]*)([+-])\)/g, '($1{$2}^{$3})')
        str = str.replace(/([A-Z][a-z]*)([+-])([+=-])/g, '{$1}^{$2}$3')
        str = str.replace(/([A-Z][a-z]*)([+-])$/g, '{$1}^{$2}')

        str = str.replace(/([A-Z][a-z]*)(\d+)/g, '{$1}_{$2}')

        for (let i of arrow){
            str = str.replace(i[0], i[1])
        }

        if (str === _str){
            str = mathLatexParse(str)
        }
        return str
    } else if(~['数学','物理'].indexOf(xusqapi.subject)){
        const _str = str
        str = str.replace(/([|·=+-]|^)([A-Z]{2})([|·=+-]|$)/g,'$1\\overrightarrow{$2}$3')
        str = str.replace(/([·=+-])([A-Z]{2})([·=+-]|$)/g,'$1\\overrightarrow{$2}$3') // 第一遍有被跳过去的

        if (str === _str){
            str = mathLatexParse(str)
        }
        return str
    }
}

function laTex(laTex){
    kfe.execCommand('render', laTex)
}

let timer
function inikfe(){
    clearTimeout(timer)
    if (window.kfe){
        kfe = window.kfe
        const ue = window.editor
        ue.focus()
        const txt = ue.selection.getText()
        if (txt){
            kfe.execCommand('render', txt2LaTex(txt))
        }
        kfe.execCommand('focus')
    } else {
        timer = setTimeout(inikfe, 100)
    }
}
inikfe()

xusqapi.txt2LaTex = txt2LaTex
xusqapi.laTex = laTex

})()
/*!
 * 本脚本使用 MIT 协议
 * 版权所有 © 2018 徐。355088586@qq
 * 
 */