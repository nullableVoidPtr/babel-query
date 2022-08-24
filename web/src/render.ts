import { NodePath } from "@babel/traverse";
import { VISITOR_KEYS } from "@babel/types";
import { Selector } from "../../src/selector";

function terminalSpan(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.innerText = text;
    span.classList.add("terminal");
    return span;
}

function terminalParagraph(text: string): HTMLParagraphElement {
    const p = document.createElement("p");
    p.appendChild(terminalSpan(text));
    return p;
}

function valueSpan(value: string | number): HTMLSpanElement {
    const span = terminalSpan(JSON.stringify(value));
    span.classList.add(typeof value);
    return span;
}

function valueParagraph(value: string | number): HTMLParagraphElement {
    const p = document.createElement("p");
    p.appendChild(valueSpan(value));
    return p;
}

function typeSpan(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.innerText = text;
    span.classList.add("type");
    return span;
}

export function renderKeyValue(key: string, value: HTMLElement): HTMLElement {
    value.classList.add("property");
    value.dataset.key = key;
    if (value.tagName === "DETAILS") {
        const summary = value.querySelector("summary")!;
        summary.dataset.key = key;
    }
    return value;
}

export function renderQuery(query: Selector): HTMLElement {
    if (query.type === "wildcard" ||
        query.type === "type" ||
        query.type === "class" ||
        query.type === "root" ||
        query.type === "only-child") {
        switch (query.type) {
            case "wildcard":
                return terminalParagraph("*");
            case "type":
                return terminalParagraph(query.name);
            case "class":
                return terminalParagraph(":" + query.name);
            case "root":
                return terminalParagraph(":root");
            case "only-child":
                return terminalParagraph(":only-child");
        }
    }

    const rendered = document.createElement("details");
    
    const summary = document.createElement("summary");
    summary.appendChild(typeSpan(query.type));
    
    rendered.appendChild(summary);

    switch (query.type) {
        case 'compound':
        case 'list':
            for (const s of query.list) {
                rendered.appendChild(renderQuery(s));
            }
            break;
        case 'is':
        case 'not':
            rendered.appendChild(renderQuery(query.argument))
            break;
        case 'has':
            for (const {combinator, selector} of query.list) {
                const child = renderQuery(selector);
                if (child.tagName === "details") {
                    child.querySelector("summary")!.appendChild(document.createTextNode(" " + combinator));
                } else {
                    child.innerText += " " + combinator;
                }
                rendered.appendChild(child);
            }
            break;
        case 'complex':
            rendered.appendChild(renderKeyValue("left", renderQuery(query.left)));
            rendered.appendChild(renderKeyValue("combinator", terminalSpan(query.combinator)));
            rendered.appendChild(renderKeyValue("right", renderQuery(query.right)));
            break;
        case 'nth-child':
            const {index} = query;
            const indexDetails = document.createElement("details");
            const indexSummary = document.createElement("summary");
            indexSummary.innerText = "index";
            indexDetails.appendChild(indexSummary);

            indexDetails.appendChild(renderKeyValue("multiplier", terminalSpan(index.multiplier.toString())))
            indexDetails.appendChild(renderKeyValue("offset", terminalSpan(index.offset.toString())))

            rendered.appendChild(indexDetails);
            break;
        
        case 'ancestry':
            rendered.appendChild(renderKeyValue("subject", renderQuery(query.subject)));

            const pathDetails = document.createElement("details");
            const pathSummary = document.createElement("summary");
            pathSummary.innerText = "path";
            pathDetails.appendChild(pathSummary);

            for (const {key, specifier} of query.path) {
                if (specifier === null) {
                    pathDetails.appendChild(valueParagraph(key));
                    continue;
                }

                const child = renderQuery(specifier);
                const title = child.tagName === "DETAILS" ?
                    child.querySelector("summary")! :
                    child;
                console.log(child.innerHTML);
                title.appendChild(document.createTextNode(" at "));
                title.appendChild(valueSpan(key));
                pathDetails.appendChild(child);
            }

            rendered.appendChild(pathDetails);
            break;

        case 'attribute':
            const namesDetails = document.createElement("details");
            const namesSummary = document.createElement("summary");
            namesSummary.innerText = "names";
            namesDetails.appendChild(namesSummary);
            for (const name of query.names) {
                namesDetails.appendChild(valueParagraph(name));
            }
            rendered.appendChild(namesDetails);

            if (query.operator) {
                rendered.appendChild(renderKeyValue("operator", terminalSpan(query.operator)));

                const right = query.right!;
                rendered.appendChild(renderKeyValue("right", 
                    (typeof right === "object")
                    ? terminalSpan(right.toString())
                    : valueSpan(right)
                ));
            }

            break;
    };

    return rendered;
}

export function renderESNode(path: NodePath): HTMLElement {
    if (path.node === null) {
        return terminalSpan("null");
    }

    const rendered = document.createElement("details");
    const summary = document.createElement("summary");
    summary.appendChild(typeSpan(path.type));
    rendered.appendChild(summary);

    for (const [key, value] of Object.entries(path.node)) {
        if (key === 'type') continue;
        if (key === 'start') continue;
        if (key === 'end') continue;
        if (key === 'loc') continue;

        if (VISITOR_KEYS[path.type].includes(key)) {
            const child = path.get(key);
            if (Array.isArray(child)) {
                const renderedArray = document.createElement("details");
                const arraySummary = document.createElement("summary");
                arraySummary.innerText = key;
                renderedArray.appendChild(arraySummary);

                for (const e of child) {
                    renderedArray.appendChild(renderESNode(e));
                }

                rendered.appendChild(renderedArray);
            } else {
                rendered.appendChild(renderKeyValue(key, renderESNode(child)));
            }
        } else {
            rendered.appendChild(renderKeyValue(key, valueSpan(value)));
        }
    }

    if (path.node.loc) {
        function renderLoc({line, column}: ({line: number; column: number;})) {
            const span = document.createElement("span");
            span.classList.add("terminal");
            
            const lineSpan = document.createElement("span");
            lineSpan.classList.add("terminal", "number");
            lineSpan.innerText = line.toString();

            const columnSpan = document.createElement("span");
            columnSpan.classList.add("terminal", "number");
            columnSpan.innerText = column.toString();

            span.replaceChildren(
                lineSpan,
                document.createTextNode(":"),
                columnSpan,
            );

            return span;
        }

        const {start, end} = path.node.loc;
        rendered.appendChild(renderKeyValue("start", renderLoc(start)));
        rendered.appendChild(renderKeyValue("end", renderLoc(end)));
    }


    return rendered;
}