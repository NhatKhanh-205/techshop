import { useState } from "react";
import API from "../services/api";
import "../layout/ForgotPassword.css";
import { showSuccess, showError } from "../utils/alert";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [link,setLink] = useState("");

const handleSubmit = async () => {
  try {
    const res = await API.post("/auth/forgot-password", { email })
    setLink(res.data.link);
    showSuccess("Đã gửi link reset");
  } catch (err) {
    showError(err.response?.data);
  }
};

  return (
    <div className="forgot-wrapper">
      <div className="forgot-container">
        <h2 className="forgot-title">Quên mật khẩu</h2>

        <input
          type="email"
          placeholder="Nhập email"
          onChange={e => setEmail(e.target.value)}
        />

        <button onClick={handleSubmit}>Gửi</button>

        {link && (
          <div className="reset-link-box">
            <p>Link reset:</p>
            <a href={link}>{link}</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;