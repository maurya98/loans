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
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@ApplicationScoped
public class PdfService {

    @ConfigProperty(name = "quarkus.http.body.uploads-directory", defaultValue = "uploads")
    String uploadDir;

    public byte[] generateFromHtml(Template template, Map<String, Object> data, String password) throws IOException {
        log.info("Generating PDF from HTML template: {}", template.getName());

        String content = Files.readString(Paths.get(template.getFilePath()));
        String filledContent = replaceTemplateVariables(content, data);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        if (password != null && !password.isEmpty()) {
            WriterProperties writerProperties = new WriterProperties()
                .setStandardEncryption(
                    password.getBytes(),
                    password.getBytes(),
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

        PdfReader reader = new PdfReader(template.getFilePath());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        PdfWriter writer;
        if (password != null && !password.isEmpty()) {
            WriterProperties writerProperties = new WriterProperties()
                .setStandardEncryption(
                    password.getBytes(),
                    password.getBytes(),
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

    public String saveTemplate(byte[] fileContent, String fileName, Template.TemplateType type) throws IOException {
        if (fileContent == null || fileContent.length == 0) {
            throw new IllegalArgumentException("File content cannot be empty");
        }
        
        createUploadDirectoryIfNotExists();
        String uniqueFileName = generateUniqueFileName(fileName);
        Path filePath = Paths.get(uploadDir, uniqueFileName);
        Files.write(filePath, fileContent);
        return filePath.toString();
    }

    private String replaceTemplateVariables(String content, Map<String, Object> data) {
        StringBuilder result = new StringBuilder(content);
        
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
            
            int start = loopMatcher.start();
            int end = loopMatcher.end();
            result.replace(start, end, loopResult.toString());
            
            loopMatcher = loopPattern.matcher(result);
        }

        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!(entry.getValue() instanceof List)) {
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
        String extension = originalFileName != null && originalFileName.contains(".") 
            ? originalFileName.substring(originalFileName.lastIndexOf("."))
            : ".pdf";
        return UUID.randomUUID().toString() + extension;
    }
} 