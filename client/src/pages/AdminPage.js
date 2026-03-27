import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../layout/Admin.css";

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    describe: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔥 CHECK LOGIN + ROLE
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("DECODED:", decoded);

      if (decoded.role === "admin") {
        setIsAdmin(true);
      } else {
        alert("Bạn không phải admin");
        navigate("/");
      }
    } catch (err) {
      console.log("TOKEN ERROR:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // 🔥 LOAD PRODUCTS (CHỈ KHI ADMIN)
  useEffect(() => {
    if (!isAdmin) return;

    API.get("/products")
      .then(res => {
        console.log("PRODUCT DATA:", res.data);

        // 🔥 FIX recordset
        const data = res.data.recordset || res.data;
        setProducts(data);
      })
      .catch(err => {
        console.log("LOAD ERROR:", err.response?.data || err.message);
      });
  }, [isAdmin]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 ADD / UPDATE
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, form);
        alert("Cập nhật thành công");
      } else {
        await API.post("/products", form);
        alert("Thêm thành công");
      }

      setForm({ name: "", price: "", image: "", describe: "" });
      setEditingId(null);

      // reload
      const res = await API.get("/products");
      const data = res.data.recordset || res.data;
      setProducts(data);

    } catch (err) {
      console.log("API ERROR:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        alert("Chưa đăng nhập");
      } else if (err.response?.status === 403) {
        alert("Bạn không có quyền admin");
      } else {
        alert("Lỗi server");
      }
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.Name,
      price: p.Price,
      image: p.Image,
      describe: p.Describe
    });
    setEditingId(p.Id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sản phẩm?")) return;

    try {
      await API.delete(`/products/${id}`);
      alert("Đã xóa");

      const res = await API.get("/products");
      const data = res.data.recordset || res.data;
      setProducts(data);

    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err.message);
      alert("Không có quyền hoặc lỗi server");
    }
  };

  // ⛔ loading
  if (loading) return <h2>Loading...</h2>;

  // ⛔ không phải admin
  if (!isAdmin) return <h2>Không có quyền truy cập</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>ADMIN - Quản lý sản phẩm</h1>

      <div className="admin-form">
        <div className="form-group">
          <label>Tên</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Giá</label>
          <input name="price" value={form.price} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Link ảnh</label>
          <input name="image" value={form.image} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <input name="describe" value={form.describe} onChange={handleChange} />
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          {editingId ? "Cập nhật" : "Thêm"}
        </button>
      </div>


      {products.map(p => (
        <div className="admin-card" key={p.Id}>
          <img
            src={p.Image || "https://via.placeholder.com/100"}
            alt={p.Name}
            className="admin-img"
          />
          <div className="admin-info">
            <div className="admin-name">{p.Name}</div>
            <div className="admin-desc">{p.Describe}</div>
            <div className="admin-price">{Number(p.Price).toLocaleString()} đ</div>
          </div>
          <div className="admin-actions">
            <button className="edit-btn" onClick={() => handleEdit(p)}>✎</button>
            <button className="delete-btn" onClick={() => handleDelete(p.Id)}>🗑</button>
          </div>
        </div>
      ))}

    </div>
  );
}

export default AdminPage;