import React from "react";

const Welcomemessege = ({onGetPostClick}) => {
  return (
    <div>
      <center className="welcome">
        <h1>There is no post currently</h1>
        <button onClick={onGetPostClick} type="button" class="btn btn-primary">Get post from server</button>
      </center>
    </div>
  );
};

export default Welcomemessege;
