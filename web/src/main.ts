import { monaco } from "./monaco";
import { parse } from "@babel/parser";
import { NodePath } from "@babel/traverse";
import * as babylon_query from "babylon-query";
import { renderQuery, renderESNode } from "./render";

monaco.languages.register({ id: "babelQuery" });
monaco.languages.setMonarchTokensProvider("babelQuery", {
  ws: "[ \t\n\r\f]*",
  tokenizer: {
    root: [
      ["[\\*]", "tag"],
      ["[>\\+,\\.]", "delimiter"],
      { include: "@string" },
      { include: "@number" },
    ],
    number: [["-?(\\d*\\.)?\\d+", { token: "number" }]],

    string: [
      ['~?"', { token: "string", next: "@stringenddoublequote" }],
      ["~?'", { token: "string", next: "@stringendquote" }],
    ],

    stringenddoublequote: [
      ["\\\\.", "string"],
      ['"', { token: "string", next: "@pop" }],
      [/[^\\"]+/, "string"],
      [".", "string"],
    ],

    stringendquote: [
      ["\\\\.", "string"],
      ["'", { token: "string", next: "@pop" }],
      [/[^\\']+/, "string"],
      [".", "string"],
    ],
  },
});

const queryEditorContainer = document.getElementById("query-editor")!;
const queryEditor = monaco.editor.create(queryEditorContainer, {
  value: ":function[id.name='foo'] IfStatement ExpressionStatement.consequent:is(BlockStatement).body.1 CallExpression:has(> Identifier[name='baz'])",
  language: "babelQuery",
  theme: "vs-dark",
  wordWrap: "off",
  lineNumbers: "off",
  lineNumbersMinChars: 0,
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  renderLineHighlight: "none",
  lineDecorationsWidth: 0,
  hideCursorInOverviewRuler: true,
  glyphMargin: false,
  folding: false,
  scrollBeyondLastColumn: 0,
  scrollbar: { horizontal: "hidden", vertical: "hidden" },
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never",
    seedSearchStringFromSelection: "never",
  },
  minimap: { enabled: false },
  automaticLayout: true,
});

const javascriptEditorContainer = document.getElementById("javascript-editor")!;
const javascriptEditor = monaco.editor.create(javascriptEditorContainer, {
  value: `function foo() {
    bar = baz();
    xyzzy = baz();
    if (bar) {
        bar = baz();
        xyzzy = baz();
    }
}`,
  language: "javascript",
  theme: "vs-dark",
  automaticLayout: true,
});

window.addEventListener("resize", (_) => {
  queryEditor.layout({
    width: queryEditorContainer.clientWidth,
    height: 20,
  });
  javascriptEditor.layout({} as any);
});

const queryResultContainer = document.querySelector("#selector-ast")!;
const queryMatchesContainer = document.querySelector("#query-matches")!;
function onQueryChange() {
  const rawQuery = queryEditor.getModel()!.getLineContent(1);
  const query = babylon_query.parse(rawQuery);
  console.log(query);

  const rendered = renderQuery(query);
  queryResultContainer.replaceChildren(rendered);

  const jsCode = javascriptEditor.getModel()!.getLinesContent().join("\n");
  const parsed = parse(jsCode);

  let results: NodePath[] | undefined;
  results = babylon_query.query(parsed, query);

  if (!results) {
    return;
  }

  queryMatchesContainer.replaceChildren(
    ...results.map((r) => {
      const rendered = renderESNode(r);
      const { loc } = r.node;
      if (loc) {
        let oldDecors: string[] = [];
        rendered.addEventListener("mouseover", (_) => {
          const model = javascriptEditor.getModel()!;
          const { start, end } = loc;
          oldDecors = model.deltaDecorations(oldDecors, [
            {
              range: new monaco.Range(
                start.line,
                start.column + 1,
                end.line,
                end.column + 1,
              ),
              options: {
                inlineClassName: "highlighted",
              },
            },
          ]);
        });
        rendered.addEventListener("mouseout", (_) => {
          const model = javascriptEditor.getModel()!;
          oldDecors = model.deltaDecorations(oldDecors, []);
        });
      }

      return rendered;
    })
  );
}

onQueryChange();

queryEditor.addCommand(monaco.KeyCode.Enter, () => {});
queryEditor.getModel()!.onDidChangeContent(onQueryChange);
