import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AdminPage() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        name: "",
        price: "",
        image: "",
        describe: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // 
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
                navigate("/");
            }
        } catch (err) {
            navigate("/login");
        }

        setLoading(false); // ✅ QUAN TRỌNG
    }, [navigate]);

    // 🔥 LOAD PRODUCTS
    const loadProducts = () => {
        API.get("/products")
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    };

    useEffect(() => {
        loadProducts();
    }, []);

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
            loadProducts();

        } catch (err) {
            console.log(err);
            alert("Lỗi hoặc không có quyền");
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
            loadProducts();
        } catch (err) {
            console.log(err);
        }
    };

    // ❗ CHẶN RENDER nếu chưa xác định admin
    if (loading) return <h2>Loading...</h2>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>ADMIN - Quản lý sản phẩm</h1>

            <div style={{ marginBottom: "20px" }}>
                <input name="name" placeholder="Tên" value={form.name} onChange={handleChange} />
                <input name="price" placeholder="Giá" value={form.price} onChange={handleChange} />
                <input name="image" placeholder="Link ảnh" value={form.image} onChange={handleChange} />
                <input name="describe" placeholder="Mô tả" value={form.describe} onChange={handleChange} />

                <button onClick={handleSubmit}>
                    {editingId ? "Cập nhật" : "Thêm"}
                </button>
            </div>

            {products.map(p => (
                <div key={p.Id} style={{ borderBottom: "1px solid #ccc", marginBottom: 10 }}>
                    <h3>{p.Name}</h3>
                    <p>{Number(p.Price).toLocaleString()} đ</p>

                    <button onClick={() => handleEdit(p)}>Sửa</button>
                    <button onClick={() => handleDelete(p.Id)}>Xóa</button>
                </div>
            ))}
        </div>
    );
}

export default AdminPage;