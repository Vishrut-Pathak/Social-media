import React, { useContext } from "react";
import { useRef } from "react";
import { PostList } from "./post-list-store";

const CreatePost = () => {
  const { addPost } = useContext(PostList);

  const userIdElement = useRef();
  const postTitleElement = useRef();
  const postBodyElement = useRef();
  const tagElement = useRef();

  const handleOnSubmit = (event) => {
    event.preventDefault();
    const userId = userIdElement.current.value;
    const postTitle = postTitleElement.current.value;
    const postBody = postBodyElement.current.value;
    const tag = tagElement.current.value.split(" ");
    addPost(userId, postTitle, postBody, tag);

    userIdElement.current.value = "";
    postTitleElement.current.value = "";
    postBodyElement.current.value = "";
    tagElement.current.value = " ";
  };

  Element;
  return (
    <>
      <form className="create-post" onSubmit={handleOnSubmit}>
        <div class="mb-3">
          <label htmlFor="userId" class="form-label">
            Enter your User Id here
          </label>
          <input
            ref={userIdElement}
            type="text"
            class="form-control"
            id="userId"
            placeholder="Your User Id"
          />
        </div>

        <div class="mb-3">
          <label htmlFor="title" class="form-label">
            Post Title
          </label>
          <input
            ref={postTitleElement}
            type="text"
            class="form-control"
            id="title"
            placeholder="What's your title"
          />
        </div>

        <div class="mb-3">
          <label htmlFor="title" class="form-label">
            Post Content
          </label>
          <textarea
            ref={postBodyElement}
            type="text"
            rows={5}
            class="form-control"
            id="title"
            placeholder="Tell us more about it..."
          />
        </div>

        <div class="mb-3">
          <label htmlFor="tags" class="form-label">
            Enter you hashtags here
          </label>
          <input
            ref={tagElement}
            type="text"
            class="form-control"
            id="tags"
            placeholder="Enter you hashtags using space"
          />
        </div>

        <button type="submit" class="btn btn-primary">
          Post
        </button>
      </form>
    </>
  );
};

export default CreatePost;
