// ==UserScript==
// @name         Syntax colouring
// @namespace    http://tampermonkey.net/
// @version      0.1
// @updateURL    https://github.com/AdamDnd/GamersPlaneScripts/raw/main/Syntax%20colouring.user.js
// @downloadURL  https://github.com/AdamDnd/GamersPlaneScripts/raw/main/Syntax%20colouring.user.js
// @description  Add syntax colouring to Gamers' Plane BBCode entry
// @author       Adam
// @match        https://mapdm.com/forums/thread/*
// @match        https://mapdm.com/forums/post/*
// @match        https://mapdm.com/forums/editPost/*
// @match        https://mapdm.com/characters/custom/*
// @match        https://mapdm.com/forums/newThread/*
// @match        https://gamersplane.com/forums/thread/*
// @match        https://gamersplane.com/forums/post/*
// @match        https://gamersplane.com/forums/editPost/*
// @match        https://gamersplane.com/forums/newThread/*
// @match        https://gamersplane.com/characters/custom/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gamersplane.com
// @grant        GM_addStyle
// ==/UserScript==
/* globals jQuery, $ */

(function() {
    'use strict';

    var css=`
.markitUpEditorContainer {
position: relative;
border: solid 1px #64656b;
border-radius: 0 0 6px 6px;
overflow:hidden;
}
.markitUpEditorContainer .markItUpEditor,
.markitUpEditorContainer .markItUpEditorSyntax {
margin: 0px;
padding: 10px;
border: 0;

font-size: 11pt;
line-height: 14pt;
tab-size: 2;
}
.markitUpEditorContainer .markItUpEditor{
position: relative;
z-index: 1;
color: transparent;
background: transparent;
}
.markitUpEditorContainer .markItUpEditorSyntax {
position: absolute;
top: 0;
left: 0;
bottom: 0;
overflow-y: auto;
width: 100%;
box-sizing: border-box;
white-space: pre-wrap;
z-index: 0;
}

.markitUpEditorContainer .markItUpEditor {
caret-color: #000;
}

body.dark .markitUpEditorContainer .markItUpEditor {
caret-color: #fff;
}

/* syntax colouring */

.markitUpEditorContainer .markItUpEditorSyntax .miuHSTag {
color: #cc6600;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockb {
color: blue;
}
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockb {
color:#66f;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlocki {
color: #009828;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockquote {
color: #888;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockAbilityHeading {
background-color: #fea;
}

body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockAbilityHeading {
color: #000;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSTag_Var,
.markitUpEditorContainer .markItUpEditorSyntax .miuHSTag_Calc {
color: red;
}
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSTag_Var,
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSTag_Calc {
color: #f55;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSTagabilities {
color: green;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockimg,
.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockmap,
.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockurl,
.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockpoll,
.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlocknpc,
.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockzoommap{
background-color:#ddd;
}
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockimg,
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockmap,
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockurl,
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockpoll,
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlocknpc,
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockzoommap{
background-color:#242424;
}

.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockooc,
.markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockooc .miuHSTagooc{
color:#009;
font-style:italic;
}

body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockooc,
body.dark .markitUpEditorContainer .markItUpEditorSyntax .miuHSBlockooc .miuHSTagooc{
color:#77b;
}

/* not needed with new release */
.markItUpHeader ul li{
float:none;
display:inline-block;
}

body .markItUpHeader ul .markItUpSeparator{
vertical-align:top;
}

`;
    GM_addStyle(css);

    $('.markItUpEditor').each(function(){
        var textarea=$(this);
        if(textarea.closest('.markitUpEditorContainer').length==0){
            textarea.wrap("<div class='markitUpEditorContainer'></div>");
            var wrapper=textarea.closest('.markitUpEditorContainer');
            var syntaxHighlighter=$('<div class="markItUpEditorSyntax"></div>').appendTo(wrapper);

            textarea.on('input',function(){updateWrapper($(this).val());syncScroll($(this));});
            textarea.on('scroll',function(){syncScroll($(this));});

            var updateWrapper=function(text) {
                if(text[text.length-1] == "\n") {
                    text += " ";
                }
                text=text.replace(/\[b\](.*?)\[\/b\]/msg,"<span class='miuHSBlock miuHSBlockb'>$&</span>");
                text=text.replace(/\[i\](.*?)\[\/i\]/msg,"<span class='miuHSBlock miuHSBlocki'>$&</span>");
                text=text.replace(/\[quote(?:=\"?([^\"\]]+?)\"?)?\](.*?)\[\/quote\]/msg,"<span class='miuHSBlock miuHSBlockquote'>$&</span>");
                text=text.replace(/\[img\](.*?)\[\/img\]/msg,"<span class='miuHSBlock miuHSBlockimg'>$&</span>");
                text=text.replace(/\[map\](.*?)\[\/map\]/msg,"<span class='miuHSBlock miuHSBlockmap'>$&</span>");
                text=text.replace(/\[url\="?(.*?)"?\](.*?)\[\/url\]/ms,"<span class='miuHSBlock miuHSBlockurl'>$&</span>");
                text=text.replace(/\[url\](.*?)\[\/url\]/msg,"<span class='miuHSBlock miuHSBlockurl'>$&</span>");
                text=text.replace(/\[note="?(\w[\w\. +;,]+?)"?](.*?)\[\/note\]\s*/sg,"<span class='miuHSBlock miuHSBlocknote'>$&</span>");
                text=text.replace(/\[private="?(\w[\w\. +;,]+?)"?](.*?)\[\/private\]\s*/sg,"<span class='miuHSBlock miuHSBlockprivate'>$&</span>");
                text=text.replace(/\[poll=\"?(.*?)?\"([^\]]*)\](.*?)\[\/poll\]/msg,"<span class='miuHSBlock miuHSBlockpoll'>$&</span>");
                text=text.replace(/\[npc=\"?(.*?)\"?\](.*?)\[\/npc\]*/msg,"<span class='miuHSBlock miuHSBlocknpc'>$&</span>");
                text=text.replace(/\[zoommap\="?(.*?)"?\](.*?)\[\/zoommap\]/msg,"<span class='miuHSBlock miuHSBlockzoommap'>$&</span>");
                text=text.replace(/[\r\n]*\[ooc\](.*?)\[\/ooc\][\r\n]*/msg,"<span class='miuHSBlock miuHSBlockooc'>$&</span>");

                text=text.replace(/\[\/?([^\_\=\]\s]+)[^\]]*\]/gm,"<span class='miuHSTag miuHSTag$1'>$&</span>");
                text=text.replace(/\[_[\w_]*\$\=[^\]]*\]/g,"<span class='miuHSTag miuHSTag_Calc'>$&</span>");
                text=text.replace(/\[_[\w_]*\=[^\]]*\]/g,"<span class='miuHSTag miuHSTag_Var'>$&</span>");
                text=text.replace(/^[\s]*(#.*)/gm,"<span class='miuHSBlock miuHSBlockAbilityHeading'>$&</span>");

                syntaxHighlighter.html(text);
            };

            var syncScroll=function (pThis) {
                syntaxHighlighter[0].scrollTop = pThis[0].scrollTop;
                syntaxHighlighter[0].scrollLeft = pThis[0].scrollLeft;
            };

            updateWrapper(textarea.val());
            syncScroll(textarea);
            $(document).on('gp.characterloaded',function(ev,params){
                updateWrapper(params.notes);
                syncScroll(textarea);
            });

        }
    });
})();