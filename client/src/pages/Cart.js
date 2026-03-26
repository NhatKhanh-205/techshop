import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + Number(item.Price) * (item.Quantity || 1),
    0
  );

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
    <div>
      <h2>Giỏ hàng</h2>

      {cart.length === 0 ? (
        <p>Chưa có sản phẩm</p>
      ) : (
        cart.map((item, index) => (
          <div key={index}>
            <h4>{item.Name}</h4>

            <p>
              {Number(item.Price).toLocaleString()} đ
              {" x "}
              {item.Quantity || 1}
            </p>

            <p>
              Thành tiền:{" "}
              {(Number(item.Price) * (item.Quantity || 1)).toLocaleString()} đ
            </p>
          </div>
        ))
      )}

      <h3>Tổng: {total.toLocaleString()} đ</h3>
    </div>
  );
}

export default Cart;