/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ajax.org Code Editor (ACE).
 *
 * The Initial Developer of the Original Code is
 * Ajax.org B.V.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      André Fiedler <fiedler dot andre a t gmail dot com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK *****
 */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var ShHighlightRules = function() {
    // http://sh.net/manual/en/reserved.keywords.sh
    var reservedKeywords = lang.arrayToMap(
        '!|{|}|case|do|done|elif|else|'+
        'esac|fi|for|if|in|then|until|while'+
        ).split('|')
    );

    // http://sh.net/manual/en/reserved.keywords.sh
    var languageConstructs = lang.arrayToMap(
            // TODO
        ('echo|exit|eval|source').split('|')
    );

    var builtinVariables = lang.arrayToMap(
            // TODO
        ('$?|$$|$!|$SHLVL').split('|')
    );

    this.$rules = {
        "start" : [
            {
               token : "comment",
               regex : "#.*$"
            },
            docComment.getStartRule("doc-start"),
            {
                token : "string.regexp",
                regex : "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/][gimy]*\\s*(?=[).,;]|$)"
            }, {
                token : "string", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
            }, {
                token : "string", // multi line string start
                regex : '["].*\\\\$',
                next : "qqstring"
            }, {
                token : "string", // single line
                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
            }, {
                token : "string", // multi line string start
                regex : "['].*\\\\$",
                next : "qstring"
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : function(value) {
                    if (reservedKeywords.hasOwnProperty(value))
                        return "keyword";
                    else if (builtinConstants.hasOwnProperty(value))
                        return "constant.language";
                    else if (builtinVariables.hasOwnProperty(value))
                        return "variable.language";
                    else if (futureReserved.hasOwnProperty(value))
                        return "invalid.illegal";
                    else if (builtinFunctions.hasOwnProperty(value))
                        return "support.function";
                    else if (value == "debugger")
                        return "invalid.deprecated";
                    else
                        if(value.match(/^(\$[a-zA-Z][a-zA-Z0-9_]*|self|parent)$/))
                            return "variable";
                        return "identifier";
                },
                // TODO: Unicode escape sequences
                // TODO: Unicode identifiers
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "keyword.operator",
                regex : "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
            }, {
                token : "lparen",
                regex : "[[({]"
            }, {
                token : "rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ],
        "qqstring" : [
            {
                token : "string",
                regex : '(?:(?:\\\\.)|(?:[^"\\\\]))*?"',
                next : "start"
            }, {
                token : "string",
                regex : '.+'
            }
        ],
        "qstring" : [
            {
                token : "string",
                regex : "(?:(?:\\\\.)|(?:[^'\\\\]))*?'",
                next : "start"
            }, {
                token : "string",
                regex : '.+'
            }
        ],
        "htmlcomment" : [
             {
                 token : "comment",
                 regex : ".*?-->",
                 next : "start"
             }, {
                 token : "comment",
                 regex : ".+"
             }
         ],
         "htmltag" : [
             {
                 token : "meta.tag",
                 regex : ">",
                 next : "start"
             }, {
                 token : "text",
                 regex : "[-_a-zA-Z0-9:]+"
             }, {
                 token : "text",
                 regex : "\\s+"
             }, {
                 token : "string",
                 regex : '".*?"'
             }, {
                 token : "string",
                 regex : "'.*?'"
             }
         ],
        "css" : [
             {
                 token : "meta.tag",
                 regex : "<\/style>",
                 next : "htmltag"
             }, {
                 token : "meta.tag",
                 regex : ">",
             }, {
                 token : 'text',
                 regex : "(?:media|type|href)"
             }, {
                 token : 'string',
                 regex : '=".*?"'
             }, {
                 token : "paren.lparen",
                 regex : "\{",
                 next : "cssdeclaration",
             }, {
                 token : "keyword",
                 regex : "#[A-Za-z0-9\-\_\.]+"
             }, {
                 token : "variable",
                 regex : "\\.[A-Za-z0-9\-\_\.]+"
             }, {
                 token : "constant",
                 regex : "[A-Za-z0-9]+"
             }
         ],
         "cssdeclaration" : [
             {
                 token : "support.type",
                 regex : "[\-a-zA-Z]+",
                 next  : "cssvalue"
             },
             {
                 token : "paren.rparen",
                 regex : '\}',
                 next : "css"
             }
         ],
         "cssvalue" : [
               {
                   token : "text",
                   regex : "\:"
               },
               {
                   token : "constant",
                   regex : "#[0-9a-zA-Z]+"
               },
               {
                   token : "text",
                   regex : "[\-\_0-9a-zA-Z\"' ,%]+"
               },
               {
                   token : "text",
                   regex : ";",
                   next : "cssdeclaration"
               }
         ],
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ new DocCommentHighlightRules().getEndRule("start") ]);
};

oop.inherits(ShHighlightRules, TextHighlightRules);

exports.ShHighlightRules = ShHighlightRules;
});
