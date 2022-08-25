import { monaco } from "./monaco";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as babel_query from "babel-query";
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
  value: "[id.name='bar']",
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
  value: `var x = 1;
var y = 2;
function bar() {
    if (x < y) {
        foo();
    } else {
        x = y;
        return;
    }
    for (var i = 0; i < 2; i++) {
        x += i;
    }
    bar();
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
  const query = babel_query.parse(rawQuery);
  console.log(query);

  const rendered = renderQuery(query);
  queryResultContainer.replaceChildren(rendered);

  const jsCode = javascriptEditor.getModel()!.getLinesContent().join("\n");
  const parsed = parse(jsCode);

  let results: NodePath[] | undefined;
  (import.meta.env.DEV ? traverse : (traverse as any).default)(parsed, {
    Program(path: NodePath) {
      results = babel_query.query(path, query);
      path.stop();
    },
  });

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
                start.column,
                end.line,
                end.column
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
