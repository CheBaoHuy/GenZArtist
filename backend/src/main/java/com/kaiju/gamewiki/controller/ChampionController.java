package com.kaiju.gamewiki.controller;

import com.kaiju.gamewiki.model.Champion;
import com.kaiju.gamewiki.service.ChampionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/champions")
public class ChampionController {

    @Autowired
    private ChampionService championService;

    // Lấy danh sách tất cả tướng: GET http://localhost:8080/api/champions
    @GetMapping
    public List<Champion> getAll() {
        return championService.getAllChampions();
    }

    // Thêm một tướng mới: POST http://localhost:8080/api/champions
    @PostMapping
    public Champion addChampion(@RequestBody Champion champion) {
        return championService.saveChampion(champion);
    }
}