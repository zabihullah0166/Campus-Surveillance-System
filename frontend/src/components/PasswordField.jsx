import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordField({ label, value, onChange, required = true, placeholder = "" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      {label ? <label>{label}</label> : null}
      <div className="password-field">
        <input
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          type="button"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
