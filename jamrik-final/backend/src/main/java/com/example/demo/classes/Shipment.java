package com.example.demo.classes;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name="SHIPMENTS", indexes = {@Index(name = "idx_shipment_owner", columnList = "user_id")})
@NoArgsConstructor
public class Shipment {
    @Id
    private String referenceNumber;
    @Column(nullable=false,unique=true)
    private String shipmentName;
    @Column(nullable=false)
    private String status = "Pending";
    @Column(nullable=false, updatable=false)
    @JsonFormat(pattern="yyyy-MM-dd")
    private LocalDate createdDate;
    @JsonIgnore
    @OneToMany(mappedBy="shipment", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<Document> documents=new ArrayList<>();
    @JsonIgnore
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;

    public Shipment(String referenceNumber, String ShipmentName,
                    String Status, LocalDate CreatedDate, User owner) {
        this.referenceNumber=referenceNumber;
        this.shipmentName=ShipmentName;
        this.status=Status;
        this.createdDate=CreatedDate;
        this.owner=owner;
    }
    public void addDocument(Document document) {
        documents.add(document);
        document.setShipment(this);
    }
    public void deleteDocument(Document document){
        documents.remove(document);
        document.setShipment(null);
    }
}