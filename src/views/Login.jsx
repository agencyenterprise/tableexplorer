import Nullstack from "nullstack";
import { connect } from "@tableland/sdk";

class Login extends Nullstack {
  async connectWallet(context) {
    let tableland = await connect({
      network: "testnet",
      chain: "polygon-mumbai",
    });
    await tableland.siwe();
    tableland.signerAddress = await tableland.signer.getAddress();
    context.__tableland = tableland;
    localStorage.setItem("@tltoken", tableland.token.token);
    localStorage.setItem("@tlAddress", context.__tableland.signerAddress);
  }

  async hydrate(context) {
    const token = localStorage.getItem("@tltoken");
    const address = localStorage.getItem("@tlAddress");
    if (token && address) {
      const tableland = await connect({
        network: "testnet",
        chain: "polygon-mumbai",
        token,
      });

      context.__tableland = tableland;
      context.__tableland.token = { token: token };
      context.__tableland.signerAddress = address;
    }
  }

  render() {
    return (
      <div class="w-full min-h-screen flex flex-col justify-center items-center">
        <h1 class="text-3xl">Welcome to TableLand Admin</h1>
        <p class="my-6">First of all, please log in to your account.</p>
        <button class="btn-primary" onclick={this.connectWallet}>
          Log In
        </button>
      </div>
    );
  }
}

export default Login;
