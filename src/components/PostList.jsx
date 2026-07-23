import React, { useEffect, useState } from "react";
import Post from "./Post";
import { useContext } from "react";
import { PostList as PostListData } from "./post-list-store";
import Welcomemessege from "./Welcomemessege";
import LoadingSpinner from "./LoadSpinner";

const PostList = () => {
  const { postList, addIntialPost } = useContext(PostListData);
   const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (postList.length > 0) return;
    setFetching(true);
    fetch("https://dummyjson.com/posts")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.posts[0]);
        addIntialPost(data.posts);
         setFetching(false);
      });
  }, []);

  return (
    <>
     {fetching && <LoadingSpinner />}
      {!fetching &&  postList.length == 0 && <Welcomemessege />}
      <div className="postList">
        {!fetching && postList.map((post) => (
          <Post key={post.id} post={post}></Post>
        ))}
      </div>
    </>
  );
};

export default PostList;
