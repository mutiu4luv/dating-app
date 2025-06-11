import { useParams } from "react-router-dom";

const Chat = () => {
  const { member2 } = useParams();
  const member1 = localStorage.getItem("userId");

  if (!member1 || !member2) {
    return <div>Missing user information</div>;
  }

  return (
    <div>
      <h2>
        Chat between {member1} and {member2}
      </h2>
      {/* Chat logic here */}
    </div>
  );
};
export default Chat;
