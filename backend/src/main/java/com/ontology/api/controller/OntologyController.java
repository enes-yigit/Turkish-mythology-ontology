package com.ontology.api.controller;

import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.Lang;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ontology")
@CrossOrigin(origins = "http://localhost:3001")
public class OntologyController {

    private static final Logger logger = LoggerFactory.getLogger(OntologyController.class);
    private final Model model;

    public OntologyController() throws IOException {
        model = ModelFactory.createDefaultModel();
        try {
            InputStream is = new ClassPathResource("ontology.owl").getInputStream();
            RDFDataMgr.read(model, is, Lang.TURTLE);
            logger.info("Ontology file loaded successfully");
        } catch (IOException e) {
            logger.error("Error loading ontology file: ", e);
            throw e;
        }
    }

    @PostMapping("/query")
    public ResponseEntity<?> queryOntology(@RequestBody String queryString) {
        logger.info("Received query: {}", queryString);
        
        try {
            Query query = QueryFactory.create(queryString);
            logger.info("Query parsed successfully");

            try (QueryExecution qexec = QueryExecutionFactory.create(query, model)) {
                ResultSet results = qexec.execSelect();
                logger.info("Query executed successfully");
                
                List<Map<String, Object>> resultList = new ArrayList<>();
                while (results.hasNext()) {
                    QuerySolution solution = results.next();
                    Map<String, Object> row = new HashMap<>();
                    solution.varNames().forEachRemaining(varName -> {
                        if (solution.get(varName) != null) {
                            if (solution.get(varName).isLiteral()) {
                                row.put(varName, solution.getLiteral(varName).getValue());
                            } else {
                                // URI'den son kısmı al (# veya / sonrası)
                                String uri = solution.get(varName).toString();
                                String value = uri.contains("#") ? 
                                    uri.substring(uri.lastIndexOf('#') + 1) : 
                                    uri.substring(uri.lastIndexOf('/') + 1);
                                row.put(varName, value);
                            }
                        }
                    });
                    resultList.add(row);
                }
                
                logger.info("Results processed: {} rows", resultList.size());
                return ResponseEntity.ok(resultList);
            }
        } catch (QueryParseException e) {
            logger.error("Query parse error: ", e);
            return ResponseEntity.badRequest().body("Sorgu ayrıştırma hatası: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: ", e);
            return ResponseEntity.internalServerError().body("Bir hata oluştu: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        try {
            return ResponseEntity.ok("Backend is working and ontology is loaded with " + 
                                   model.size() + " statements");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}