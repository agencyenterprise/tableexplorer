import { connect, Connection } from "@tableland/sdk";
import Nullstack from "nullstack";
import AELogo from "../assets/AELogo";
import ExternalLinkIcon from "../assets/ExternalLinkIcon";
import TablelandLogo from "../assets/TablelandLogo";
import { CustomClientContext } from "../types/CustomContexts";

class Login extends Nullstack {
  async connectWallet(context: CustomClientContext) {
    let tableland: Connection = await connect({
      network: "testnet",
      chain: "polygon-mumbai",
    });
    await tableland.siwe();
    const signerAddress = await tableland.signer?.getAddress();
    context.__tableland = tableland;
    context.__tableland.signerAddress = signerAddress;
    localStorage.setItem("@tltoken", tableland.token?.token!);
    localStorage.setItem("@tlAddress", signerAddress!);
  }

  async hydrate(context: CustomClientContext) {
    const token = localStorage.getItem("@tltoken");
    const address = localStorage.getItem("@tlAddress");
    if (token && address) {
      const __tableland = await connect({
        network: "testnet",
        chain: "polygon-mumbai",
        token: { token: token },
      });

      context.__tableland = __tableland;
      context.__tableland.signerAddress = address;
    }
  }

  render() {
    return (
      <div
        class="min-h-screen flex flex-col justify-around px-[5%] pt-[10%] gap-40 bg-[url(login_bg.jpg)] bg-contain"
        style=""
      >
        <div class="w-full flex flex-col justify-center items-center">
          <h1 class="text-4xl">Welcome to TableLand Admin</h1>
          <p class="my-6">Log into your account to join the revolution.</p>
          <button class="btn-primary" onclick={this.connectWallet}>
            Log In (Mumbai)
          </button>
        </div>
        <div class="w-full flex justify-between gap-4">
          <a
            href="https://tableland.xyz/"
            target="blank"
            class="hover:no-underline"
          >
            <div class="border-2 rounded-md bg-background-secondary flex flex-col justify-between p-3 w-full gap-2 text-[#FFFEFF]">
              <div class="flex items-center gap-2">
                <TablelandLogo />
                <ExternalLinkIcon />
              </div>
              <p>
                Tableland is a permissionless relational database for web3
                natives. Built for developers, NFT creatores and web3
                visionaries.
              </p>
            </div>
          </a>
          <a
            href="https://ae.studio/"
            target="blank"
            class="hover:no-underline"
          >
            <div class="border-2 rounded-md bg-background-secondary flex flex-col justify-between p-3 w-full gap-2 text-[#FFFEFF]">
              <div class="flex items-center">
                <AELogo />
                <ExternalLinkIcon />
              </div>
              <p>
                AE Studio is a product development studio building agency
                increasing products for clients. We have the world’s most
                effective developers, designers, data scientists {"&"} PMs.
              </p>
            </div>
          </a>
        </div>
      </div>
    );
  }
}

export default Login;
