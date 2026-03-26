import { Link, useNavigate } from "react-router-dom";
import "../layout/Navbar.css";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  let isAdmin = false;

  if (token) {
    const decoded = jwtDecode(token);
    isAdmin = decoded.role === "admin";
  }

  const handleCartClick = () => {
    if (!token) {
      navigate("/login");
    } else {
      navigate("/cart");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <Link to="/">
          <img src="/techshop.png" alt="logo" className="logo" />
        </Link>
      </div>

      <div className="nav-right">
        <span onClick={handleCartClick} style={{ cursor: "pointer" }}>
          🛒 Giỏ hàng
        </span>

        {isAdmin && <Link to="/admin">Admin</Link>} 

        {token ? (
          <>
            <span>👤 {user}</span>
            <span onClick={handleLogout} style={{ cursor: "pointer" }}>
              Đăng xuất
            </span>
          </>
        ) : (
          <Link to="/login">Đăng nhập</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;