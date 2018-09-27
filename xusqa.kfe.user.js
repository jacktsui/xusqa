// ==UserScript==
// @name         有道搜题录题助手-公式
// @namespace    jacktsui
// @version      0.2.078
// @description  有道搜题,录题员助手(公式加强)
// @author       Jacktsui
// @copyright    © 2018, 徐。355088586@qq.com
// @license      MIT https://mit-license.org/
// @homepageURL  https://github.com/jacktsui/xusqa/blob/master/manual/README.md
// @supportURL   https://github.com/jacktsui/xusqa/issues
// @UpdateURL    https://github.com/jacktsui/xusqa/raw/master/xusqa.kfe.user.js
// @match        http://searchq-editsys.youdao.com/static/Ueditor/kityformula-plugin/*
// @grant        none
// @run-at       document-end
// @note         2018-09-23 初版,化学方程式,数学简单公式
// ==/UserScript==

(function() {
    'use strict';

//const ver = 'Ver 0.2.078'

const xusqapi = window.top.xusqapi
if (!xusqapi.passport){
    return
}
if ('化学,数学'.indexOf(xusqapi.subject) < 0){
    return
}
let ue, kfe

function mathLatexParse(str){
    const oparr = {'/': '\\frac', '\\': '\\sqrt'}
    function exp(l, o, r){
        if (~['^', '_',].indexOf(o)){
            return '{' + l + '}' + o + '{' + r + '}'
        } else if(~['/',].indexOf(o)){
            return '{' + oparr[o] + ' {' + l + '} {' + r + '}' + '}'
        } else if(~['\\',].indexOf(o)){
            return '{' + oparr[o] + ' {' + r + '}' + '}'
        } else if (o === '&') {
            return '{' + l + '}{' + r + '}'
        }

        return ''
    }

    // 简单文法解析器
    function parse(str){
        let cake = '', l = '', r = '', o = '', result = ''
        let flag = 0
        for(let i in str){
            if(str[i] === '{'){
                flag ++
            } else if (str[i] === '}') {
                flag --
            }

            if (flag === 0){
                if (cake){
                    cake = cake.slice(1)
                    if (o){
                        r = parse(cake)
                    } else {
                        l = parse(cake)
                    }
                    if (l && o && r){
                        result += exp(l, o, r)
                        l = ''; o = ''; r = ''
                    }
                    cake = ''
                }
                if (~['^', '_', '/','\\', '&',].indexOf(str[i])){
                    o = str[i]
                } else if(str[i] !== '}') {
                    result += str[i]
                }
            } else {
                cake += str[i]
            }
        }

        return result || l
    }

    function priorityProc(str){
        let flag = 0
        let pos = str.indexOf('\\')
        let i = pos + 1
        for(; i < str.length; i++){
            if (str[i] === '{'){
                flag++
            } else if (str[i] === '}'){
                flag--
            }

            if (flag === 0){
                return str.slice(0, pos) + '{{NIL}\\' + str.slice(pos+1, i+1) + '}'
            }
        }
        return ''
    }

    str = str.replace(/\s+/g, '')
    str = str.replace(/(\/\/)/g, '\\') // //转化成单字符\
    let re
    re = /(\d+|\(.+\)|[a-z])([\^_/\\])/g
    while(str.match(re)){
        str = str.replace(re, '{$1}$2')
    }
    re = /([\^_/\\])(\d+|\(.+\)|[a-z])/g
    while(str.match(re)){
        str = str.replace(re, '$1{$2}')
    }

    // 优先级
    str = priorityProc(str)
    str = str.replace('}{', '}&{')

    return parse(str)
}

function txt2LaTex(str){
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

        //str = str.replace(/([A-Z]|[A-Z][a-z])<sub>(\d+[+-]*)<\/sub>/g, '{$1}_{$2}')
        str = str.replace(/([A-Z][a-z]*)(\d+)/g, '{$1}_{$2}')

        for (let i of arrow){
            str = str.replace(i[0], i[1])
        }

        return str
    } else if(xusqapi.subject === '数学'){
        /*
        str = str.replace(/\/\/({[^}]+}|[a-z0-9]+|.)/g, '\\sqrt $1')
        str = str.replace(/({[^}]+}|.)\/({[^}]+}|[a-z0-9]+|.)/g, '\\frac {$1} {$2}')

        str = str.replace(/(\([^\)]+\)|[a-z])^(\d+)/g, '{$1}^{$2}')
        str = str.replace(/(\([^\)]+\)|[a-z])_(\d+)/g, '{$1}_{$2}')

        // 向量
        str = str.replace(/([|·=+-]|^)([A-Z]{2})([|·=+-]|$)/g,'$1\\overrightarrow{$2}$3')
        str = str.replace(/([·=+-])([A-Z]{2})([·=+-]|$)/g,'$1\\overrightarrow{$2}$3') // 第一遍有被跳过去的
        */
        return mathLatexParse(str)
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
        ue = window.editor
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

xusqapi.mathLatexParse = mathLatexParse
xusqapi.laTex = laTex

})()
/*!
 * 本脚本使用 MIT 协议
 *
 * MIT许可证（MIT）
 * 版权所有 © 2018 徐。355088586@qq
 * 
 */