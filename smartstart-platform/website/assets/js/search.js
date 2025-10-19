// Simple Client-Side Search Engine for AliceSolutionsGroup
class SearchEngine {
    constructor() {
        this.index = this.buildIndex();
    }
    
    buildIndex() {
        // Simple search index - in production, this would be more comprehensive
        return [
            {
                title: "Cybersecurity & Compliance Services",
                url: "services/cybersecurity-compliance.html",
                description: "CISO-as-a-Service, ISO 27001 readiness, SOC 2 prep, PHIPA/PIPEDA compliance",
                keywords: ["cybersecurity", "security", "ISO 27001", "CISO", "compliance", "SOC 2", "PHIPA", "PIPEDA", "HIPAA", "audit"]
            },
            {
                title: "Automation & AI Services",
                url: "services/automation-ai.html",
                description: "Intelligent RPA, privacy-preserving ML, decision support copilots, BI dashboards",
                keywords: ["automation", "AI", "machine learning", "RPA", "robotic process automation", "business intelligence", "BI", "dashboards"]
            },
            {
                title: "Advisory & Audits",
                url: "services/advisory-audits.html",
                description: "Executive advisory, gap assessments, and pragmatic roadmaps for secure growth",
                keywords: ["advisory", "audits", "gap assessment", "executive", "roadmap", "strategy"]
            },
            {
                title: "Teaching & Training",
                url: "services/teaching-training.html",
                description: "Cybersecurity training, CISSP mentorship, ISO workshops, awareness programs",
                keywords: ["training", "education", "CISSP", "CISM", "workshop", "mentorship", "awareness", "teaching"]
            },
            {
                title: "SmartStart Platform",
                url: "smartstart.html",
                description: "Community hub and venture incubator with Zoho, Acronis, and mentorship programs",
                keywords: ["SmartStart", "platform", "community", "incubator", "venture", "Zoho", "Acronis", "mentorship", "hub"]
            },
            {
                title: "About Udi Shkolnik",
                url: "about.html",
                description: "CISSP, CISM, ISO 27001 Lead Auditor with 15+ years of cybersecurity expertise",
                keywords: ["Udi Shkolnik", "about", "founder", "CISSP", "CISM", "ISO 27001", "CTO", "CISO"]
            },
            {
                title: "Book Free Consultation",
                url: "booking.html",
                description: "Schedule a free 15-minute cybersecurity consultation",
                keywords: ["booking", "consultation", "schedule", "appointment", "meeting", "call"]
            },
            {
                title: "Contact Us",
                url: "contact.html",
                description: "Get in touch with AliceSolutionsGroup",
                keywords: ["contact", "email", "phone", "reach out", "get in touch"]
            },
            {
                title: "Community Programs",
                url: "community/community.html",
                description: "Beer + Security events, Launch & Learn workshops, pro-bono consulting",
                keywords: ["community", "events", "Beer + Security", "workshop", "pro-bono", "programs"]
            },
            {
                title: "Resources",
                url: "resources.html",
                description: "Cybersecurity resources, tools, and free assessments",
                keywords: ["resources", "tools", "assessment", "free", "cyber health check", "Quiestioneer"]
            },
            {
                title: "Toronto Services",
                url: "locations/toronto.html",
                description: "Cybersecurity services in Toronto and the Greater Toronto Area",
                keywords: ["Toronto", "GTA", "location", "services", "Ontario", "Canada"]
            },
            {
                title: "Mississauga Services",
                url: "locations/mississauga.html",
                description: "Cybersecurity services in Mississauga",
                keywords: ["Mississauga", "location", "services", "GTA"]
            },
            {
                title: "Markham Services",
                url: "locations/markham.html",
                description: "Cybersecurity services in Markham",
                keywords: ["Markham", "location", "services", "GTA"]
            },
            {
                title: "Vaughan Services",
                url: "locations/vaughan.html",
                description: "Cybersecurity services in Vaughan",
                keywords: ["Vaughan", "location", "services", "GTA"]
            },
            {
                title: "Brampton Services",
                url: "locations/brampton.html",
                description: "Cybersecurity services in Brampton",
                keywords: ["Brampton", "location", "services", "GTA"]
            },
            {
                title: "Richmond Hill Services",
                url: "locations/richmond-hill.html",
                description: "Cybersecurity services in Richmond Hill",
                keywords: ["Richmond Hill", "location", "services", "GTA"]
            },
            {
                title: "Oakville Services",
                url: "locations/oakville.html",
                description: "Cybersecurity services in Oakville",
                keywords: ["Oakville", "location", "services", "GTA"]
            },
            {
                title: "Burlington Services",
                url: "locations/burlington.html",
                description: "Cybersecurity services in Burlington",
                keywords: ["Burlington", "location", "services", "GTA"]
            },
            {
                title: "Privacy Policy",
                url: "legal/privacy.html",
                description: "AliceSolutionsGroup privacy policy and data protection",
                keywords: ["privacy", "policy", "data protection", "GDPR", "legal"]
            },
            {
                title: "Terms of Service",
                url: "legal/terms.html",
                description: "AliceSolutionsGroup terms of service",
                keywords: ["terms", "service", "legal", "agreement"]
            },
            {
                title: "Disclaimer",
                url: "legal/disclaimer.html",
                description: "AliceSolutionsGroup disclaimer",
                keywords: ["disclaimer", "legal", "liability"]
            }
        ];
    }
    
