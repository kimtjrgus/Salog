package com.codemouse.salog.ledger.outgo.repository;

import com.codemouse.salog.ledger.outgo.entity.Outgo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutgoRepository extends JpaRepository<Outgo, Long> {
}
