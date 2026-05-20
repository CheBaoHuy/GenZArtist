package com.kaiju.gamewiki.service;

import com.kaiju.gamewiki.model.Blog;
import com.kaiju.gamewiki.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BlogService {
    @Autowired
    private BlogRepository blogRepository;

    public Blog saveBlog(Blog blog) {
        blogRepository.save(blog);
        return blog;
    }

    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public Blog getBlogById(Long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài blog"));
    }

    public Blog updateBlog(Long id, Blog blogDetails) {
        Blog blog = blogRepository.findById(id).orElse(null);
        if (blog != null) {
            blog.setTitle(blogDetails.getTitle());
            blog.setImageUrl(blogDetails.getImageUrl());
            blog.setContent(blogDetails.getContent());
            return blogRepository.save(blog);
        }
        return null;
    }

    public void deleteBlog(Long id) {
        blogRepository.deleteById(id);
    }

    public List<Blog> gettop3Blogs() {
        return blogRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId())) // Sắp xếp ID giảm dần
                .limit(3)
                .toList();
    }
}