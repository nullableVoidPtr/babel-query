@preprocessor typescript

@{%
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
%}

start -> _ selectors _ {% d => d[1] %}
	   | _

selectors -> selector (_ "," _ selector):* {%
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
%}

relativeCombinator -> _ "~" _ {% () => "sibling" %}
                    | _ "+" _ {% () => "adjacent" %}
                    | _ ">" _ {% () => "child" %}

combinator -> relativeCombinator {% id %}
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

sequence -> startAtom:? specifierAtom:* {%
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
%}

field -> "." (number | identifier) {%
	d => d[1]
%}

sequence -> sequence:? field specifierAtom:* {%
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
%}

startAtom -> wildcard {% id %}
startAtom -> identifier {%
	d => ({
		type: "type",
		name: d[0],
	})
%}

specifierAtom -> (attr | pseudoSelector) {%
	d => d[0][0]
%}

wildcard -> "*" {% d => ({type: 'wildcard'}) %}

identifier -> [_a-zA-Z] [_a-zA-Z0-9-]:* {% d => d[0] + d[1].join("") %}

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
attrNumOps -> attrEqOps {% id %}
attrNumOps -> [><] {% id %}
attrNumOps -> (">=" | "<=") {%
	d => d[0].join("")
%}
attrStrOps -> ("^=" | "$=" | "*=") {%
	d => d[0].join("")
%}
attrStrOps -> attrEqOps {% id %}

attrName -> identifier ("." (number | identifier)):* {%
	// @ts-ignore
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
	d =>  new RegExp(d[1].join(""), d[3] ?? "")
%}

pseudoSelector -> ":" (
	root |
	class |
	logicalSelector |
	firstChild |
	lastChild |
	nthChild |
	nthLastChild |
	onlyChild
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
  | "pattern"
  | "scope") {%
	([[name]]) => ({
		type: "class",
		name,
	})
%}

nthExpr -> (integer | "-" | "+"):? "n" (_ [\+-] _ integer):? {%
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
%}

nthExpr -> "odd" {%
	_ => ({
		type: "nthExpr",
		multiplier: 2,
		offset: 1,
	})
%}

nthExpr -> "even" {%
	_ => ({
		type: "nthExpr",
		multiplier: 2,
		offset: 0,
	})
%}

nthExpr -> integer {%
	([offset]) => ({
		type: "nthExpr",
		multiplier: 0,
		offset,
	})
%}

logicalSelector -> ("is" | "matches" | "where") "(" _ selectors _ ")" {%
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

relativeSelector -> relativeCombinator:? selector {%
	([combinator, selector], _, reject) => {
		if (selector === null) {
			return reject;
		}

		return [combinator ?? "descendant", selector];
	}
%}

logicalSelector -> "has" "(" _ relativeSelector (_ "," _ relativeSelector):* _ ")" {%
	(d, _, reject) => {
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
%}
logicalSelector -> "not" "(" _ selectors _ ")" {%
	(d, _, reject) => {
		if (d[3] === null) {
			return reject;
		}

		return ({
			type: "not",
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
nthChild -> "nth-child(" nthExpr ")" {%
	d => ({
		type: 'nth-child',
		index: d[1],
	})
%}
nthLastChild -> "nth-last-child(" nthExpr ")" {%
	d => ({
		type: 'nth-child',
		index: -d[1],
	})
%}
onlyChild -> "only-child" {%
	d => ({
		type: 'only-child',
	})
%}