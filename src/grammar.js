// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

	const unescape = (str) =>
		str.replace(/\\(.)/g, (_, ch) => {
			switch (ch) {
			case 'b': return '\b';
			case 'f': return '\f';
			case 'n': return '\n';
			case 'r': return '\r';
			case 't': return '\t';
			case 'v': return '\v';
			default: return ch;
			}
		});
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "start", "symbols": ["_", "selectors", "_"], "postprocess": d => d[1]},
    {"name": "start", "symbols": ["_"]},
    {"name": "selectors$ebnf$1", "symbols": []},
    {"name": "selectors$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "selector"]},
    {"name": "selectors$ebnf$1", "symbols": ["selectors$ebnf$1", "selectors$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "selectors", "symbols": ["selector", "selectors$ebnf$1"], "postprocess": 
        d =>
        	d[1].length === 0
        		? d[0]
        		: {
        			type: "list",
        			list: [d[0], ...d[1].map(s => s[3])]
        		}
        },
    {"name": "combinator", "symbols": ["_", {"literal":"~"}, "_"], "postprocess": () => "sibling"},
    {"name": "combinator", "symbols": ["_", {"literal":"+"}, "_"], "postprocess": () => "adjacent"},
    {"name": "combinator", "symbols": ["_", {"literal":">"}, "_"], "postprocess": () => "child"},
    {"name": "combinator", "symbols": [{"literal":" "}, "_"], "postprocess": () => "descendant"},
    {"name": "selector", "symbols": ["sequence"], "postprocess": d => d[0]},
    {"name": "selector", "symbols": ["selector", "combinator", "sequence"], "postprocess": 
        		  	([left, combinator, right], _, reject) => {
        	if (left === null ||
        		right === null) {
        		return reject;
        	}
        
        	return ({
        		type: "complex",
        		combinator,
        		left,
        		right,
        	})
        }
        		  },
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[ ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": _ => null},
    {"name": "sequence$ebnf$1", "symbols": [{"literal":"!"}], "postprocess": id},
    {"name": "sequence$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "sequence$ebnf$2", "symbols": ["startAtom"], "postprocess": id},
    {"name": "sequence$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "sequence$ebnf$3", "symbols": []},
    {"name": "sequence$ebnf$3", "symbols": ["sequence$ebnf$3", "specifierAtom"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "sequence", "symbols": ["sequence$ebnf$1", "sequence$ebnf$2", "sequence$ebnf$3"], "postprocess": 
        ([subject, startAtom, specifierAtoms], _, reject) => {
        	if (startAtom === null &&
        		specifierAtoms.length === 0) {
        		return reject;
        	}
        	let result;
        	if (specifierAtoms.length === 1 &&
        		startAtom === null) {
        		result = specifierAtoms[0];
        	} else if (specifierAtoms.length > 0) {
        		result = {
        			type: "compound",
        			list: startAtom === null
        				? specifierAtoms
        				: [startAtom, ...specifierAtoms]
        		};
        	} else {
        		result = startAtom;
        	}
        
        	if (subject !== null) {
        		result = {
        			type: "subject",
        			argument: result,
        		}
        	}
        
        	return result;
        },
        },
    {"name": "startAtom", "symbols": ["wildcard"], "postprocess": id},
    {"name": "startAtom", "symbols": ["identifier"], "postprocess": 
        d => ({
        	type: "type",
        	name: d[0],
        })
        },
    {"name": "specifierAtom$subexpression$1", "symbols": ["field"]},
    {"name": "specifierAtom$subexpression$1", "symbols": ["attr"]},
    {"name": "specifierAtom$subexpression$1", "symbols": ["pseudoSelector"]},
    {"name": "specifierAtom", "symbols": ["specifierAtom$subexpression$1"], "postprocess": 
        d => d[0][0]
        },
    {"name": "wildcard", "symbols": [{"literal":"*"}], "postprocess": d => ({type: 'wildcard'})},
    {"name": "identifier$ebnf$1", "symbols": []},
    {"name": "identifier$ebnf$1", "symbols": ["identifier$ebnf$1", /[_a-zA-Z0-9-]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "identifier", "symbols": [/[_a-zA-Z]/, "identifier$ebnf$1"], "postprocess": d => d[0] + d[1].join("")},
    {"name": "field", "symbols": [{"literal":"."}, "identifier"], "postprocess": 
        d => ({
        	type: 'field',
        	name: d[1],
        })
        },
    {"name": "float$ebnf$1", "symbols": [/[\+-]/], "postprocess": id},
    {"name": "float$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "float$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "float$ebnf$2", "symbols": ["float$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "float$ebnf$3", "symbols": []},
    {"name": "float$ebnf$3", "symbols": ["float$ebnf$3", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "float", "symbols": ["float$ebnf$1", "float$ebnf$2", {"literal":"."}, "float$ebnf$3"], "postprocess": 
        d => parseFloat(
        	((d[0] === "-") ? "-" : "") +
        	d[1].join("") + "." + d[3].join("")
        )
        },
    {"name": "integer$ebnf$1", "symbols": [/[\+-]/], "postprocess": id},
    {"name": "integer$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "integer$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "integer$ebnf$2", "symbols": ["integer$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer", "symbols": ["integer$ebnf$1", "integer$ebnf$2"], "postprocess": 
        d => parseInt(
        	((d[0] === "-") ? "-" : "") +
        	d[1].join("")
        )
        },
    {"name": "number", "symbols": ["float"]},
    {"name": "number", "symbols": ["integer"], "postprocess": id},
    {"name": "attr", "symbols": [{"literal":"["}, "_", "attrValue", "_", {"literal":"]"}], "postprocess": d => d[2]},
    {"name": "attrEqOps$ebnf$1", "symbols": [{"literal":"!"}], "postprocess": id},
    {"name": "attrEqOps$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "attrEqOps", "symbols": ["attrEqOps$ebnf$1", {"literal":"="}], "postprocess": d => (d[0] !== null ? "!" : "") + d[1]},
    {"name": "attrNumOps", "symbols": [/[><]/], "postprocess": id},
    {"name": "attrNumOps$subexpression$1$string$1", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "attrNumOps$subexpression$1", "symbols": ["attrNumOps$subexpression$1$string$1"]},
    {"name": "attrNumOps$subexpression$1$string$2", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "attrNumOps$subexpression$1", "symbols": ["attrNumOps$subexpression$1$string$2"]},
    {"name": "attrNumOps", "symbols": ["attrNumOps$subexpression$1"], "postprocess": 
        d => d[0].join("")
        },
    {"name": "attrNumOps", "symbols": ["attrEqOps"], "postprocess": id},
    {"name": "attrStrOps$subexpression$1$string$1", "symbols": [{"literal":"^"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "attrStrOps$subexpression$1", "symbols": ["attrStrOps$subexpression$1$string$1"]},
    {"name": "attrStrOps$subexpression$1$string$2", "symbols": [{"literal":"$"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "attrStrOps$subexpression$1", "symbols": ["attrStrOps$subexpression$1$string$2"]},
    {"name": "attrStrOps$subexpression$1$string$3", "symbols": [{"literal":"*"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "attrStrOps$subexpression$1", "symbols": ["attrStrOps$subexpression$1$string$3"]},
    {"name": "attrStrOps", "symbols": ["attrStrOps$subexpression$1"], "postprocess": 
        d => d[0].join("")
        },
    {"name": "attrStrOps", "symbols": ["attrEqOps"], "postprocess": id},
    {"name": "attrName$ebnf$1", "symbols": []},
    {"name": "attrName$ebnf$1$subexpression$1$subexpression$1", "symbols": ["number"]},
    {"name": "attrName$ebnf$1$subexpression$1$subexpression$1", "symbols": ["identifier"]},
    {"name": "attrName$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "attrName$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "attrName$ebnf$1", "symbols": ["attrName$ebnf$1", "attrName$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "attrName", "symbols": ["identifier", "attrName$ebnf$1"], "postprocess": 
        d => [d[0], ...(d[1] ?? []).map(([_, i]) => i[0])]
        },
    {"name": "attrValue$subexpression$1$subexpression$1", "symbols": ["attrName", "_", "attrEqOps", "_", "regex"]},
    {"name": "attrValue$subexpression$1", "symbols": ["attrValue$subexpression$1$subexpression$1"]},
    {"name": "attrValue$subexpression$1$subexpression$2", "symbols": ["attrName", "_", "attrNumOps", "_", "number"]},
    {"name": "attrValue$subexpression$1", "symbols": ["attrValue$subexpression$1$subexpression$2"]},
    {"name": "attrValue$subexpression$1$subexpression$3", "symbols": ["attrName", "_", "attrStrOps", "_", "string"]},
    {"name": "attrValue$subexpression$1$subexpression$3", "symbols": ["typeof"]},
    {"name": "attrValue$subexpression$1", "symbols": ["attrValue$subexpression$1$subexpression$3"]},
    {"name": "attrValue", "symbols": ["attrValue$subexpression$1"], "postprocess": 
        ([[[names, _0, operator, _1, right]]], _, reject) => {
        	if (names === null ||
        		operator === null ||
        		right === null) {
        		return reject;
        	}
        
        	return ({
        		type: "attribute",
        		names,
        		operator,
        		right,
        	});
        }
        },
    {"name": "attrValue", "symbols": ["attrName"], "postprocess": 
        d => ({
        	type: "attribute",
        	names: d[0]
        })
        },
    {"name": "string$ebnf$1", "symbols": []},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", /[^"]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": [{"literal":"\""}, "string$ebnf$1", {"literal":"\""}], "postprocess": 
        d => unescape(d[1].join(''))
        },
    {"name": "string$ebnf$2", "symbols": []},
    {"name": "string$ebnf$2", "symbols": ["string$ebnf$2", /[^']/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": [{"literal":"'"}, "string$ebnf$2", {"literal":"'"}], "postprocess": 
        d => unescape(d[1].join(''))
        },
    {"name": "typeof$string$1", "symbols": [{"literal":"t"}, {"literal":"y"}, {"literal":"p"}, {"literal":"e"}, {"literal":"o"}, {"literal":"f"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "typeof", "symbols": ["typeof$string$1", "attrName"], "postprocess": 
        d => ({
        	type: 'typeof',
        	value: d[2]
        })
        },
    {"name": "flags$ebnf$1", "symbols": [/[imsu]/]},
    {"name": "flags$ebnf$1", "symbols": ["flags$ebnf$1", /[imsu]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "flags", "symbols": ["flags$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "regex$ebnf$1", "symbols": [/[^/]/]},
    {"name": "regex$ebnf$1", "symbols": ["regex$ebnf$1", /[^/]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "regex$ebnf$2", "symbols": ["flags"], "postprocess": id},
    {"name": "regex$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "regex", "symbols": [{"literal":"/"}, "regex$ebnf$1", {"literal":"/"}, "regex$ebnf$2"], "postprocess": 
        d => ({
        	type: "regexp",
        	value: new RegExp(d[1].join(""), d[3] ?? "")
        })
        },
    {"name": "pseudoSelector$subexpression$1", "symbols": ["root"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["class"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["logicalSelector"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["firstChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["lastChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["nthChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["nthLastChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["onlyChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["firstOfType"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["lastOfType"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["nthOfType"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["nthLastOfType"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["onlyOfType"]},
    {"name": "pseudoSelector", "symbols": [{"literal":":"}, "pseudoSelector$subexpression$1"], "postprocess": d => d[1][0]},
    {"name": "root$string$1", "symbols": [{"literal":"r"}, {"literal":"o"}, {"literal":"o"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "root", "symbols": ["root$string$1"], "postprocess": 
        d => ({
        	type: "root",
        })
        },
    {"name": "class$subexpression$1$string$1", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}, {"literal":"m"}, {"literal":"e"}, {"literal":"n"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "class$subexpression$1", "symbols": ["class$subexpression$1$string$1"]},
    {"name": "class$subexpression$1$string$2", "symbols": [{"literal":"e"}, {"literal":"x"}, {"literal":"p"}, {"literal":"r"}, {"literal":"e"}, {"literal":"s"}, {"literal":"s"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "class$subexpression$1", "symbols": ["class$subexpression$1$string$2"]},
    {"name": "class$subexpression$1$string$3", "symbols": [{"literal":"d"}, {"literal":"e"}, {"literal":"c"}, {"literal":"l"}, {"literal":"a"}, {"literal":"r"}, {"literal":"a"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "class$subexpression$1", "symbols": ["class$subexpression$1$string$3"]},
    {"name": "class$subexpression$1$string$4", "symbols": [{"literal":"f"}, {"literal":"u"}, {"literal":"n"}, {"literal":"c"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "class$subexpression$1", "symbols": ["class$subexpression$1$string$4"]},
    {"name": "class$subexpression$1$string$5", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"t"}, {"literal":"t"}, {"literal":"e"}, {"literal":"r"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "class$subexpression$1", "symbols": ["class$subexpression$1$string$5"]},
    {"name": "class", "symbols": ["class$subexpression$1"], "postprocess": 
        ([[name]]) => ({
        	type: "class",
        	name,
        })
        },
    {"name": "nthExpr$subexpression$1", "symbols": ["integer"]},
    {"name": "nthExpr$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "nthExpr$ebnf$1$subexpression$1", "symbols": ["_", /[\+-]/, "_", "integer"]},
    {"name": "nthExpr$ebnf$1", "symbols": ["nthExpr$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "nthExpr$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "nthExpr", "symbols": ["nthExpr$subexpression$1", {"literal":"n"}, "nthExpr$ebnf$1"], "postprocess": 
        d => {
        	let multiplier = d[0][0];
        	if (multiplier === "-") {
        		multiplier = -1;
        	}
        	
        	let offset = 0;
        
        	if (d[2] !== null) {
        		let operator = d[2][1];
        
        		offset = d[2][3];
        		if (operator === "-") {
        			offset = -offset;
        		}
        	}
        
        	return {
        		type: "nthExpr",
        		multiplier,
        		offset,
        		ofSelector: null,
        	}
        }
        },
    {"name": "nthOfExpr$string$1", "symbols": [{"literal":" "}, {"literal":"o"}, {"literal":"f"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "nthOfExpr", "symbols": ["nthExpr", "nthOfExpr$string$1", "selectors"], "postprocess": 
        ([expr, _, selectors]) => ({
        	...expr,
        	ofSelector: selectors,
        })
        },
    {"name": "logicalSelector$subexpression$1$string$1", "symbols": [{"literal":"i"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "logicalSelector$subexpression$1", "symbols": ["logicalSelector$subexpression$1$string$1"]},
    {"name": "logicalSelector$subexpression$1$string$2", "symbols": [{"literal":"m"}, {"literal":"a"}, {"literal":"t"}, {"literal":"c"}, {"literal":"h"}, {"literal":"e"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "logicalSelector$subexpression$1", "symbols": ["logicalSelector$subexpression$1$string$2"]},
    {"name": "logicalSelector", "symbols": ["logicalSelector$subexpression$1", {"literal":"("}, "_", "selectors", "_", {"literal":")"}], "postprocess": 
        (d, _, reject) => {
        	if (d[3] === null) {
        		return reject;
        	}
        
        	return ({
        		type: "is",
        		argument: d[3],
        	})
        }
        },
    {"name": "logicalSelector$subexpression$2$string$1", "symbols": [{"literal":"n"}, {"literal":"o"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "logicalSelector$subexpression$2", "symbols": ["logicalSelector$subexpression$2$string$1"]},
    {"name": "logicalSelector$subexpression$2$string$2", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"e"}, {"literal":"r"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "logicalSelector$subexpression$2", "symbols": ["logicalSelector$subexpression$2$string$2"]},
    {"name": "logicalSelector$subexpression$2$string$3", "symbols": [{"literal":"h"}, {"literal":"a"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "logicalSelector$subexpression$2", "symbols": ["logicalSelector$subexpression$2$string$3"]},
    {"name": "logicalSelector", "symbols": ["logicalSelector$subexpression$2", {"literal":"("}, "_", "selectors", "_", {"literal":")"}], "postprocess": 
        (d, _, reject) => {
        	if (d[3] === null) {
        		return reject;
        	}
        
        	return ({
        		type: d[0][0],
        		argument: d[3],
        	});
        }
        },
    {"name": "firstChild$string$1", "symbols": [{"literal":"f"}, {"literal":"i"}, {"literal":"r"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "firstChild", "symbols": ["firstChild$string$1"], "postprocess": 
        d => ({
        	type: 'nth-child',
        	index: 1
        })
        },
    {"name": "lastChild$string$1", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "lastChild", "symbols": ["lastChild$string$1"], "postprocess": 
        d => ({
        	type: 'nth-child',
        	index: -1
        })
        },
    {"name": "nthChild$string$1", "symbols": [{"literal":"n"}, {"literal":"t"}, {"literal":"h"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}, {"literal":"("}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "nthChild$subexpression$1", "symbols": ["integer"]},
    {"name": "nthChild$subexpression$1", "symbols": ["nthExpr"]},
    {"name": "nthChild$subexpression$1", "symbols": ["nthOfExpr"]},
    {"name": "nthChild", "symbols": ["nthChild$string$1", "nthChild$subexpression$1", {"literal":")"}], "postprocess": 
        d => ({
        	type: 'nth-child',
        	index: d[1][0],
        })
        },
    {"name": "nthLastChild$string$1", "symbols": [{"literal":"n"}, {"literal":"t"}, {"literal":"h"}, {"literal":"-"}, {"literal":"l"}, {"literal":"a"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}, {"literal":"("}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "nthLastChild$subexpression$1", "symbols": ["integer"]},
    {"name": "nthLastChild$subexpression$1", "symbols": ["nthExpr"]},
    {"name": "nthLastChild$subexpression$1", "symbols": ["nthOfExpr"]},
    {"name": "nthLastChild", "symbols": ["nthLastChild$string$1", "nthLastChild$subexpression$1", {"literal":")"}], "postprocess": 
        d => ({
        	type: 'nth-child',
        	index: -d[1][0],
        })
        },
    {"name": "onlyChild$string$1", "symbols": [{"literal":"o"}, {"literal":"n"}, {"literal":"l"}, {"literal":"y"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "onlyChild", "symbols": ["onlyChild$string$1"], "postprocess": 
        d => ({
        	type: 'only-child',
        })
        },
    {"name": "firstOfType$string$1", "symbols": [{"literal":"f"}, {"literal":"i"}, {"literal":"r"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"o"}, {"literal":"f"}, {"literal":"-"}, {"literal":"t"}, {"literal":"y"}, {"literal":"p"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "firstOfType", "symbols": ["firstOfType$string$1"], "postprocess": 
        d => ({
        	type: 'nth-of-type',
        	index: 1
        })
        },
    {"name": "lastOfType$string$1", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"o"}, {"literal":"f"}, {"literal":"-"}, {"literal":"t"}, {"literal":"y"}, {"literal":"p"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "lastOfType", "symbols": ["lastOfType$string$1"], "postprocess": 
        d => ({
        	type: 'nth-of-type',
        	index: -1
        })
        },
    {"name": "nthOfType$string$1", "symbols": [{"literal":"n"}, {"literal":"t"}, {"literal":"h"}, {"literal":"-"}, {"literal":"o"}, {"literal":"f"}, {"literal":"-"}, {"literal":"t"}, {"literal":"y"}, {"literal":"p"}, {"literal":"e"}, {"literal":"("}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "nthOfType$subexpression$1", "symbols": ["integer"]},
    {"name": "nthOfType$subexpression$1", "symbols": ["nthExpr"]},
    {"name": "nthOfType", "symbols": ["nthOfType$string$1", "nthOfType$subexpression$1", {"literal":")"}], "postprocess": 
        d => ({
        	type: 'nth-of-type',
        	index: d[1][0],
        })
        },
    {"name": "nthLastOfType$string$1", "symbols": [{"literal":"n"}, {"literal":"t"}, {"literal":"h"}, {"literal":"-"}, {"literal":"l"}, {"literal":"a"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"o"}, {"literal":"f"}, {"literal":"-"}, {"literal":"t"}, {"literal":"y"}, {"literal":"p"}, {"literal":"e"}, {"literal":"("}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "nthLastOfType$subexpression$1", "symbols": ["integer"]},
    {"name": "nthLastOfType$subexpression$1", "symbols": ["nthExpr"]},
    {"name": "nthLastOfType", "symbols": ["nthLastOfType$string$1", "nthLastOfType$subexpression$1", {"literal":")"}], "postprocess": 
        d => ({
        	type: 'nth-of-type',
        	index: -d[1][0],
        })
        },
    {"name": "onlyOfType$string$1", "symbols": [{"literal":"o"}, {"literal":"n"}, {"literal":"l"}, {"literal":"y"}, {"literal":"-"}, {"literal":"o"}, {"literal":"f"}, {"literal":"-"}, {"literal":"t"}, {"literal":"y"}, {"literal":"p"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "onlyOfType", "symbols": ["onlyOfType$string$1"], "postprocess": 
        d => ({
        	type: 'only-of-type',
        })
        }
]
  , ParserStart: "start"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
