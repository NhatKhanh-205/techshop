import { Link, useNavigate } from "react-router-dom";
import "../layout/Navbar.css";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

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

  // đóng menu khi click ra ngoài
  useEffect(() => {
    const close = () => setOpenMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="navbar">
      
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/">
          <img src="/techshop.png" alt="logo" className="logo" />
        </Link>
      </div>

      {/* RIGHT */}
      <div className="nav-right">

        {/* ===== DESKTOP ===== */}
        <div className="nav-desktop">
          <span onClick={handleCartClick} className="nav-item">
            🛒 Giỏ hàng
          </span>

          {isAdmin && <Link to="/admin">Admin</Link>}

          {token ? (
            <>
              <span>Xin chào, {user}</span>
              <span onClick={handleLogout} className="nav-item">
                Đăng xuất
              </span>
            </>
          ) : (
            <Link to="/login">Đăng nhập</Link>
          )}
        </div>

        {/* ===== MOBILE ===== */}
        <div
          className="nav-mobile"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="user-icon"
            onClick={() => setOpenMenu(!openMenu)}
          >
            👤
          </span>

          {openMenu && (
            <div className="dropdown">
              <div onClick={handleCartClick}>🛒 Giỏ hàng</div>

              {isAdmin && (
                <div onClick={() => navigate("/admin")}>
                  ⚙️ Admin
                </div>
              )}

              {token ? (
                <div onClick={handleLogout}>🚪 Đăng xuất</div>
              ) : (
                <div onClick={() => navigate("/login")}>
                  🔐 Đăng nhập
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;