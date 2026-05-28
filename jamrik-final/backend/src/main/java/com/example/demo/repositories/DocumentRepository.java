package com.example.demo.repositories;
import com.example.demo.classes.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document,Long> {
    @Query("SELECT d FROM Document d WHERE d.shipment.referenceNumber = :referenceNumber AND d.documentName = :documentName")
    Optional<Document> findByDocumentName(@Param("referenceNumber") String referenceNumber, @Param("documentName") String documentName);
    @Query("SELECT d FROM Document d WHERE d.shipment.referenceNumber = :referenceNumber")
    List<Document> findByReferenceNumber(@Param("referenceNumber") String referenceNumber);

}
