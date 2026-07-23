import { createContext, useReducer } from "react";

export const PostList = createContext({
  postList: [],
  addIntialPost: () => {},
  addPost: () => {},
  deletepost: () => {},
});

const postListReducer = (currPostList, action) => {
  let newPostList = currPostList;

  if (action.type === "DELETE_POST") {
    newPostList = currPostList.filter(
      (post) => post.id !== action.payload.postId,
    );
  } else if(action.type === "ADD_POST"){
     newPostList = [action.payload, ...currPostList];
  } else if(action.type === "ADD_INITIAL_POST"){
     newPostList = action.payload.posts;
  }
  return newPostList;
};

const PostListProvider = ({ children }) => {
  const [postList, dispatchPostList] = useReducer(
    postListReducer,
    [],
  );

  const addPost = (userId, postTitle, postBody, tag) => {
    dispatchPostList({
      type: "ADD_POST",
      payload: {
        id: Date.now(),
        title: postTitle,
        body: postBody,
        reactions: { likes: Math.floor(Math.random() * 1000), dislikes: 0 },
        userId: userId,
        tags: tag,
      },
    });
  };

  const addIntialPost = (posts) => {
    dispatchPostList({
      type: "ADD_INITIAL_POST",
      payload: {
       posts: posts,
      },
    });
  };

  const deletepost = (postId) => {
    dispatchPostList({
      type: "DELETE_POST",
      payload: {
        postId,
      },
    });
  };

  return (
    <PostList.Provider value={{ postList,addIntialPost, addPost, deletepost }}>
      {children}
    </PostList.Provider>
  );
};



export default PostListProvider;
