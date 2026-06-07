package com.example.demo.classes;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="DOCUMENTS")
@NoArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String documentName;
    @Column(nullable=false)
    private String documentType;
    private String documentUrl;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "shipment_referenceNumber", referencedColumnName = "referenceNumber")
    @JsonIgnore
    private Shipment shipment;
    @JsonIgnore
    @Column(columnDefinition="TEXT")
    private String content;
    
    private String contentType;

    private String documentPublicId;
    public Document(String documentName, String documentType, Shipment shipment) {
        this.documentName=documentName;
        this.documentType=documentType;
        this.shipment=shipment;
    }
}