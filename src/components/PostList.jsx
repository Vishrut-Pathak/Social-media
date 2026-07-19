import React from 'react'
import Post from './Post'
import { useContext } from 'react'
import { PostList as PostListData } from './post-list-store'

const PostList = () => {
 const {postList} = useContext(PostListData)
  return (
    <>
    
    {postList.map((post) => (<Post key={post.id} post={post}></Post>))}
    
    </>
  )
}

export default PostList