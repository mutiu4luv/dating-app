import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { member2 } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const member1 = localStorage.getItem("userId");
    if (member1 && member2) {
      setTimeout(() => {
        navigate(`/chat/${member1}/${member2}`);
      }, 1500);
    }
  }, [member2, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f9fa",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2>Payment Successful ✅</h2>
        <p>Redirecting to chat...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
