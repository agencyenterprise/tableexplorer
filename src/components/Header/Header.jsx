

import Nullstack from "nullstack";
import { connect  } from "@tableland/sdk";

const HeaderLink = ({
  router,
  pathTo,
  children,
}) => (
  <a
    href={pathTo}
    class={`text-lg px-2 pb-4 hover:border-b`}
  >
    {children}
  </a>
);
class Header extends Nullstack {
  connectWallet = async (context) => {
    const tableland = await connect({
      network: "testnet",
      chain: "polygon-mumbai",
    }); 
    await tableland.siwe();
    context.__tableland = tableland;
  }
  render ({__tableland}) {
    return (
      <nav class="flex fixed w-screen h-14 bg-slate-800 border-primary border-solid border-b items-center header px-8 sm:px-16 md:px-32 lg:px-48 justify-between">
        <div class="flex h-full items-center">
          <div class="ml-10">
              <HeaderLink class="ml-6" pathTo="/">
                TableLand Admin
              </HeaderLink>
            </div>
        </div>
        {__tableland?.token?.token ? (
          <div>
            <button class="btn-primary w-24">
              Log Out
            </button>
          </div>
        ) : (
          <button class="w-32 h-11 hover:border-b bg-primary" onclick={this.connectWallet}>
            Log In
          </button>
        )}
      </nav>)
  }
  
};

export default Header;