import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PaymentSuccess = () => {
  const { member2 } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const member1 = localStorage.getItem("userId");
    if (!member1 || !member2) {
      alert("Missing info. Cannot proceed to chat.");
      return;
    }

    navigate(`/chat/${member2}`);
  }, [member2, navigate]);

  return <div>Redirecting to chat...</div>;
};

export default PaymentSuccess;
