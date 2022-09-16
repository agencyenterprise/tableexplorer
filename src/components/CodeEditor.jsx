import Nullstack from "nullstack";

class CodeEditor extends Nullstack {
  editor = null;
  hydrate({ value, onchange, disabled, instances }) {
    try {
      const monaco = require("monaco-editor/esm/vs/editor/editor.api");
      this.editor = monaco.editor.create(document.getElementById("code-editor"), {
        value: value,
        language: "sql",
        theme: "vs-dark",
        fontSize: "16px",
      });
      this.editor.updateOptions({ readOnly: !!disabled });
      this.editor.onDidChangeModelContent((_) => {
        onchange && onchange({ query: this.editor.getValue() });
      });
    } catch (err) {
      instances.toast._showErrorToast(err.message);
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
