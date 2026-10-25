import { useState } from "react";
import "../style/OrderSetter.css";

const OrderSetter = ({ order, setOrder }) => (
  <section className="panel">
    <h2 className="panel-title">魔方阶数</h2>
    <OrderButton order={order} setOrder={setOrder} />
    <OrderSelector setOrder={setOrder} />
  </section>
);

const OrderButton = ({ order, setOrder }) => {
  return (
    <div className="segmented">
      {[2, 3, 4, 5].map((o) => (
        <button
          key={o}
          type="button"
          className={o === order ? "active" : ""}
          onClick={() => setOrder(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
};

const OrderSelector = ({ setOrder }) => {
  const [orderIn, setOrderIn] = useState("");

  const setCustomOrder = () => {
    const value = Number(orderIn);
    if (Number.isInteger(value) && value >= 2 && value <= 10) {
      setOrder(value);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") setCustomOrder();
  };

  return (
    <div className="custom-order">
      <input
        type="number"
        min="2"
        max="10"
        placeholder="自定义 2 ~ 10 阶"
        value={orderIn}
        onChange={(e) => setOrderIn(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button type="button" className="btn btn-ghost" onClick={setCustomOrder}>
        设置
      </button>
    </div>
  );
};

export default OrderSetter;
