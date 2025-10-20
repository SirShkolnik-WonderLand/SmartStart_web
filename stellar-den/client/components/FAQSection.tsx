import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What's included in the SmartStart membership?",
      answer: "Your $98.80/month membership includes: Zoho enterprise suite (CRM, Projects, Books, Mail, Cliq), Acronis security & backup, mentorship from Udi Shkolnik and peers, frameworks for funding and ISO compliance, and secure data handling (GDPR + PIPEDA aligned)."
    },
    {
      question: "Who is SmartStart for?",
      answer: "Freelancers, small business owners, startups, and entrepreneurs who want enterprise tools, mentorship, and security without the enterprise price. If you're building or scaling a business and need automation, compliance, and guidance, SmartStart is for you."
    },
    {
      question: "How is WonderLand different from SmartStart?",
      answer: "WonderLand is our community where you can attend events, network, and explore ideas. SmartStart ($98.80/month) gives you access to enterprise tools, mentorship, and security. WonderLand is the playground where ideas are born. SmartStart is the lab where those ideas become real."
    },
    {
      question: "What's the billing and cancellation policy?",
      answer: "SmartStart is $98.80 CAD/month + tax. You can cancel anytime with no long-term commitment. Billing is handled through Zoho Subscriptions. You'll be charged monthly on the same date you first subscribed."
    },
    {
      question: "Do I need to commit long-term?",
      answer: "No. SmartStart is month-to-month with no long-term commitment. You can cancel anytime."
    },
    {
      question: "Can I try SmartStart before committing?",
      answer: "Yes. You can join WonderLand first to explore events, network, and see if our ecosystem is a good fit. When you're ready for enterprise tools and mentorship, you can upgrade to SmartStart."
    },
    {
      question: "What tools do I get access to?",
      answer: "The full Zoho suite (CRM, Projects, Books, Mail, Cliq, Vault), Acronis Cyber Backup for security and data protection, and the SmartStart Hub platform. These tools would cost $500+/month if purchased individually."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use enterprise-grade security with Acronis backup, GDPR + PIPEDA aligned data handling, and security-first baselines. Your data is private and secure. We implement guardrails and documented procedures."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="block text-foreground">Got Questions?</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              We've Got Answers
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground">
            Everything you need to know about SmartStart membership
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-muted/50 transition-colors duration-200"
                  >
                    <span className="font-semibold text-foreground pr-8">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-muted-foreground">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
          >
            <span>Contact Us</span>
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

