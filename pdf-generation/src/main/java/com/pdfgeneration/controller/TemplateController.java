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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<ByteArrayResource> generatePdf(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> data) throws IOException {
        
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        byte[] pdfBytes;
        if (template.getType() == Template.TemplateType.HTML) {
            pdfBytes = pdfService.generateFromHtml(template, data);
        } else {
            pdfBytes = pdfService.generateFromPdf(template, data);
        }

        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=generated-" + System.currentTimeMillis() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    @GetMapping
    public ResponseEntity<List<Template>> listTemplates() {
        List<Template> templates = templateRepository.findAll();
        return ResponseEntity.ok(templates);
    }
} 