    search(query) {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return [];
        
        // Score results based on relevance
        const results = this.index.map(item => {
            let score = 0;
            const titleLower = item.title.toLowerCase();
            const descLower = item.description.toLowerCase();
            const keywordsLower = item.keywords.join(' ').toLowerCase();
            
            // Title match (highest weight)
            if (titleLower.includes(searchTerm)) score += 100;
            if (titleLower.startsWith(searchTerm)) score += 50;
            
            // Exact keyword match
            if (keywordsLower.includes(searchTerm)) score += 80;
            
            // Description match
            if (descLower.includes(searchTerm)) score += 30;
            
            // Partial word matches
            const queryWords = searchTerm.split(' ');
            queryWords.forEach(word => {
                if (titleLower.includes(word)) score += 20;
                if (keywordsLower.includes(word)) score += 15;
                if (descLower.includes(word)) score += 10;
            });
            
            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
        
        return results;
    }
    
    displayResults(results, searchTerm) {
        const resultsContainer = document.getElementById('results-container');
        const popularSearches = document.getElementById('popular-searches');
        const searchResults = document.getElementById('search-results');
        const searchTermDisplay = document.getElementById('search-term-display');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 3rem; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">
                        No Results Found
                    </h3>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                        We couldn't find any pages matching "<strong>${searchTerm}</strong>". Try different keywords or browse our popular pages.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="services.html" class="cta-button primary" style="padding: 1rem 2rem; text-decoration: none;">
                            Browse Services
                        </a>
                        <a href="contact.html" class="cta-button secondary" style="padding: 1rem 2rem; text-decoration: none;">
                            Contact Us
                        </a>
                    </div>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = results.map(result => `
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; transition: all 0.3s ease; cursor: pointer;" 
                     onclick="window.location.href='${result.url}'"
                     onmouseover="this.style.borderColor='var(--accent-primary)'; this.style.transform='translateY(-2px)'"
                     onmouseout="this.style.borderColor='var(--glass-border)'; this.style.transform='translateY(0)'">
                    <h3 style="font-size: 1.3rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
                        <a href="${result.url}" style="color: var(--text-primary); text-decoration: none;">
                            ${this.highlightTerm(result.title, searchTerm)}
                        </a>
                    </h3>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                        ${this.highlightTerm(result.description, searchTerm)}
                    </p>
                    <a href="${result.url}" style="color: var(--accent-primary); text-decoration: none; font-weight: 500;">
                        ${result.url} →
                    </a>
                </div>
            `).join('');
        }
        
        searchTermDisplay.textContent = searchTerm;
        searchResults.style.display = 'block';
        popularSearches.style.display = 'none';
        
        // Scroll to results
        searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    highlightTerm(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark style="background: rgba(59, 130, 246, 0.3); color: var(--text-primary); padding: 0.1em 0.2em; border-radius: 3px;">$1</mark>');
    }
}

// Initialize search engine
window.searchEngine = new SearchEngine();

// Global search function
window.performSearch = function() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        const results = window.searchEngine.search(searchTerm);
        window.searchEngine.displayResults(results, searchTerm);
        
        // Track search analytics
        if (window.analyticsTracker) {
            window.analyticsTracker.trackEvent('search', {
                query: searchTerm,
                resultsCount: results.length,
                timestamp: new Date().toISOString()
            });
        }
        
        // Update URL without reloading
        window.history.pushState({}, '', `?q=${encodeURIComponent(searchTerm)}`);
    }
};

