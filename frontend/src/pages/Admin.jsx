import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newBlog, setNewBlog] = useState({ title: '', imageUrl: '', content: '' });

    const API_URL = "http://localhost:8080/api/blogs";

    // 1. Lấy danh sách blog hiện có
    const fetchBlogs = async () => {
        const res = await axios.get(API_URL);
        setBlogs(res.data);
    };

    useEffect(() => { fetchBlogs(); }, []);

    // 2. Xử lý lưu bài viết mới
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, newBlog);
            setShowPopup(false); // Đóng popup
            setNewBlog({ title: '', imageUrl: '', content: '' }); // Reset form
            fetchBlogs(); // Load lại danh sách
        } catch (err) {
            alert("Lỗi khi lưu bài viết!");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 className="nes-text is-primary">Quản lý Blog Admin</h2>
            
            {/* Nút mở Popup */}
            <button 
                className="nes-btn is-primary" 
                onClick={() => setShowPopup(true)}
                style={{ marginBottom: '20px' }}
            >
                + Thêm bài viết mới
            </button>

            {/* Bảng danh sách bài viết */}
            <div className="nes-table-responsive">
                <table className="nes-table is-bordered is-dark" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tiêu đề</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map(blog => (
                            <tr key={blog.id}>
                                <td>{blog.id}</td>
                                <td>{blog.title}</td>
                                <td>
                                    <button className="nes-btn is-error is-small">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- POPUP (MODAL) --- */}
            {showPopup && (
                <div style={overlayStyle}>
                    <section className="nes-container is-dark with-title" style={popupStyle}>
                        <h3 className="title">Tạo bài viết</h3>
                        <form onSubmit={handleSave}>
                            <div className="nes-field" style={{ marginBottom: '15px' }}>
                                <label>Tiêu đề</label>
                                <input 
                                    type="text" className="nes-input is-dark" 
                                    value={newBlog.title}
                                    onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                                    required 
                                />
                            </div>

                            <div className="nes-field" style={{ marginBottom: '15px' }}>
                                <label>Link ảnh (URL)</label>
                                <input 
                                    type="text" className="nes-input is-dark" 
                                    value={newBlog.imageUrl}
                                    onChange={(e) => setNewBlog({...newBlog, imageUrl: e.target.value})}
                                />
                            </div>

                            <div className="nes-field" style={{ marginBottom: '15px' }}>
                                <label>Nội dung</label>
                                <textarea 
                                    className="nes-textarea is-dark" 
                                    value={newBlog.content}
                                    onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                                    required
                                ></textarea>
                            </div>

                            <menu className="dialog-menu" style={{ textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="nes-btn" onClick={() => setShowPopup(false)}>Hủy</button>
                                <button type="submit" className="nes-btn is-primary">Lưu bài</button>
                            </menu>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
};

// CSS Inline cho Popup
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 1000
};

const popupStyle = {
    width: '90%', maxWidth: '600px', backgroundColor: '#212529'
};

export default AdminBlog;