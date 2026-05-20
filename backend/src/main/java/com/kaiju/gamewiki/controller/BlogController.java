package com.kaiju.gamewiki.controller;

import com.kaiju.gamewiki.model.Blog;
import com.kaiju.gamewiki.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Trả về JSON
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*") // Cho phép CORS từ frontend

public class BlogController {

    @Autowired
    private BlogService blogService;

    @PostMapping
    public Blog create(@RequestBody Blog blog) {
        return blogService.saveBlog(blog);
    }

    @GetMapping("/{id}")
    public Blog getById(@PathVariable Long id) {
        return blogService.getBlogById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public Blog update(@PathVariable Long id, @RequestBody Blog blogDetails) {
        return blogService.updateBlog(id, blogDetails);
    }

    @GetMapping
    public List<Blog> getAll() {
        return blogService.getAllBlogs();
    }

    @GetMapping("/top3")
    public List<Blog> getTop3() {
        return blogService.gettop3Blogs();
    }
}