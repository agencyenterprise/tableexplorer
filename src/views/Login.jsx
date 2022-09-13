import Nullstack from "nullstack";
import { connect } from "@tableland/sdk";

class Login extends Nullstack {
  async connectWallet(context) {
    const tableland = await connect({
      network: "testnet",
      chain: "polygon-mumbai",
    });
    await tableland.siwe();
    localStorage.setItem("@tltoken", tableland.token.token);
    context.__tableland = tableland;
  }

  async hydrate(context) {
    const token = localStorage.getItem("@tltoken");
    console.log("Token");
    if (token) {
      const tableland = await connect({
        network: "testnet",
        chain: "polygon-mumbai",
        token,
      });

      context.__tableland = { ...tableland, token: { token: token } };
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
        <p class="mt-12">
          Documentation can be found{" "}
          <a
            class="font-bold hover:underline text-primary"
            href="https://docs.tableland.xyz/"
          >
            here
          </a>
        </p>
      </div>
    );
  }
}

export default Login;
