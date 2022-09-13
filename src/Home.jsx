import Nullstack from "nullstack";
import Logo from "nullstack/logo";
import "./Home.css";
import { connect } from "@tableland/sdk";
class Home extends Nullstack {
  prepare({ project, page, greeting }) {
    page.title = `${project.name} - ${greeting}`;
    page.description = `${project.name} was made with Nullstack`;
  }

  renderLink({ children, href }) {
    const link = href + "?ref=create-nullstack-app";
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  async connectWallet(context) {
    console.log(context);
    // Connect to the Tableland testnet (defaults to Polygon Mumbai testnet chain)
    // @return {Connection} Interface to access the Tableland network and, optionally, a target `chain`
    const tableland = await connect({
      network: "testnet",
      chain: "polygon-mumbai",
    });

    // For client-side apps, call `siwe` to prompt a browser wallet sign-in flow
    await tableland.siwe();

    context.__tableland = tableland;
    console.log("end");
    const { name } = await tableland.create(`id int primary key, name text`, `quickstart`);
    // Wait for the table to be created, then query
    const writeRes = await tableland.write(`INSERT INTO ${name} VALUES (0, 'Bobby Tables');`);
    const readRes = await tableland.read(`SELECT * FROM ${name}`);
    console.log(readRes);
  }
  render() {
    return <button onclick={this.connectWallet}>Connect me</button>;
  }
}

export default Home;
