package com.farah.couture.repositories;

import com.farah.couture.entities.Variant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VariantRepository extends JpaRepository<Variant, Long> {
    List<Variant> findByProductId(Long productId);
}
