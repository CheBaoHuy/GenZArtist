import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function Home() {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate(); // Khởi tạo điều hướng
  const [userRole, setUserRole] = useState('user'); // Mặc định là người dùng



  // 1. Gọi API khi trang web tải xong
  useEffect(() => {
    fetch("http://localhost:8080/api/blogs")
      .then((response) => response.json())
      .then((data) => {
        setBlogs(data);
      })
      .catch((error) => console.error("Lỗi fetch bài viết:", error));
  }, []);

  const gettop3Blogs = () => {
    fetch("http://localhost:8080/api/blogs/top3")
      .then((response) => response.json())
      .then((data) => {
        setBlogs(data);
      })
      .catch((error) => console.error("Lỗi fetch bài viết:", error));
  };

  // Hàm xử lý xem chi tiết bằng Popup
  const handleViewDetail = (blog) => {
    Swal.fire({
      title: `<span style="font-family: Arial, sans-serif !important;">${blog.title}</span>`,
      html: `
        <div style="text-align: left; font-family: Arial, sans-serif !important;">
          ${blog.imageUrl ? `<img src="${blog.imageUrl}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;" />` : ''}
          <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
            ${blog.content}
          </div>
        </div>
      `,
      width: '700px',
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#e67e22',
    });
  };


  // Style ép font chuẩn để CHỮ "HẦM" không bị lỗi to nhỏ
  const safeTextStyle = {
    fontFamily: 'Arial, sans-serif !important',
  };

  const editButtonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '5px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    fontFamily: 'Arial, sans-serif'
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bài viết sẽ bị xóa vĩnh viễn!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e67e22',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Xóa ngay!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8080/api/blogs/${id}`, {
          method: 'DELETE',
        })
        .then(res => {
          if (res.ok) {
            Swal.fire('Đã xóa!', 'Bài viết đã được gỡ bỏ.', 'success');
            // Cập nhật lại danh sách blogs trên giao diện mà không cần load lại trang
            setBlogs(blogs.filter(blog => blog.id !== id));
          }
        })
        .catch(err => console.error("Lỗi khi xóa:", err));
      }
    });
  };

 return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h1 style={{ color: 'yellow', fontFamily: 'Arial, sans-serif' }}>Welcome</h1>

      <button 
        onClick={gettop3Blogs}
        style={{ padding: '10px 20px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Get top 3 blogs
      </button>

      <div style={{ marginTop: '30px' }}>
        <h2 style={safeTextStyle}>Danh sách bài viết</h2>
        {blogs.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {blogs.map((blog) => (
              <li 
                key={blog.id} 
                style={{ 
                  marginBottom: '20px', 
                  borderBottom: '1px solid #ccc', 
                  paddingBottom: '20px',
                  maxWidth: '600px',
                  margin: '0 auto 20px auto',
                  textAlign: 'left'
                }}
              >
                <h3 style={safeTextStyle}>{blog.title}</h3>
                {/* Chỉ hiện một đoạn ngắn nội dung ở trang chủ */}
                <p style={{ ...safeTextStyle, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {blog.content}
                </p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  
                  {/* Nút Xem chi tiết: Gọi hàm handleViewDetail thay vì dùng Link chuyển trang */}
                  <button 
                    onClick={() => handleViewDetail(blog)}
                    style={{ ...editButtonStyle, backgroundColor: '#e67e22' }}
                  >
                    Xem chi tiết
                  </button>

                  {/* Nhóm nút quản lý: Chỉ hiện khi là 'user' */}
                  {userRole === 'user' && (
                    <>
                      <button 
                        onClick={() => navigate(`/blog/${blog.id}`)} 
                        style={editButtonStyle}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.id)} 
                        style={{ ...editButtonStyle, backgroundColor: '#e74c3c' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={safeTextStyle}>Đang tải dữ liệu hoặc không có bài viết nào...</p>
        )}
      </div>
    </div>
  );
}
export default Home;