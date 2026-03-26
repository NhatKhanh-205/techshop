import { useEffect, useState } from "react";
import API from "../services/api";
import "../layout/Home.css";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/Searchbar";

function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/products")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
        setFiltered(data);
      })
      .catch(err => console.log(err));
  }, []);

  const handleSearch = (keyword) => {
    const result = products.filter(p =>
      p.Name.toLowerCase().includes(keyword.toLowerCase())
    );
    setFiltered(result);
  };

  const addToCart = async (product) => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    console.log("CALL API ADD"); // debug

    await API.post("/cart/add", {
      productId: product.Id || product.id
    });

    alert("Đã thêm vào giỏ");

  } catch (err) {
    console.log("ERROR:", err);
  }
};

  return (
    <div className="container">
      <SearchBar onSearch={handleSearch} />

      <h1>Cửa hàng bán lẻ thiết bị điện tử</h1>

      <h2 className="title">Danh sách sản phẩm</h2>

      <div className="product-list">
        {filtered.map(p => (
          <div key={p.Id} className="product-card">
            <img
              src={p.Image || "https://via.placeholder.com/300"}
              alt=""
              className="product-img"
            />

            <div className="product-body">
              <div className="product-name">{p.Name}</div>

              <div className="product-price">
                {Number(p.Price).toLocaleString()} đ
              </div>

              <div className="product-desc">{p.Describe}</div>

              <button onClick={() => addToCart(p)}>
                Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;