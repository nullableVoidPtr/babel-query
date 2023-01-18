// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }

	const unescape = (str: string) =>
		str.replace(/\\(.)/g, (_, ch: string) => {
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

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "start", "symbols": ["_", "selectors", "_"], "postprocess": d => d[1]},
    {"name": "start", "symbols": ["_"]},
    {"name": "selectors$ebnf$1", "symbols": []},
    {"name": "selectors$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "selector"]},
    {"name": "selectors$ebnf$1", "symbols": ["selectors$ebnf$1", "selectors$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "selectors", "symbols": ["selector", "selectors$ebnf$1"], "postprocess": 
        d =>
        	d[1].length === 0
        		? d[0]
        		: {
        			type: "list",
        			list: [d[0], ...d[1].map(
        				// @ts-ignore
        				s => s[3]
        			)]
        		}
        },
    {"name": "relativeCombinator", "symbols": ["_", {"literal":"~"}, "_"], "postprocess": () => "sibling"},
    {"name": "relativeCombinator", "symbols": ["_", {"literal":"+"}, "_"], "postprocess": () => "adjacent"},
    {"name": "relativeCombinator", "symbols": ["_", {"literal":">"}, "_"], "postprocess": () => "child"},
    {"name": "combinator", "symbols": ["relativeCombinator"], "postprocess": id},
    {"name": "combinator", "symbols": [{"literal":" "}, "_"], "postprocess": () => "descendant"},
    {"name": "combinator", "symbols": [{"literal":"\n"}, "_"], "postprocess": () => "descendant"},
    {"name": "combinator", "symbols": [{"literal":"\t"}, "_"], "postprocess": () => "descendant"},
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
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[ \n\t]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": _ => null},
    {"name": "sequence$ebnf$1", "symbols": ["startAtom"], "postprocess": id},
    {"name": "sequence$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "sequence$ebnf$2", "symbols": []},
    {"name": "sequence$ebnf$2", "symbols": ["sequence$ebnf$2", "specifierAtom"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "sequence", "symbols": ["sequence$ebnf$1", "sequence$ebnf$2"], "postprocess": 
        ([startAtom, specifierAtoms], _, reject) => {
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
        
        	return result;
        },
        },
    {"name": "field$subexpression$1", "symbols": ["number"]},
    {"name": "field$subexpression$1", "symbols": ["identifier"]},
    {"name": "field", "symbols": [{"literal":"."}, "field$subexpression$1"], "postprocess": 
        d => d[1][0]
        },
    {"name": "sequence$ebnf$3", "symbols": ["sequence"], "postprocess": id},
    {"name": "sequence$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "sequence$ebnf$4", "symbols": []},
    {"name": "sequence$ebnf$4", "symbols": ["sequence$ebnf$4", "specifierAtom"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "sequence", "symbols": ["sequence$ebnf$3", "field", "sequence$ebnf$4"], "postprocess": 
        ([subject, key, specifiers]) => {
        	let specifier: any = null;
        	if (specifiers.length === 1) {
        		specifier = specifiers[0];
        	} else if (specifiers.length > 1) {
        		specifier = {
        			type: "compound",
        			list: specifiers,
        		};
        	}
        
        	let result;
        	if (subject?.type === "ancestry") {
        		result = structuredClone(subject);
        	} else {
        		result = {
        			type: "ancestry",
        			subject,
        			path: [],
        		};
        	}
        
        	result.path.push({
        		key,
        		specifier,
        	});
        
        	return result;
        }
        },
    {"name": "startAtom", "symbols": ["wildcard"], "postprocess": id},
    {"name": "startAtom", "symbols": ["identifier"], "postprocess": 
        d => ({
        	type: "type",
        	name: d[0],
        })
        },
    {"name": "specifierAtom$subexpression$1", "symbols": ["attr"]},
    {"name": "specifierAtom$subexpression$1", "symbols": ["pseudoSelector"]},
    {"name": "specifierAtom", "symbols": ["specifierAtom$subexpression$1"], "postprocess": 
        d => d[0][0]
        },
    {"name": "wildcard", "symbols": [{"literal":"*"}], "postprocess": () => ({type: 'wildcard'})},
    {"name": "identifier$ebnf$1", "symbols": []},
    {"name": "identifier$ebnf$1", "symbols": ["identifier$ebnf$1", /[_a-zA-Z0-9-]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "identifier", "symbols": [/[_a-zA-Z]/, "identifier$ebnf$1"], "postprocess": d => d[0] + d[1].join("")},
    {"name": "float$ebnf$1", "symbols": [/[\+-]/], "postprocess": id},
    {"name": "float$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "float$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "float$ebnf$2", "symbols": ["float$ebnf$2", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "float$ebnf$3", "symbols": []},
    {"name": "float$ebnf$3", "symbols": ["float$ebnf$3", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "float", "symbols": ["float$ebnf$1", "float$ebnf$2", {"literal":"."}, "float$ebnf$3"], "postprocess": 
        d => parseFloat(
        	((d[0] === "-") ? "-" : "") +
        	d[1].join("") + "." + d[3].join("")
        )
        },
    {"name": "integer$ebnf$1", "symbols": [/[\+-]/], "postprocess": id},
    {"name": "integer$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "integer$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "integer$ebnf$2", "symbols": ["integer$ebnf$2", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
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
    {"name": "attrEqOps$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "attrEqOps", "symbols": ["attrEqOps$ebnf$1", {"literal":"="}], "postprocess": d => (d[0] !== null ? "!" : "") + d[1]},
    {"name": "attrNumOps", "symbols": ["attrEqOps"], "postprocess": id},
    {"name": "attrNumOps", "symbols": [/[><]/], "postprocess": id},
    {"name": "attrNumOps$subexpression$1$string$1", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "attrNumOps$subexpression$1", "symbols": ["attrNumOps$subexpression$1$string$1"]},
    {"name": "attrNumOps$subexpression$1$string$2", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "attrNumOps$subexpression$1", "symbols": ["attrNumOps$subexpression$1$string$2"]},
    {"name": "attrNumOps", "symbols": ["attrNumOps$subexpression$1"], "postprocess": 
        d => d[0].join("")
        },
    {"name": "attrStrOps$subexpression$1$string$1", "symbols": [{"literal":"^"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "attrStrOps$subexpression$1", "symbols": ["attrStrOps$subexpression$1$string$1"]},
    {"name": "attrStrOps$subexpression$1$string$2", "symbols": [{"literal":"$"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "attrStrOps$subexpression$1", "symbols": ["attrStrOps$subexpression$1$string$2"]},
    {"name": "attrStrOps$subexpression$1$string$3", "symbols": [{"literal":"*"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "attrStrOps$subexpression$1", "symbols": ["attrStrOps$subexpression$1$string$3"]},
    {"name": "attrStrOps", "symbols": ["attrStrOps$subexpression$1"], "postprocess": 
        d => d[0].join("")
        },
    {"name": "attrStrOps", "symbols": ["attrEqOps"], "postprocess": id},
    {"name": "attrName$ebnf$1", "symbols": []},
    {"name": "attrName$ebnf$1$subexpression$1$subexpression$1", "symbols": ["number"]},
    {"name": "attrName$ebnf$1$subexpression$1$subexpression$1", "symbols": ["identifier"]},
    {"name": "attrName$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "attrName$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "attrName$ebnf$1", "symbols": ["attrName$ebnf$1", "attrName$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "attrName", "symbols": ["identifier", "attrName$ebnf$1"], "postprocess": 
        // @ts-ignore
        d => [d[0], ...(d[1] ?? []).map(([_, i]) => i[0])]
        },
    {"name": "attrValue$subexpression$1$subexpression$1", "symbols": ["attrName", "_", "attrEqOps", "_", "regex"]},
    {"name": "attrValue$subexpression$1", "symbols": ["attrValue$subexpression$1$subexpression$1"]},
    {"name": "attrValue$subexpression$1$subexpression$2", "symbols": ["attrName", "_", "attrNumOps", "_", "number"]},
    {"name": "attrValue$subexpression$1", "symbols": ["attrValue$subexpression$1$subexpression$2"]},
    {"name": "attrValue$subexpression$1$subexpression$3", "symbols": ["attrName", "_", "attrStrOps", "_", "string"]},
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
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", /[^"]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "string", "symbols": [{"literal":"\""}, "string$ebnf$1", {"literal":"\""}], "postprocess": 
        d => unescape(d[1].join(''))
        },
    {"name": "string$ebnf$2", "symbols": []},
    {"name": "string$ebnf$2", "symbols": ["string$ebnf$2", /[^']/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "string", "symbols": [{"literal":"'"}, "string$ebnf$2", {"literal":"'"}], "postprocess": 
        d => unescape(d[1].join(''))
        },
    {"name": "flags$ebnf$1", "symbols": [/[imsu]/]},
    {"name": "flags$ebnf$1", "symbols": ["flags$ebnf$1", /[imsu]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "flags", "symbols": ["flags$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "regex$ebnf$1", "symbols": [/[^/]/]},
    {"name": "regex$ebnf$1", "symbols": ["regex$ebnf$1", /[^/]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "regex$ebnf$2", "symbols": ["flags"], "postprocess": id},
    {"name": "regex$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "regex", "symbols": [{"literal":"/"}, "regex$ebnf$1", {"literal":"/"}, "regex$ebnf$2"], "postprocess": 
        d =>  new RegExp(d[1].join(""), d[3] ?? "")
        },
    {"name": "pseudoSelector$subexpression$1", "symbols": ["root"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["logicalSelector"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["firstChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["lastChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["nthChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["nthLastChild"]},
    {"name": "pseudoSelector$subexpression$1", "symbols": ["onlyChild"]},
    {"name": "pseudoSelector", "symbols": [{"literal":":"}, "pseudoSelector$subexpression$1"], "postprocess": d => d[1][0]},
    {"name": "root$string$1", "symbols": [{"literal":"r"}, {"literal":"o"}, {"literal":"o"}, {"literal":"t"}], "postprocess": (d) => d.join('')},
    {"name": "root", "symbols": ["root$string$1"], "postprocess": 
        () => ({
        	type: "root",
        })
        },
    {"name": "nthExpr$ebnf$1$subexpression$1", "symbols": ["integer"]},
    {"name": "nthExpr$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "nthExpr$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "nthExpr$ebnf$1", "symbols": ["nthExpr$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "nthExpr$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "nthExpr$ebnf$2$subexpression$1", "symbols": ["_", /[\+-]/, "_", "integer"]},
    {"name": "nthExpr$ebnf$2", "symbols": ["nthExpr$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "nthExpr$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "nthExpr", "symbols": ["nthExpr$ebnf$1", {"literal":"n"}, "nthExpr$ebnf$2"], "postprocess": 
        d => {
        	let multiplier = 1;
        	if (d[0] !== null) {
        		if (d[0][0] === "-") {
        			multiplier = -1;
        		} else if (typeof d[0][0] === 'number') {
        			multiplier = d[0][0]
        		}
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
        	}
        }
        },
    {"name": "nthExpr$string$1", "symbols": [{"literal":"o"}, {"literal":"d"}, {"literal":"d"}], "postprocess": (d) => d.join('')},
    {"name": "nthExpr", "symbols": ["nthExpr$string$1"], "postprocess": 
        _ => ({
        	type: "nthExpr",
        	multiplier: 2,
        	offset: 1,
        })
        },
    {"name": "nthExpr$string$2", "symbols": [{"literal":"e"}, {"literal":"v"}, {"literal":"e"}, {"literal":"n"}], "postprocess": (d) => d.join('')},
    {"name": "nthExpr", "symbols": ["nthExpr$string$2"], "postprocess": 
        _ => ({
        	type: "nthExpr",
        	multiplier: 2,
        	offset: 0,
        })
        },
    {"name": "nthExpr", "symbols": ["integer"], "postprocess": 
        ([offset]) => ({
        	type: "nthExpr",
        	multiplier: 0,
        	offset,
        })
        },
    {"name": "logicalSelector$subexpression$1$string$1", "symbols": [{"literal":"i"}, {"literal":"s"}], "postprocess": (d) => d.join('')},
    {"name": "logicalSelector$subexpression$1", "symbols": ["logicalSelector$subexpression$1$string$1"]},
    {"name": "logicalSelector$subexpression$1$string$2", "symbols": [{"literal":"m"}, {"literal":"a"}, {"literal":"t"}, {"literal":"c"}, {"literal":"h"}, {"literal":"e"}, {"literal":"s"}], "postprocess": (d) => d.join('')},
    {"name": "logicalSelector$subexpression$1", "symbols": ["logicalSelector$subexpression$1$string$2"]},
    {"name": "logicalSelector$subexpression$1$string$3", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"e"}, {"literal":"r"}, {"literal":"e"}], "postprocess": (d) => d.join('')},
    {"name": "logicalSelector$subexpression$1", "symbols": ["logicalSelector$subexpression$1$string$3"]},
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
    {"name": "relativeSelector$ebnf$1", "symbols": ["relativeCombinator"], "postprocess": id},
    {"name": "relativeSelector$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "relativeSelector", "symbols": ["relativeSelector$ebnf$1", "selector"], "postprocess": 
        ([combinator, selector], _, reject) => {
        	if (selector === null) {
        		return reject;
        	}
        
        	return [combinator ?? "descendant", selector];
        }
        },
    {"name": "logicalSelector$string$1", "symbols": [{"literal":"h"}, {"literal":"a"}, {"literal":"s"}], "postprocess": (d) => d.join('')},
    {"name": "logicalSelector$ebnf$1", "symbols": []},
    {"name": "logicalSelector$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "relativeSelector"]},
    {"name": "logicalSelector$ebnf$1", "symbols": ["logicalSelector$ebnf$1", "logicalSelector$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "logicalSelector", "symbols": ["logicalSelector$string$1", {"literal":"("}, "_", "relativeSelector", "logicalSelector$ebnf$1", "_", {"literal":")"}], "postprocess": 
        (d) => {
        	const list: {
        		combinator: any;
        		selector: any;
        	}[] = [];
        	for (const [combinator, selector] of [d[3], ...d[4].map(
        		// @ts-ignore
        		n => n[3]
        	)]) {
        		list.push({
        			combinator,
        			selector,
        		});
        	}
        
        	return ({
        		type: "has",
        		list,
        	});
        }
        },
    {"name": "logicalSelector$string$2", "symbols": [{"literal":"n"}, {"literal":"o"}, {"literal":"t"}], "postprocess": (d) => d.join('')},
    {"name": "logicalSelector", "symbols": ["logicalSelector$string$2", {"literal":"("}, "_", "selectors", "_", {"literal":")"}], "postprocess": 
        (d, _, reject) => {
        	if (d[3] === null) {
        		return reject;
        	}
        
        	return ({
        		type: "not",
        		argument: d[3],
        	});
        }
        },
    {"name": "firstChild$string$1", "symbols": [{"literal":"f"}, {"literal":"i"}, {"literal":"r"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}], "postprocess": (d) => d.join('')},
    {"name": "firstChild", "symbols": ["firstChild$string$1"], "postprocess": 
        () => ({
        	type: 'nth-child',
        	index: 1
        })
        },
    {"name": "lastChild$string$1", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}], "postprocess": (d) => d.join('')},
    {"name": "lastChild", "symbols": ["lastChild$string$1"], "postprocess": 
        () => ({
        	type: 'nth-child',
        	index: -1
        })
        },
    {"name": "nthChild$string$1", "symbols": [{"literal":"n"}, {"literal":"t"}, {"literal":"h"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}, {"literal":"("}], "postprocess": (d) => d.join('')},
    {"name": "nthChild", "symbols": ["nthChild$string$1", "nthExpr", {"literal":")"}], "postprocess": 
        d => ({
        	type: 'nth-child',
        	index: d[1],
        })
        },
    {"name": "nthLastChild$string$1", "symbols": [{"literal":"n"}, {"literal":"t"}, {"literal":"h"}, {"literal":"-"}, {"literal":"l"}, {"literal":"a"}, {"literal":"s"}, {"literal":"t"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}, {"literal":"("}], "postprocess": (d) => d.join('')},
    {"name": "nthLastChild", "symbols": ["nthLastChild$string$1", "nthExpr", {"literal":")"}], "postprocess": 
        d => ({
        	type: 'nth-child',
        	index: -d[1],
        })
        },
    {"name": "onlyChild$string$1", "symbols": [{"literal":"o"}, {"literal":"n"}, {"literal":"l"}, {"literal":"y"}, {"literal":"-"}, {"literal":"c"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"d"}], "postprocess": (d) => d.join('')},
    {"name": "onlyChild", "symbols": ["onlyChild$string$1"], "postprocess": 
        () => ({
        	type: 'only-child',
        })
        }
  ],
  ParserStart: "start",
};

export default grammar;
