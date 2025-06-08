package com.geopledge.repository;

import com.geopledge.model.Pledge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PledgeRepository extends JpaRepository<Pledge, UUID> {
    List<Pledge> findByUserId(UUID userId);
}
