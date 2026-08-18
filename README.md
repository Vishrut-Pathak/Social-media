# Social Media App — Full Working  
## 1. The Big Picture — What This App Actually Is 
This is a small **CRUD-lite** app: you can **view posts** (fetched from `dummyjson.com`) 
and **create new posts** (stored only in local React state — never sent to a real backend). 
There's no routing library — "pages" are simulated by a single state variable (`selectTab`) that 
swaps components in and out. 
### Component tree 
``` 
App 
├── PostListProvider          
│   └── div.app-container 
│       
│       
│           
│           
├── Sidebar            
└── div.content 
├── Header 
(Context + useReducer — the "global store") 
(controls selectTab) 
├── PostList  OR  CreatePost   (conditionally rendered) 
│           
``` 
└── Footer 
Two components read/write the shared store via `useContext(PostList)`: - **PostList.jsx** — reads `postList`, writes via `addIntialPost` - **CreatePost.jsx** — writes via `addPost` - **Post.jsx** — writes via `deletepost` 
Everything else (`Header`, `Footer`, `Sidebar`, `LoadingSpinner`, `Welcomemessege`) is 
presentational — no hooks, no context, just props/JSX. --- 
## 2. The "Global Store" — `post-list-store.jsx` 
This file is doing the job that **Redux** (or Zustand, or Recoil) would normally do, but built from 
scratch using two core React tools: `createContext` + `useReducer`. This pattern is often 
called **"Context + Reducer"** and it's a very common lightweight alternative to Redux. 
### `createContext` 
```js 
export const PostList = createContext({ postList: [], addIntialPost: () => {}, addPost: () => {}, 
deletepost: () => {} }); 
``` 
This creates a **Context object** — think of it as a named "channel" that any nested 
component can tune into with `useContext(PostList)`, without needing props passed down 
manually through every level (this is called **prop drilling**, and Context exists specifically to 
avoid it). 
The object passed to `createContext(...)` is just the **default value** — it's only used if a 
component calls `useContext(PostList)` *without* being wrapped in a `<PostList.Provider>` 
above it. In this app, everything is wrapped, so this default is basically a fallback/documentation 
of the shape, not something that's actually used at runtime. 
### `useReducer` 
```js 
const [postList, dispatchPostList] = useReducer(postListReducer, []); 
``` 
`useReducer` is like `useState`, but for state that changes via **well-defined actions** rather 
than direct `setX(newValue)` calls. It's preferred over `useState` when: - The next state depends on the *type of action*, not just a new value - There are multiple related state transitions (add, delete, initialize) that benefit from being 
handled in one predictable place 
Here, `postList` is the **state**, `dispatchPostList` is the function you call to **trigger a state 
change**, and `postListReducer` is the **pure function** that decides what the new state 
should be, given the current state and an action: 
```js 
const postListReducer = (currPostList, action) => { 
let newPostList = currPostList; 
if (action.type === "DELETE_POST") { 
newPostList = currPostList.filter((post) => post.id !== action.payload.postId); 
} else if (action.type === "ADD_POST") { 
newPostList = [action.payload, ...currPostList]; 
} else if (action.type === "ADD_INITIAL_POST") { 
newPostList = action.payload.posts; 
} 
return newPostList; 
}; 
``` 
Every time `dispatchPostList({ type: ..., payload: ... })` is called anywhere in the app, React re
runs this reducer function with the **current** `postList` and the action, and whatever it 
`return`s becomes the **new** `postList`. React then re-renders every component 
subscribed to this context. 
Three action types exist: 
| Action | What it does | Triggered from | 
|---|---|---| 
| `ADD_POST` | Prepends a new post object to the front of the array | `CreatePost.jsx` submit | 
| `DELETE_POST` | Filters out the post whose `id` matches | `Post.jsx` delete icon click | 
| `ADD_INITIAL_POST` | **Replaces the entire array** with fetched API posts | `PostList.jsx` 
on mount | 
**This is exactly the line that caused your earlier bug** — `ADD_INITIAL_POST` doesn't 
merge, it *replaces*. So any refetch wipes out locally-added posts (this is what Option A works 
around by only fetching when `postList.length === 0`). 
### `PostListProvider` — the wrapper component 
```js 
<PostList.Provider value={{ postList, addIntialPost, addPost, deletepost }}> 
{children} 
</PostList.Provider> 
``` 
This is a component whose only job is to hold the `useReducer` state and hand it (plus the 3 
helper functions that call `dispatch` under the hood) down to `{children}` via Context. In 
`App.jsx`, everything is wrapped inside `<PostListProvider>`, which is why *any* descendant 
component — no matter how deeply nested — can call `useContext(PostList)` and get live 
access to `postList`, `addPost`, `addIntialPost`, `deletepost`. 
**Why 3 wrapper functions instead of calling `dispatchPostList` directly from 
components?** It's an abstraction layer — components like `CreatePost` don't need to know 
the action-type strings or the exact payload shape. They just call `addPost(userId, postTitle, 
postBody, tag)` and the store internally builds the action object (including generating `id: 
Date.now()` and random `reactions`). This keeps action-shape logic in one place. --- 
## 3. `useContext` — How Components "Plug In" 
```js 
const { addPost } = useContext(PostList);       
// CreatePost.jsx 
const { postList, addIntialPost } = useContext(PostListData);  // PostList.jsx 
const { deletepost } = useContext(PostList);     // Post.jsx 
``` 
`useContext(SomeContext)` returns whatever value was passed into the nearest wrapping 
`<SomeContext.Provider value={...}>` above that component in the tree. Here that's always the 
object `{ postList, addIntialPost, addPost, deletepost }` from `PostListProvider`. 
**Key behavior to remember:** whenever the Provider's `value` changes (i.e., whenever 
`postList` updates via a dispatch), **every component consuming that context re-renders** 
— even ones that only destructured `addPost` and never touch `postList` directly (like 
`CreatePost`). This is because the whole `value` object is a new object reference on every 
render of `PostListProvider`. It doesn't cause bugs here since the app is small, but it's a classic 
Context performance gotcha in larger apps (see improvements section). --- 
## 4. `useRef` — Uncontrolled Form in `CreatePost.jsx` 
```js 
const userIdElement = useRef(); 
... 
<input ref={userIdElement} ... /> 
``` 
This is the **uncontrolled component** pattern — the DOM input manages its own value 
internally (like plain HTML), and React just keeps a `.current` pointer to the actual DOM node. 
Contrast with the **controlled component** pattern (`useState` + `value` + `onChange`), 
where React state is the single source of truth for the input's value on every keystroke. 
Why `useRef` here works fine: the form only needs to *read* values once, at submit time: 
```js 
const handleOnSubmit = (event) => { 
event.preventDefault(); 
const userId = userIdElement.current.value;   // read DOM directly 
... 
addPost(userId, postTitle, postBody, tag); 
userIdElement.current.value = "";              
... 
}; 
``` 
// manually clear DOM after submit 
No re-render happens on every keystroke (unlike controlled inputs), which is slightly more 
performant for a simple form, but you lose things like live validation, character counts, or 
disabling the submit button until fields are filled — because React never "knows" the current 
value until you explicitly read `.current.value`. 
**Small pre-existing bug worth noting:** `tagElement.current.value = " ";` resets the tag field 
to a single space, not an empty string like the others (`""`). Minor inconsistency, harmless but 
slightly untidy. 
**Also note:** the bare `Element;` statement right before the `return` in `CreatePost.jsx` 
does nothing — it's a leftover/typo (referencing the global `Element` DOM interface as a no-op 
expression statement). Safe to delete. --- 
## 5. `useState` + `useEffect` — Data Fetching in `PostList.jsx` 
```js 
const [fetching, setFetching] = useState(false); 
useEffect(() => { 
setFetching(true); 
fetch("https://dummyjson.com/posts") 
.then((res) => res.json()) 
.then((data) => { 
addIntialPost(data.posts); 
setFetching(false); 
}); 
}, []); 
``` 
**`useState(false)`** creates one piece of local UI state, `fetching`, purely to control whether 
the spinner shows. This is *local* state (unlike `postList`, which lives in Context) because no 
other component needs to know whether *this* fetch is in progress. 
**`useEffect(callback, [])`** runs the callback **after the component's first render**, and 
— critically — the empty dependency array `[]` means "run this effect once per **mount**," 
not "run this once ever in the app's lifetime." This distinction is exactly what caused your bug: 
switching tabs unmounted `PostList` (React destroyed it), then switching back created a 
**brand-new mount**, so the effect fired again, re-fetched, and `ADD_INITIAL_POST` 
overwrote your local post. 
**Sequence per mount:** 
1. Component renders once with `fetching = false` (initial state) → nothing shown yet, but 
`postList` might already have data from a previous mount. 
2. Effect runs after paint: sets `fetching = true` → re-render shows `LoadingSpinner`. 
3. `fetch` resolves → `addIntialPost(data.posts)` dispatches `ADD_INITIAL_POST` → 
`setFetching(false)` → re-render shows the post list. 
**Conditional rendering logic:** 
```jsx 
{fetching && <LoadingSpinner />} 
{!fetching && postList.length == 0 && <Welcomemessege />} 
<div className="postList"> 
{!fetching && postList.map((post) => <Post key={post.id} post={post}></Post>)} 
</div> 
``` 
Three mutually-aware conditions based on two variables (`fetching`, `postList.length`) — 
classic "loading / empty / data" UI states. --- 
## 6. Local State in `App.jsx` — Tab Switching 
```js 
const [selectTab, setSelectTab] = useState("Home"); 
... 
{selectTab === "Home" ? (<PostList></PostList>) : <CreatePost></CreatePost>} 
``` 
This is the simplest possible "router" — one string in state, and a ternary that swaps which 
component is mounted. `Sidebar` receives `selectTab` and `setSelectTab` as **props** (not 
Context — this one piece of UI state isn't shared widely enough to need Context) and calls 
`setSelectTab("CreatePost")` / `setSelectTab("Home")` on click. 
**This is the direct cause of the remount bug** — because the ternary literally removes one 
component from the React tree and adds the other, rather than just hiding one and showing the 
other. 
--- 
## 7. Full Data Flow, End to End 
**Creating a post:** 
``` 
User types in CreatePost inputs (uncontrolled, useRef) 
→ clicks Post → handleOnSubmit reads ref.current.value for each field 
→ addPost(userId, title, body, tags) [from Context] 
→ dispatchPostList({ type: "ADD_POST", payload: {...} }) 
→ postListReducer prepends new post to array 
→ PostListProvider re-renders with new postList 
→ any component consuming PostList context re-renders 
→ if Home tab is active, PostList.jsx shows the new post immediately 
``` 
**Fetching initial posts:** 
``` 
PostList.jsx mounts 
→ useEffect fires → setFetching(true) → spinner shows 
→ fetch resolves → addIntialPost(posts) [from Context] 
→ dispatchPostList({ type: "ADD_INITIAL_POST", payload: { posts } }) 
→ postListReducer REPLACES postList entirely 
→ setFetching(false) → spinner hides, posts render 
``` 
**Deleting a post:** 
``` 
User clicks delete badge in Post.jsx 
→ deletepost(post.id) [from Context] 
→ dispatchPostList({ type: "DELETE_POST", payload: { postId } }) 
→ postListReducer filters it out 
→ re-render without that post 
``` --- 
## 8. Possible Improvements  
1. **Move the fetch out of `PostList.jsx` into `PostListProvider`** — fetch once when the 
app loads (in the provider), so component mount/unmount cycles from tab-switching never re
trigger it. This is the most "correct" fix for the original bug and a good lesson in *where data
fetching logic should live* relative to *where data is displayed*. 
2. **Add a `try/catch` or `.catch()` to the fetch chain**, and an `error` state, so a failed 
request shows a message instead of an infinite spinner. 
3. **Switch `CreatePost.jsx` to controlled inputs (`useState` per field)** to enable real
time validation (e.g., disable submit until title + body are non-empty). 
4. **Use `crypto.randomUUID()` instead of `Date.now()`** for post IDs to eliminate any 
collision risk. 
5. **Introduce `react-router-dom`** instead of the `selectTab` ternary — this both fixes the 
remount side-effect *and* teaches you proper client-side routing (URLs like `/create-post` 
instead of in-memory tab state), which is a very common real-world upgrade path from this 
exact pattern. 
6. **Split the Context value with `useMemo`** (`value = useMemo(() => ({ postList, addPost, 
... }), [postList])`) to avoid unnecessary re-renders of consumers that don't use `postList`. 
Good intro to Context performance optimization. 
7. **Persist posts to `localStorage`** (or a real backend) so created posts survive a page 
refresh — currently everything lives only in memory and is lost on reload. 
8. **Fix the `class`/`className`, `xlink:href`, and `LoadSpinner`/`LoadingSpinner` 
filename issues** — cheap wins, good habit-building.
