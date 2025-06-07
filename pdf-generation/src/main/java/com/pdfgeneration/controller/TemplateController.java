package com.pdfgeneration.controller;

import com.pdfgeneration.model.Template;
import com.pdfgeneration.service.PdfService;
import com.pdfgeneration.repository.TemplateRepository;
import com.pdfgeneration.util.TemplateAnalyzer;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import jakarta.ws.rs.FormParam;
import jakarta.transaction.Transactional;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Path("/api/templates")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TemplateController {

    @Inject
    TemplateRepository templateRepository;

    @Inject
    PdfService pdfService;

    @Inject
    TemplateAnalyzer templateAnalyzer;

    public static class TemplateUploadForm {
        @FormParam("file")
        public File file;

        @FormParam("fileName")
        public String fileName;

        @FormParam("type")
        public Template.TemplateType type;
    }

    @POST
    @Transactional
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadTemplate(MultipartFormDataInput input) throws IOException {
        Map<String, List<InputPart>> uploadForm = input.getFormDataMap();
        List<InputPart> inputParts = uploadForm.get("file");
        
        if (inputParts == null || inputParts.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "File content cannot be empty"))
                    .build();
        }

        String fileName = uploadForm.get("fileName").get(0).getBodyAsString();
        Template.TemplateType type = Template.TemplateType.valueOf(uploadForm.get("type").get(0).getBodyAsString());
        
        Template template = new Template();
        template.setName(fileName);
        template.setType(type);
        
        byte[] fileContent = inputParts.get(0).getBody(byte[].class, null);
        String filePath = pdfService.saveTemplate(fileContent, fileName, type);
        template.setFilePath(filePath);
        
        templateRepository.persist(template);
        return Response.ok(template).build();
    }

    @GET
    @Path("/{templateId}/fields")
    public Response getTemplateFields(@PathParam("templateId") Long templateId) throws IOException {
        Template template = templateRepository.findById(templateId);
        if (template == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Template not found"))
                    .build();
        }

        Map<String, Object> analysis = templateAnalyzer.analyzeTemplate(template);
        return Response.ok(analysis).build();
    }

    @POST
    @Path("/{templateId}/generate")
    public Response generatePdf(
            @PathParam("templateId") Long templateId,
            @QueryParam("password") String password,
            Map<String, Object> data) throws IOException {
        
        Template template = templateRepository.findById(templateId);
        if (template == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Template not found"))
                    .build();
        }

        byte[] pdfBytes;
        if (template.getType() == Template.TemplateType.HTML) {
            pdfBytes = pdfService.generateFromHtml(template, data, password);
        } else {
            pdfBytes = pdfService.generateFromPdf(template, data, password);
        }

        String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
        Map<String, String> response = new HashMap<>();
        response.put("fileName", "generated-" + System.currentTimeMillis() + ".pdf");
        response.put("contentType", "application/pdf");
        response.put("data", base64Pdf);

        return Response.ok(response).build();
    }

    @GET
    public Response listTemplates() {
        List<Template> templates = templateRepository.listAll();
        return Response.ok(templates).build();
    }
}