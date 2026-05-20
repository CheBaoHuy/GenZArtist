package com.kaiju.gamewiki.controller;

import com.kaiju.gamewiki.model.Blog;
import com.kaiju.gamewiki.model.Champion;
import com.kaiju.gamewiki.service.BlogService;
import com.kaiju.gamewiki.service.ChampionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ChampionService championService;
    @Autowired
    private BlogService blogService;

    @GetMapping("/add")
    public String showForm() {
        return "add-champion"; // Trỏ đến file html ở trên
    }

    @PostMapping("/save")
    public String saveChampion(@ModelAttribute Champion champion) {
        championService.saveChampion(champion);
        return "redirect:/admin/add"; // Lưu xong quay lại trang nhập tiếp
    }

    // Đường dẫn để vào trang NHẬP blog: http://localhost:8080/admin/blog/add
    @GetMapping("/blog/add")
    public String showBlogForm() {
        return "add-blog";
    }

    // Đường dẫn để XEM danh sách blog: http://localhost:8080/admin/blog/list
    @GetMapping("/blog/list")
    public String listBlogs(Model model) {
        model.addAttribute("blogs", blogService.getAllBlogs());
        return "list-blog";
    }

    @PostMapping("/blog/save")
    public String saveBlog(@ModelAttribute Blog blog) {
        blogService.saveBlog(blog);
        return "redirect:/admin/blog/list";
    }
}