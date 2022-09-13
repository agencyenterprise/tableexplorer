import Nullstack from "nullstack";
import Header from "./components/Header/Header";
import AddTable from "./views/AddTable";
import Home from "./views/Home";
class Application extends Nullstack {
  prepare({ page }) {
    page.locale = "en-US";
  }
  renderHead() {
    return (
      <head>
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Crete+Round&family=Roboto&display=swap" rel="stylesheet" />
        <link href="/styles.css" rel="stylesheet" />
      </head>
    );
  }
  
  render({__tableland}) {
    return (
      <body>
        <Head />
        <Header/>
        
        {__tableland?.token?.token && <div id="content" class="pt-16 px-4 pb-4 flex justify-center"><Home route="/" /><AddTable route="/add-table"/></div>}
        
      </body>
    );
  }
}

export default Application;
