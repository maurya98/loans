package com.pdfgeneration.repository;

import com.pdfgeneration.model.Template;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TemplateRepository implements PanacheRepository<Template> {
} 