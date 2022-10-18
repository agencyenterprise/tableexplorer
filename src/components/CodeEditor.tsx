import Nullstack from "nullstack";
import { CustomClientContext } from "../types/CustomContexts";
import {editor} from "monaco-editor/esm/vs/editor/editor.api"
class CodeEditor extends Nullstack {
  editor: editor.IStandaloneCodeEditor | null = null;
  hydrate({
    value,
    onchange,
    disabled,
  }: CustomClientContext & {
    onchange: (props: any) => void;
    disabled: boolean;
  }) {
    try {
      const monaco = require("monaco-editor/esm/vs/editor/editor.api");
      this.editor = monaco.editor.create(
        document.getElementById("code-editor"),
        {
          value,
          language: "sql",
          theme: "vs-dark",
          fontSize: "16px",
        }
      );
      this.editor!.updateOptions({ readOnly: !!disabled });
      this.editor!.onDidChangeModelContent((_) => {
        onchange && onchange({ query: this.editor!.getValue() });
      });
    } catch (err) {
      console.log(err);
    }
  }
  getEditorValue() {
    return this.editor!.getValue();
  }
  setEditorValue({ query }) {
    this.editor!.setValue(query);
  }
  render() {
    return (
      <div class="border-solid border h-40">
        <div class="h-32" id="code-editor" />
      </div>
    );
  }
}

export default CodeEditor;
