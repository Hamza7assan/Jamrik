package com.example.demo.services;

import com.example.demo.DTOs.ShipmentDTO;
import com.example.demo.classes.Document;
import com.example.demo.classes.Shipment;
import com.example.demo.classes.User;
import com.example.demo.repositories.DocumentRepository;
import com.example.demo.repositories.JamrikRepository;
import com.example.demo.repositories.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.DTOs.DocumentResponseDTO;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ShipmentService {
    //created a new bean from the shipment's repo interface
    private final ShipmentRepository shipmentRepo;
    private final JamrikRepository jamrikRepo;
    private final DocumentRepository documentRepo;
    //autowire via constructor injection
    public ShipmentService(ShipmentRepository shipmentRepo,
                           JamrikRepository jamrikRepo,DocumentRepository documentRepo) {
        this.shipmentRepo=shipmentRepo;
        this.jamrikRepo=jamrikRepo;
        this.documentRepo=documentRepo;
    }
    //check the database for the shipment first
    public boolean shipmentExists(ShipmentDTO sDTO){
        return shipmentRepo.findByReferenceNumber(sDTO.referenceNumber()).isPresent();
    }
    //create a new shipment and store it in the DB, iff it doesn't exist in it
 public Shipment createNewShipment(ShipmentDTO sDTO,String userName){
        User user=jamrikRepo.findByUserName(userName)
                .orElseThrow(()->new RuntimeException("User not found"));
        if(shipmentExists(sDTO)){
            throw new RuntimeException("Shipment already exists");
        }
        //assign the new shipment object the attributes from the dto received
        Shipment shipment=new Shipment();
        shipment.setShipmentName(sDTO.shipmentName());
        shipment.setReferenceNumber(sDTO.referenceNumber());
        shipment.setCreatedDate(LocalDate.now());
        shipment.setStatus(sDTO.status() != null ? sDTO.status() : "Pending");
        //the shipment user is the user in the current session, set attribute
        shipment.setOwner(user);
        //save the new shipment in the DB
        return shipmentRepo.save(shipment);
    }
    public Shipment setShipmentStatus(String referenceNumber,String status){
         Shipment shipment=shipmentRepo.findByReferenceNumber(referenceNumber)
                 .orElseThrow(()->new RuntimeException("Shipment not found"));
        shipment.setStatus(status);
        return shipmentRepo.save(shipment);
    }
    //search for any shipment that is in the db
    public Optional<Shipment> search(String referenceNumber){
        return shipmentRepo.findByReferenceNumber(referenceNumber);
    }
    //delete shipments using the reference number i.e, the id
    public Shipment delete(String referenceNumber) {
        Shipment shipment = shipmentRepo.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        shipmentRepo.delete(shipment);
        return shipment;
    }
    //search all shipments for a user
    public List<Shipment> searchAll(){
        return shipmentRepo.findAll();
    }
    //search all shipments for a specific user by username
    public List<Shipment> searchAllByUser(String userName){
        return shipmentRepo.findByOwnerUserName(userName);
    }
    //search all docs for a givin shipment
    @Transactional(readOnly = true)
    public List<Document> searchDocs(String referenceNumber){
        return documentRepo.findByReferenceNumber(referenceNumber);
    }

    //search all docs metadata to prevent Lob stream errors in the frontend
    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> searchDocsMetadata(String referenceNumber){
        return documentRepo.findByReferenceNumber(referenceNumber)
                .stream()
                .map(doc -> new DocumentResponseDTO(doc.getId(), doc.getDocumentName(), doc.getDocumentType(), doc.getContentType()))
                .collect(Collectors.toList());
    }

}