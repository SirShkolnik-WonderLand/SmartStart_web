// Schema Validator - Validates JSON-LD structured data in HTML files
const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.join(__dirname, 'website');

function validateSchemaInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];
    
    // Find all JSON-LD script blocks
    const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let match;
    let schemaCount = 0;
    
    while ((match = schemaRegex.exec(content)) !== null) {
        schemaCount++;
        const jsonContent = match[1].trim();
        
        try {
            JSON.parse(jsonContent);
        } catch (e) {
            errors.push({
                file: filePath,
                schema: schemaCount,
                error: e.message,
                content: jsonContent.substring(0, 100) + '...'
            });
        }
    }
    
    return { schemaCount, errors };
}

function validateAllSchemas() {
    console.log('🔍 Validating JSON-LD schemas...\n');
    
    const htmlFiles = [];
    
    function findHtmlFiles(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                findHtmlFiles(fullPath);
            } else if (file.endsWith('.html')) {
                htmlFiles.push(fullPath);
            }
        }
    }
    
    findHtmlFiles(WEBSITE_DIR);
    
    let totalSchemas = 0;
    let totalErrors = 0;
    const allErrors = [];
    
    for (const file of htmlFiles) {
        const result = validateSchemaInFile(file);
        totalSchemas += result.schemaCount;
        totalErrors += result.errors.length;
        
        if (result.errors.length > 0) {
            allErrors.push(...result.errors);
        }
    }
    
    console.log(`✅ Validated ${totalSchemas} schemas in ${htmlFiles.length} files`);
    
    if (totalErrors > 0) {
        console.log(`\n❌ Found ${totalErrors} errors:\n`);
        allErrors.forEach((err, idx) => {
            console.log(`${idx + 1}. ${path.relative(WEBSITE_DIR, err.file)}`);
            console.log(`   Schema #${err.schema}: ${err.error}`);
            console.log(`   Content: ${err.content}\n`);
        });
        process.exit(1);
    } else {
        console.log('✅ All schemas are valid!\n');
    }
}

validateAllSchemas();