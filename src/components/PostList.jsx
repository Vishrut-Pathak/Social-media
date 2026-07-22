import React from 'react'
import Post from './Post'
import { useContext } from 'react'
import { PostList as PostListData } from './post-list-store'
import Welcomemessege from './Welcomemessege'

const PostList = () => {
 const {postList} = useContext(PostListData)
 const handleGetPostClick = () => {
  console.log('it is working')
 }

  return (
    <>
    {postList.length == 0 && <Welcomemessege onGetPostClick = {handleGetPostClick} />}
    <div className='postList'>
    {postList.map((post) => (<Post key={post.id} post={post}></Post>))}
    </div>
    </>
  )
}

export default PostList