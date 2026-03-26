import { useState } from "react";
import API from "../services/api";
import "../layout/Login.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await API.post("/auth/login", {
                username,
                password
            });

            const token = res.data.token;

            localStorage.setItem("token", token);
            localStorage.setItem("user", username);

            const decoded = jwtDecode(token);

            console.log("USER:", decoded);

            if (decoded.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch (err) {
            alert("Sai tài khoản hoặc mật khẩu");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h1>Đăng nhập</h1>

                <input
                    placeholder="Username"
                    onChange={e => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                />

                <button onClick={handleLogin}>Đăng nhập</button>

            </div>
        </div>
    );
}

export default Login;