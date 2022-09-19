import Nullstack from "nullstack";
import Toastify from "toastify-js";
const typeClasses = {
  info: "bg-primary text-white",
  error: "bg-red-600 text-white",
};

class Toast extends Nullstack {
  toastMessage = "";
  showToast = false;
  type = "info";
  parseErrorMessages({ message }) {
    if (message.match(/user rejected transaction/)) {
      return "Transaction canceled by the user!";
    }
    return message;
  }
  _showErrorToast(message) {
    const parsedMessage = message ? message : "Unexpected Error!";
    this._showToast(this.parseErrorMessages({ message: parsedMessage }), "error");
  }

  _showInfoToast(message) {
    this._showToast(message, "info");
  }

  _showToast(message, type) {
    Toastify({
      text: message,
      duration: 5000,
      newWindow: true,
      close: false,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: type == "error" ? "#C73535" : "#68DF98",
        "min-width": "300px",
        "text-align": "left",
        "padding-right": "30px",
      },
      onClick: function () {},
    }).showToast();
  }

  render() {
    return <></>;
  }
}

export default Toast;
