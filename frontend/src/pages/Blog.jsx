// src/pages/AddBlog.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Blog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    content: ''
  });

  // State bổ sung để quản lý file ảnh người dùng chọn
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetch(`http://localhost:8080/api/blogs/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData(data);
          setPreview(data.imageUrl); // Hiển thị ảnh cũ khi edit
        })
        .catch(err => console.error(err));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý khi chọn file từ máy tính
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Tạo link xem trước tạm thời
    }
  };

  const handleSave = async () => {
    // check valid
    if (!formData.title || !formData.content) {
      Swal.fire({ icon: 'warning', title: 'Thiếu thông tin!', text: 'Vui lòng nhập tiêu đề và nội dung' });
      return;
    }

    let finalImageUrl = formData.imageUrl;

    // --- BƯỚC 1: TẢI ẢNH LÊN CLOUDINARY NẾU CÓ FILE MỚI ---
    if (selectedFile) {
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("upload_preset", "ml_default"); // THAY TÊN PRESET VÀO ĐÂY
      data.append("cloud_name", "dgdn1g9w6");     // THAY CLOUD NAME VÀO ĐÂY

      try {
        const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dgdn1g9w6/image/upload", {
          method: "POST",
          body: data,
        });
        const cloudData = await cloudRes.json();
        finalImageUrl = cloudData.secure_url; // Lấy URL ảnh đã upload thành công
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Lỗi upload ảnh!' });
        return;
      }
    }

    // --- BƯỚC 2: GỬI DATA VỀ SPRING BOOT ---
    const url = isEditMode ? `http://localhost:8080/api/blogs/${id}` : "http://localhost:8080/api/blogs";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrl: finalImageUrl }), // Gửi URL ảnh mới
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Cập nhật thành công!' : 'Đăng bài thành công!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        navigate("/");
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Lỗi kết nối Server!' });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      {/* Hiển thị tiêu đề động dựa trên chế độ */}
      <h2 style={{ fontFamily: 'Arial, sans-serif' }}>
        {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết hướng dẫn mới"}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          style={inputStyle} 
          type="text" 
          name="title"
          placeholder="Tiêu đề bài viết..." 
          value={formData.title}
          onChange={handleChange}
        />
        <input 
          style={inputStyle} 
          type="file" 
          accept="image/*" // Chỉ cho phép chọn ảnh
          onChange={handleFileChange} // Sử dụng hàm handleFileChange bạn đã viết ở trên
        />

        {/* Thêm phần hiển thị ảnh xem trước bên dưới để người dùng biết đã chọn được ảnh */}
        {preview && (
          <div style={{ marginTop: '10px' }}>
            <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
          </div>
        )}
        <textarea 
          style={{ ...inputStyle, height: '200px', lineHeight: '1.5' }} 
          name="content"
          placeholder="Nội dung chi tiết (Gõ chữ 'hầm' để test font)..." 
          value={formData.content}
          onChange={handleChange}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={buttonStyle} onClick={handleSave}>
            {isEditMode ? "Cập nhật bài viết" : "Đăng bài ngay"}
          </button>
          
          <button 
            style={{ ...buttonStyle, background: '#95a5a6' }} 
            onClick={() => navigate("/")}
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}

// --- CSS Objects (Giữ nguyên các chỉnh sửa chống lỗi font chữ "ầ") ---
const inputStyle = { 
  width: '100%',
  padding: '12px', 
  borderRadius: '5px', 
  border: '1px solid #ccc', 
  fontSize: '16px', 
  outline: 'none',
  fontFamily: 'Arial, "Segoe UI", Roboto, sans-serif !important',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  color: '#000'
};

const buttonStyle = { 
  flex: 1,
  padding: '15px', 
  background: '#e67e22', 
  color: 'white', 
  border: 'none', 
  borderRadius: '5px', 
  fontSize: '18px', 
  cursor: 'pointer',
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  boxSizing: 'border-box'
};