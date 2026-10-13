import React, { useEffect } from 'react'
import { useState } from 'react';
import axios from "axios"
import Footer from './common/Footer';
import auth from '../config/firebase';

function Blogs() {

    const [blogs, setBlogs] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);

            const unsubscribe = auth.onAuthStateChanged((user) => {
            const admin = user?.uid === "NkIM8YtXUmO5c1QPOykCXwUQxL43";
            setIsAdmin(admin);

            if (!user) {
                console.log("User is not logged in");
            } else if (admin) {
                console.log("Admin is logged in");
            } else {
                console.log("User is logged in, but is not admin");
            }
            });

        axios.get("/api/blogs").then((res) => {
            console.log(res.data)
            setBlogs(res.data)
        }).catch(() => {
            console.log("Error fetching data")
        })

        return unsubscribe;
    }, [])



    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');


    const handleLike = async (blog_id) => {
        try {
            const response = await axios.patch(`/api/blogs/like/${blog_id}`);
            // After successfully updating the likes count in the backend, fetch the updated list of blogs
            if (response.status === 200) {
                axios.get("/api/blogs").then((res) => {
                    console.log(res.data)
                    setBlogs(res.data)
                }).catch(() => {
                    console.log("Error fetching data")
                })
            }
        } catch (error) {
            console.error('Error liking the blog post:', error);
        }
    };

    const handleNewBlogSubmit = async (event) => {
        event.preventDefault();
        const today = new Date();
        const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        try {
            const user = auth.currentUser;
            if (!user) {
                setCreateError('Please sign in as the admin to add a blog.');
                return;
            }

            const idToken = await user.getIdToken();
            await axios.post("/api/blogs", {
                newTitle,
                date,
                newContent,
                likes: 0
            }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            const response = await axios.get("/api/blogs");
            setBlogs(response.data);
            setNewTitle('');
            setNewContent('');
            setCreateError('');
        } catch (error) {
            setCreateError(error.response?.data?.message || 'Error creating blog. Please try again.');
        }
    };

    return (
        <div className="blog-section py-14">
            <h2 className="text-center text-5xl font-bold mb-14">Latest  <span className='text-orange-400'>Blogs</span> 📚</h2>

            {/* Blog creation form */}
            {isAdmin && <div className="blog-creation-form mb-8" style={{ width: "80%", margin: "auto" }}>
                <form onSubmit={handleNewBlogSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Blog Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="p-2 border rounded"
                        required
                    />
                    <textarea
                        placeholder="Blog Content"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="p-2 border rounded"
                        rows="4"
                        required
                    />
                    <button type="submit" className="bg-orange-400 text-white p-2 rounded hover:bg-orange-600">
                        Add Blog
                    </button>
                    {createError && <p className="text-red-500" role="alert">{createError}</p>}
                </form>
            </div>}

            <div className="blogs-container grid grid-cols-1 md:grid-cols-2 gap-6 container mx-auto px-4">
                {blogs.map((blog) => (
                    <div key={blog._id} className="blog-post mb-8 p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="blog-title font-semibold text-2xl text-gray-800 mb-3">{blog.newTitle}</h3>
                        <p className="blog-date text-gray-400 text-sm mb-4">{blog.date}</p>
                        <p className="blog-content text-gray-600 mb-4">{blog.newContent}</p>
                        <span className="text-blue-500 cursor-pointer" onClick={() => handleLike(blog._id)}>Like</span>
                        <span className="ml-2">{blog.likes} Likes</span>
                    </div>
                ))}
            </div>

            <Footer/>
        </div>
    );
}

export default Blogs