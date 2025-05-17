package com.pdfgeneration.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.WriterProperties;
import com.itextpdf.kernel.pdf.EncryptionConstants;
import com.itextpdf.forms.PdfAcroForm;
import com.itextpdf.forms.fields.PdfFormField;
import com.pdfgeneration.model.Template;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class PdfService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public byte[] generateFromHtml(Template template, Map<String, Object> data, String password) throws IOException {
        log.info("Generating PDF from HTML template: {}", template.getName());
        // log.debug("Template data: {}", data);

        String content = Files.readString(Paths.get(template.getFilePath()));
        String filledContent = replaceTemplateVariables(content, data);
        
        // Log the filled content for debugging
        // log.debug("Filled template content: {}", filledContent);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        // If password is provided, set up encryption
        if (password != null && !password.isEmpty()) {
            WriterProperties writerProperties = new WriterProperties()
                .setStandardEncryption(
                    password.getBytes(),
                    password.getBytes(), // owner password same as user password
                    EncryptionConstants.ALLOW_PRINTING,
                    EncryptionConstants.ENCRYPTION_AES_128
                );
            PdfWriter writer = new PdfWriter(outputStream, writerProperties);
            PdfDocument pdfDoc = new PdfDocument(writer);
            HtmlConverter.convertToPdf(filledContent, pdfDoc, new ConverterProperties());
            pdfDoc.close();
        } else {
            HtmlConverter.convertToPdf(filledContent, outputStream);
        }
        
        return outputStream.toByteArray();
    }

    public byte[] generateFromPdf(Template template, Map<String, Object> data, String password) throws IOException {
        log.info("Generating PDF from PDF template: {}", template.getName());
        log.debug("Template data: {}", data);

        PdfReader reader = new PdfReader(template.getFilePath());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        // Set up writer with encryption if password is provided
        PdfWriter writer;
        if (password != null && !password.isEmpty()) {
            WriterProperties writerProperties = new WriterProperties()
                .setStandardEncryption(
                    password.getBytes(),
                    password.getBytes(), // owner password same as user password
                    EncryptionConstants.ALLOW_PRINTING,
                    EncryptionConstants.ENCRYPTION_AES_128
                );
            writer = new PdfWriter(outputStream, writerProperties);
        } else {
            writer = new PdfWriter(outputStream);
        }

        PdfDocument pdfDoc = new PdfDocument(reader, writer);
        PdfAcroForm form = PdfAcroForm.getAcroForm(pdfDoc, true);

        for (Map.Entry<String, Object> entry : data.entrySet()) {
            PdfFormField field = form.getField(entry.getKey());
            if (field != null) {
                field.setValue(entry.getValue().toString());
                log.debug("Set field {} to value {}", entry.getKey(), entry.getValue());
            } else {
                log.warn("Field not found in PDF form: {}", entry.getKey());
            }
        }

        pdfDoc.close();
        return outputStream.toByteArray();
    }

    public String saveTemplate(MultipartFile file, Template.TemplateType type) throws IOException {
        createUploadDirectoryIfNotExists();
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());
        return filePath.toString();
    }

    private String replaceTemplateVariables(String content, Map<String, Object> data) {
        StringBuilder result = new StringBuilder(content);
        
        // First handle loops
        Pattern loopPattern = Pattern.compile("\\{\\{#([^}]+)\\}\\}(.*?)\\{\\{/\\1\\}\\}", Pattern.DOTALL);
        Matcher loopMatcher = loopPattern.matcher(result);
        
        while (loopMatcher.find()) {
            String loopName = loopMatcher.group(1);
            String loopContent = loopMatcher.group(2);
            List<Map<String, Object>> items = (List<Map<String, Object>>) data.get(loopName);
            
            StringBuilder loopResult = new StringBuilder();
            if (items != null) {
                for (Map<String, Object> item : items) {
                    String itemContent = loopContent;
                    for (Map.Entry<String, Object> entry : item.entrySet()) {
                        String key = entry.getKey();
                        Object value = entry.getValue();
                        if (value != null) {
                            itemContent = itemContent.replace("{{" + key + "}}", value.toString());
                        }
                    }
                    loopResult.append(itemContent);
                }
            } else {
                log.warn("No data found for loop: {}", loopName);
            }
            
            // Replace the entire loop section with the processed content
            int start = loopMatcher.start();
            int end = loopMatcher.end();
            result.replace(start, end, loopResult.toString());
            
            // Reset the matcher to account for the new content length
            loopMatcher = loopPattern.matcher(result);
        }

        // Then handle simple variables
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!(entry.getValue() instanceof List)) {  // Skip lists as they're handled in loops
                String key = entry.getKey();
                Object value = entry.getValue();
                if (value != null) {
                    String placeholder = "{{" + key + "}}";
                    String replacement = value.toString();
                    int index = result.indexOf(placeholder);
                    while (index != -1) {
                        result.replace(index, index + placeholder.length(), replacement);
                        index = result.indexOf(placeholder, index + replacement.length());
                    }
                }
            }
        }

        // Log any remaining template variables
        Pattern remainingVarPattern = Pattern.compile("\\{\\{([^}]+)\\}\\}");
        Matcher remainingVarMatcher = remainingVarPattern.matcher(result);
        while (remainingVarMatcher.find()) {
            log.warn("Unreplaced template variable found: {}", remainingVarMatcher.group(1));
        }

        return result.toString();
    }

    private void createUploadDirectoryIfNotExists() throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }

    private String generateUniqueFileName(String originalFileName) {
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        return UUID.randomUUID().toString() + extension;
    }
} 