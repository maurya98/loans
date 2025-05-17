package com.pdfgeneration.controller;

import com.pdfgeneration.model.Template;
import com.pdfgeneration.service.PdfService;
import com.pdfgeneration.repository.TemplateRepository;
import com.pdfgeneration.util.TemplateAnalyzer;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateRepository templateRepository;
    private final PdfService pdfService;
    private final TemplateAnalyzer templateAnalyzer;

    @PostMapping
    public ResponseEntity<Template> uploadTemplate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") Template.TemplateType type) throws IOException {
        
        String filePath = pdfService.saveTemplate(file, type);
        
        Template template = new Template();
        template.setName(file.getOriginalFilename());
        template.setType(type);
        template.setFilePath(filePath);
        
        Template savedTemplate = templateRepository.save(template);
        return ResponseEntity.ok(savedTemplate);
    }

    @GetMapping("/{templateId}/fields")
    public ResponseEntity<Map<String, Object>> getTemplateFields(@PathVariable Long templateId) throws IOException {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        String templateContent = Files.readString(Paths.get(template.getFilePath()));
        Map<String, Object> analysis = templateAnalyzer.analyzeTemplate(templateContent);
        
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/{templateId}/generate")
    public ResponseEntity<Map<String, String>> generatePdf(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> data,
            @RequestParam(required = false) String password) throws IOException {
        
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        byte[] pdfBytes;
        if (template.getType() == Template.TemplateType.HTML) {
            pdfBytes = pdfService.generateFromHtml(template, data, password);
        } else {
            pdfBytes = pdfService.generateFromPdf(template, data, password);
        }

        String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
        Map<String, String> response = new HashMap<>();
        response.put("fileName", "generated-" + System.currentTimeMillis() + ".pdf");
        response.put("contentType", MediaType.APPLICATION_PDF_VALUE);
        response.put("data", base64Pdf);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<Template>> listTemplates() {
        List<Template> templates = templateRepository.findAll();
        return ResponseEntity.ok(templates);
    }
} 