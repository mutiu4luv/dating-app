import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { member2 } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (member2) {
      // Delay briefly just for smooth UX
      setTimeout(() => {
        navigate(`/chat/${member2}`);
      }, 1500);
    }
  }, [member2, navigate]);

  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h2>Payment Successful ✅</h2>
      <p>Redirecting to chat...</p>
    </div>
  );
};

export default PaymentSuccess;
