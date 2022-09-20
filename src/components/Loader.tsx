const Loader = ({ width, height }) => {
  return (
    <div class="flex justify-center">
      <svg
        version="1.1"
        id="L3"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width={width}
        height={height}
        viewBox="0 0 100 100"
        enable-background="new 0 0 0 0"
        xml:space="preserve"
      >
        <circle fill="none" stroke="#fff" stroke-width="4" cx="50" cy="50" r="44" style="opacity:0.5;" />
        <circle fill="#fff" stroke="#fff" stroke-width="3" cx="8" cy="54" r="6">
          <animateTransform attributeName="transform" dur="2s" type="rotate" from="0 50 48" to="360 50 52" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default Loader;
