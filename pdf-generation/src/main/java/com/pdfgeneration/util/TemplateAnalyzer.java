package com.pdfgeneration.util;

import com.pdfgeneration.model.Template;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class TemplateAnalyzer {
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");
    private static final Pattern LOOP_PATTERN = Pattern.compile("\\{\\{#([^}]+)\\}\\}");

    public Map<String, Object> analyzeTemplate(Template template) throws IOException {
        String templateContent = Files.readString(Paths.get(template.getFilePath()));
        Map<String, Object> analysis = new HashMap<>();
        Set<String> variables = new HashSet<>();
        Set<String> loops = new HashSet<>();

        // Find all variables
        Matcher varMatcher = VARIABLE_PATTERN.matcher(templateContent);
        while (varMatcher.find()) {
            String variable = varMatcher.group(1).trim();
            if (!variable.startsWith("#") && !variable.startsWith("/")) {
                variables.add(variable);
            }
        }

        // Find all loops
        Matcher loopMatcher = LOOP_PATTERN.matcher(templateContent);
        while (loopMatcher.find()) {
            String loop = loopMatcher.group(1).trim();
            loops.add(loop);
        }

        // Organize the analysis
        analysis.put("variables", variables);
        analysis.put("loops", loops);

        // Create a sample data structure
        Map<String, Object> sampleData = new HashMap<>();
        for (String variable : variables) {
            sampleData.put(variable, getSampleValue(variable));
        }

        for (String loop : loops) {
            List<Map<String, Object>> loopData = new ArrayList<>();
            Map<String, Object> sampleItem = new HashMap<>();
            sampleItem.put("id", 1);
            sampleItem.put("value", "Sample " + loop + " item");
            loopData.add(sampleItem);
            sampleData.put(loop, loopData);
        }

        analysis.put("sampleData", sampleData);
        return analysis;
    }

    private String getSampleValue(String variable) {
        variable = variable.toLowerCase();
        if (variable.contains("date")) {
            return "2024-03-15";
        } else if (variable.contains("time")) {
            return "14:30:00";
        } else if (variable.contains("amount") || variable.contains("price")) {
            return "1000.00";
        } else if (variable.contains("email")) {
            return "user@example.com";
        } else if (variable.contains("phone")) {
            return "+1-234-567-8900";
        } else if (variable.contains("name")) {
            return "John Doe";
        } else if (variable.contains("address")) {
            return "123 Main St, City, Country";
        } else {
            return "Sample " + variable;
        }
    }
} 