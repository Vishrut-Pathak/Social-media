import React, { createContext, useContext } from 'react'
import { MdDelete } from "react-icons/md";
import { PostList } from './post-list-store';

const Post = ({post}) => {

  const { deletepost } = useContext(PostList)

  return (
    <>
    <div class="card post-card" style={{width: "18rem"}}>
  
  <div class="card-body">
    <h5 class="card-title">{post.title}
      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" onClick={() => (deletepost(post.id))}>
    <MdDelete />
  </span>
    </h5>
    <p class="card-text">{post.body}</p>
    {post.tags.map(tags => <span key={tags} class="badge text-bg-primary hashtags">{tags}</span>)}
    <div className="alert alert-success reactions" role="alert">
 This post has rected by {post.reactions} people.
</div>
  </div>
</div>
    </>
  )
}

export default Post