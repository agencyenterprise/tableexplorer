import Nullstack from "nullstack";

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
    this.toastMessage = `${message}`;
    this.type = type;
    this.showToast = true;
    const _this = this;

    setTimeout(() => {
      _this.showToast = false;
    }, 5000);
  }

  render() {
    return (
      <div class={"z-50 font-bold p-6 w-full fixed bottom-0 left-0 " + typeClasses[this.type] + (this.showToast ? "" : " hidden")}>
        {this.toastMessage}
      </div>
    );
  }
}

export default Toast;
