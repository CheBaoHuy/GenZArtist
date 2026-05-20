package com.kaiju.gamewiki.service;

import com.kaiju.gamewiki.model.Champion;
import com.kaiju.gamewiki.repository.ChampionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChampionService {

    @Autowired
    private ChampionRepository championRepository;

    // Hàm lưu tướng mới hoặc cập nhật tướng
    public Champion saveChampion(Champion champion) {
        return championRepository.save(champion);
    }

    // Lấy danh sách tướng để hiển thị lên web
    public List<Champion> getAllChampions() {
        return championRepository.findAll();
    }
}