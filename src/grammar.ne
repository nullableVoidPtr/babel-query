@{%
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
%}

start -> _ selectors _ {% d => d[1] %}
	   | _

selectors -> selector (_ "," _ selector):* {%
	d =>
		d[1].length === 0
			? d[0]
			: {
				type: "list",
				list: [d[0], ...d[1].map(s => s[3])]
			}
%}

combinator -> _ "~" _ {% () => "sibling" %}
            | _ "+" _ {% () => "adjacent" %}
            | _ ">" _ {% () => "child" %}
		    |   " " _ {% () => "descendant" %}

selector -> sequence {% d => d[0] %}
          | selector combinator sequence {%
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
		  %}

_ -> [ ]:* {% _ => null %}

sequence -> "!":? startAtom:? specifierAtom:* {%
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
%}

startAtom -> wildcard {% id %}
startAtom -> identifier {%
	d => ({
		type: "type",
		name: d[0],
	})
%}

specifierAtom -> (field | attr | pseudoSelector) {%
	d => d[0][0]
%}

wildcard -> "*" {% d => ({type: 'wildcard'}) %}

identifier -> [_a-zA-Z] [_a-zA-Z0-9-]:* {% d => d[0] + d[1].join("") %}

field -> "." identifier {%
	d => ({
		type: 'field',
		name: d[1],
	})
%}


float -> [\+-]:? [0-9]:+ "." [0-9]:* {%
	d => parseFloat(
		((d[0] === "-") ? "-" : "") +
		d[1].join("") + "." + d[3].join("")
	)
%}
integer -> [\+-]:? [0-9]:+ {%
	d => parseInt(
		((d[0] === "-") ? "-" : "") +
		d[1].join("")
	)
%}
number -> float | integer {% id %}

attr -> "[" _ attrValue _ "]" {% d => d[2] %}

attrEqOps -> "!":? "=" {% d => (d[0] !== null ? "!" : "") + d[1] %}
attrNumOps -> [><] {% id %}
attrNumOps -> (">=" | "<=") {%
	d => d[0].join("")
%}
attrNumOps -> attrEqOps {% id %}
attrStrOps -> ("^=" | "$=" | "*=") {%
	d => d[0].join("")
%}
attrStrOps -> attrEqOps {% id %}

attrName -> identifier ("." (number | identifier)):* {%
	d => [d[0], ...(d[1] ?? []).map(([_, i]) => i[0])]
%}

attrValue -> ((attrName _ attrEqOps _ regex)
  | (attrName _ attrNumOps _ number)
  | (attrName _ attrStrOps _ string)) {%
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
%}
attrValue -> attrName {%
	d => ({
		type: "attribute",
		names: d[0]
	})
%}

string -> "\"" [^"]:* "\"" {%
	d => unescape(d[1].join(''))
%}
string -> "'" [^']:* "'" {%
	d => unescape(d[1].join(''))
%}

flags -> [imsu]:+ {% d => d[0].join("") %}
regex -> "/" [^/]:+ "/" flags:? {%
	d => ({
		type: "regexp",
		value: new RegExp(d[1].join(""), d[3] ?? "")
	})
%}

pseudoSelector -> ":" (
	root |
	class |
	logicalSelector |
	firstChild |
	lastChild |
	nthChild |
	nthLastChild |
	onlyChild |
	firstOfType |
	lastOfType |
	nthOfType |
	nthLastOfType |
	onlyOfType
) {% d => d[1][0] %}

root -> "root" {%
	d => ({
		type: "root",
	})
%}

class -> (
    "statement"
  | "expression"
  | "declaration"
  | "function"
  | "pattern") {%
	([[name]]) => ({
		type: "class",
		name,
	})
%}

nthExpr -> (integer | "-") "n" (_ [\+-] _ integer):? {%
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
%}
nthOfExpr -> nthExpr " of " selectors {%
	([expr, _, selectors]) => ({
		...expr,
		ofSelector: selectors,
	})
%}

logicalSelector -> ("is" | "matches") "(" _ selectors _ ")" {%
	(d, _, reject) => {
		if (d[3] === null) {
			return reject;
		}

		return ({
			type: "is",
			argument: d[3],
		})
	}
%}
logicalSelector -> ("not" | "where" | "has") "(" _ selectors _ ")" {%
	(d, _, reject) => {
		if (d[3] === null) {
			return reject;
		}

		return ({
			type: d[0][0],
			argument: d[3],
		});
	}
%}

firstChild -> "first-child" {%
	d => ({
		type: 'nth-child',
		index: 1
	})
%}
lastChild -> "last-child" {%
	d => ({
		type: 'nth-child',
		index: -1
	})
%}
nthChild -> "nth-child(" (integer | nthExpr | nthOfExpr) ")" {%
	d => ({
		type: 'nth-child',
		index: d[1][0],
	})
%}
nthLastChild -> "nth-last-child(" (integer | nthExpr | nthOfExpr) ")" {%
	d => ({
		type: 'nth-child',
		index: -d[1][0],
	})
%}
onlyChild -> "only-child" {%
	d => ({
		type: 'only-child',
	})
%}

firstOfType -> "first-of-type" {%
	d => ({
		type: 'nth-of-type',
		index: 1
	})
%}
lastOfType -> "last-of-type" {%
	d => ({
		type: 'nth-of-type',
		index: -1
	})
%}
nthOfType -> "nth-of-type(" (integer | nthExpr) ")" {%
	d => ({
		type: 'nth-of-type',
		index: d[1][0],
	})
%}
nthLastOfType -> "nth-last-of-type(" (integer | nthExpr) ")" {%
	d => ({
		type: 'nth-of-type',
		index: -d[1][0],
	})
%}
onlyOfType -> "only-of-type" {%
	d => ({
		type: 'only-of-type',
	})
%}
