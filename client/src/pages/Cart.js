import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../layout/Cart.css";
import { showError, showSuccess } from "../utils/alert";


function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const handleRemove = async (productId) => {
    try {
      await API.delete(`/cart/remove/${productId}`);

      showSuccess("Đã xoá");

      // reload lại cart
      const res = await API.get("/cart");
      setCart(res.data);

    } catch (err) {
      console.log(err);
      showError("Lỗi xoá");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.Price) * (item.Quantity || 1),
    0
  );
  const handleCheckout = async () => {
    try {
      const res = await API.post("/cart/checkout", {
        method: "COD" // hoặc "BANK"
      });

      showSuccess("Thanh toán thành công");

      // tải file hóa đơn
      window.open(`http://localhost:5000/${res.data.invoice}`);

      // clear cart UI
      setCart([]);

    } catch (err) {
      console.log(err);
      showError("Lỗi thanh toán");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    API.get("/cart")
      .then(res => {
        console.log("DATA:", res.data);
        setCart(res.data);
      })
      .catch(err => console.log(err));
  }, [navigate]);

  return (
    <div className="cart-container">
      <h2 className="cart-title">Giỏ hàng</h2>

      {cart.length === 0 ? (
        <p className="cart-empty">Chưa có sản phẩm</p>
      ) : (
        <div className="cart-list">
          {cart.map((item, index) => (
            <div className="cart-card" key={index}>
              <img
                src={item.Image || "https://via.placeholder.com/150"}
                alt={item.Name}
                className="cart-img"
              />


              <div className="cart-info">
                <div className="cart-name">{item.Name}</div>

                <p className="cart-desc">{item.Describe}</p>

                <div className="cart-price">
                  {Number(item.Price).toLocaleString()} đ x {item.Quantity || 1}
                </div>

                <div className="cart-total">
                  {(Number(item.Price) * (item.Quantity || 1)).toLocaleString()} đ
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleRemove(item.Id)}>Xóa sản phẩm
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-summary">
        <div className="cart-total-price">
          Tổng: {total.toLocaleString()} đ
        </div>

        <button className="checkout-btn" onClick={handleCheckout}>
          Thanh toán
        </button>
      </div>
    </div>
  )
}

export default Cart;