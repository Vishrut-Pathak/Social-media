import React, { useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import "./App.css"
import CreatePost from './components/CreatePost'
import PostList from './components/PostList'
import PostListProvider from './components/post-list-store'


const App = () => {

const [selectTab, setSelectTab] = useState("Home");

  return (
    <>
    <PostListProvider>
    <div className="app-container">
    <Sidebar selectTab={selectTab} setSelectTab={setSelectTab}></Sidebar>
    <div className='content'>
      <Header></Header>
      {selectTab === "Home" ? (<PostList></PostList>) : <CreatePost></CreatePost> }
      
      <Footer></Footer>
    </div>
    
    </div>
    </PostListProvider>
    </>
  );
}

export default App