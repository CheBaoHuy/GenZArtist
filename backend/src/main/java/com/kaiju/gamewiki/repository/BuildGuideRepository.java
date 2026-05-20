package com.kaiju.gamewiki.repository;

import com.kaiju.gamewiki.model.Champion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildGuideRepository extends JpaRepository<Champion, Long> {
    // JpaRepository đã có sẵn các hàm: save(), findAll(), findById(), delete()
}