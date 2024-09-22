import { useState,useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosts, deletePost, updatePost } from "./api";
import { PostDetail } from "./PostDetail";
const maxPostPage = 10;

export function Posts() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn:(postId) => updatePost(postId)
  })

  const deleteMutation = useMutation({
    mutationFn:(postId)=> deletePost(postId)
  });
  const {error,isLoading,isError,data} = useQuery({
    staleTime:2000,
    queryKey:['posts',currentPage],
    queryFn: ()=>fetchPosts(currentPage)
  });

  useEffect(()=>{
    if(currentPage <maxPostPage){
        const nextPage = currentPage + 1;
        queryClient.prefetchQuery({
            queryKey:['posts', nextPage],
            queryFn: ()=>fetchPosts(nextPage)
        })
    }
  },[currentPage,queryClient]);

  if(isLoading) return <h3>Loading</h3>;
  if(isError) return <h3>{error.message}</h3>
  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() =>{
                deleteMutation.reset();
                updateMutation.reset();
                setSelectedPost(post)}
            }
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
        disabled = {currentPage <=1}
        onClick={() => setCurrentPage(currentPage - 1)}>
          Previous page
        </button>
        <span>Page {currentPage + 1}</span>
        <button
        disabled={currentPage >= maxPostPage}
        onClick={() => setCurrentPage(currentPage + 1)}>
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} deleteMutation={deleteMutation} updateMutation={updateMutation} />}
    </>
  );
}
