import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api/Api"; // adjust path if necessary

const PaymentSuccess = () => {
  const { member2 } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const reference = new URLSearchParams(location.search).get("reference");
    if (!reference || !member2) return;

    const verifyPayment = async () => {
      try {
        await api.post("/merge/verify", { member2, reference });
        navigate(`/chat/${member2}`);
      } catch (err) {
        console.error("Payment verification failed", err);
        alert("Payment verification failed. Try again.");
      }
    };

    verifyPayment();
  }, [location.search, member2]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Verifying your payment...</h2>
      <p>Please wait while we confirm your transaction.</p>
    </div>
  );
};

export default PaymentSuccess;
