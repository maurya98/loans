package com.pdfgeneration.util;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TemplateAnalyzer {
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");
    private static final Pattern LOOP_PATTERN = Pattern.compile("\\{\\{#([^}]+)\\}\\}");

    public Map<String, Object> analyzeTemplate(String templateContent) {
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
            List<Map<String, Object>> loopItems = new ArrayList<>();
            Map<String, Object> sampleItem = new HashMap<>();
            // Add some common fields that might be in a loop
            sampleItem.put(loop + "Name", "Sample Item");
            sampleItem.put(loop + "Description", "Sample Description");
            sampleItem.put(loop + "Quantity", 1);
            sampleItem.put(loop + "Price", 0.00);
            loopItems.add(sampleItem);
            sampleData.put(loop, loopItems);
        }

        analysis.put("sampleData", sampleData);
        return analysis;
    }

    private Object getSampleValue(String variable) {
        String lowerVar = variable.toLowerCase();
        if (lowerVar.contains("date")) {
            return "2024-03-15";
        } else if (lowerVar.contains("number")) {
            return "12345";
        } else if (lowerVar.contains("phone")) {
            return "(555) 123-4567";
        } else if (lowerVar.contains("email")) {
            return "example@email.com";
        } else if (lowerVar.contains("amount") || lowerVar.contains("price") || lowerVar.contains("total")) {
            return 0.00;
        } else if (lowerVar.contains("address")) {
            return "123 Sample Street, City, State 12345";
        } else {
            return "Sample " + StringUtils.capitalize(variable);
        }
    }
} 