import Nullstack from "nullstack";

class CodeEditor extends Nullstack {
  hydrate() {
    const monaco = require("monaco-editor/esm/vs/editor/editor.api");
    monaco.editor.create(document.getElementById("code-editor"), {
      value: `id integer, name text, primary key (id)`,
      language: "sql",
      theme: "vs-dark",
    });
  }

  render() {
    return <div class="h-40" id="code-editor" />;
  }
}

export default CodeEditor;
