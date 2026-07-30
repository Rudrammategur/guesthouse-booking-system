import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FixERPUrl = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fullPath = location.pathname;

    if (fullPath.includes("&")) {
      const cleanPath = fullPath.split("&")[0];

      console.log("Fixing ERP URL:", fullPath, "→", cleanPath);

      navigate(cleanPath, { replace: true });
    }
  }, [location]);

  return null;
};

export default FixERPUrl;