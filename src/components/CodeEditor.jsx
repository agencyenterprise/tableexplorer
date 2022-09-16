import Nullstack from "nullstack";

// self.MonacoEnvironment = {
//   getWorkerUrl: function (_moduleId, label) {
//     if (label === "json") {
//       return "./json.worker.bundle.js";
//     }
//     if (label === "css" || label === "scss" || label === "less") {
//       return "./css.worker.bundle.js";
//     }
//     if (label === "html" || label === "handlebars" || label === "razor") {
//       return "./html.worker.bundle.js";
//     }
//     if (label === "typescript" || label === "javascript") {
//       return "./ts.worker.bundle.js";
//     }
//     return "./editor.worker.bundle.js";
//   },
// };

class CodeEditor extends Nullstack {
  editor = null;
  hydrate({ value, onchange, disabled }) {
    try {
      const monaco = require("monaco-editor/esm/vs/editor/editor.api");
      this.editor = monaco.editor.create(
        document.getElementById("code-editor"),
        {
          value: value,
          language: "sql",
          theme: "vs-dark",
          fontSize: "16px",
        }
      );
      this.editor.updateOptions({ readOnly: !!disabled });
      this.editor.onDidChangeModelContent((_) => {
        onchange && onchange({ query: this.editor.getValue() });
      });
    } catch (err) {
      console.log(err);
    }
  }
  getEditorValue() {
    return this.editor.getValue();
  }
  setEditorValue({ query }) {
    this.editor.setValue(query);
  }
  render() {
    return (
      <div class="border-solid border border-slate-300 h-40">
        <div class="h-32" id="code-editor" />
      </div>
    );
  }
}

export default CodeEditor;
