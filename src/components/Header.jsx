import Nullstack from "nullstack";

const HeaderLink = ({ router, pathTo, children }) => (
  <a href={pathTo} class={`text-lg px-2 pb-4 hover:border-b`}>
    {children}
  </a>
);

class Header extends Nullstack {
  render() {
    return (
      <nav class="flex fixed w-screen h-14 bg-slate-800 border-primary border-solid border-b items-center header px-8 sm:px-16 md:px-32 lg:px-48 justify-between">
        <div class="flex h-full items-center justify-start">
          <div class="ml-10">
            <HeaderLink class="ml-6" pathTo="/">
              TableLand Admin
            </HeaderLink>
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;
