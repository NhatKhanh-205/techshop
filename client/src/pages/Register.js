import { useState } from "react";
import API from "../services/api";
import "../layout/Register.css";
import { useNavigate } from "react-router-dom";
import { showSuccess,showError } from "../utils/alert";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", form);

      showSuccess("Đăng ký thành công, hãy kiểm tra email");
      navigate("/login");

    } catch (err) {
      showError(err.response?.data || "Lỗi đăng ký");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">

        <h1 className="auth-title">Tạo tài khoản</h1>

        <input
          name="username"
          placeholder="Tên đăng nhập"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          onChange={handleChange}
        />

        <button onClick={handleRegister}>
          Đăng ký
        </button>

        <p className="auth-switch">
          Đã có tài khoản?{" "}
          <span onClick={() => navigate("/login")}>
            Đăng nhập
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;