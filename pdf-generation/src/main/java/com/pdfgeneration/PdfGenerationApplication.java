package com.pdfgeneration;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.annotations.QuarkusMain;

@QuarkusMain
public class PdfGenerationApplication {
    public static void main(String[] args) {
        Quarkus.run(args);
    }
} 