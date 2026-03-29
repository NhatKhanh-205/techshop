import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../layout/Register.css";
import { showSuccess,showError } from "../utils/alert";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      showSuccess("Đổi mật khẩu thành công");
      navigate("/login");
    } catch (err) {
      showError(err.response?.data);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Đổi mật khẩu</h2>

        <input
          type="password"
          placeholder="Mật khẩu mới"
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleReset}>Xác nhận</button>
      </div>
    </div>
  );
}

export default ResetPassword;