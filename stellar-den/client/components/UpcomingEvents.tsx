import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, UserCircle, Clock, ArrowRight, Beer, GraduationCap, Zap, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ContactModal from "./ContactModal";

export default function UpcomingEvents() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const events = [
    {
      id: "beer-security-12",
      title: "Beer + Security #12",
      type: "Networking Meetup",
      description: "Join us for our monthly Beer + Security meetup! Network with cybersecurity professionals, discuss the latest threats, and share experiences over drinks.",
      date: "Next Month",
      time: "6:00 PM - 9:00 PM",
      location: "Toronto, ON",
      icon: Beer,
      attendees: "40-60",
      status: "upcoming",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "from-amber-500/50 to-orange-500/50"
    },
    {
      id: "launch-learn-ai",
      title: "Launch & Learn: AI Automation",
      type: "Workshop",
      description: "Learn how to implement AI automation in your business. Hands-on workshop covering practical AI tools, workflow automation, and ROI optimization.",
      date: "In 2 Weeks",
      time: "7:00 PM - 9:00 PM",
      location: "Virtual",
      icon: GraduationCap,
      attendees: "30-50",
      status: "upcoming",
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "from-blue-500/50 to-indigo-500/50"
    },
    {
      id: "automation-clinic",
      title: "Automation Clinic",
      type: "Free Consultation",
      description: "Free automation consulting for Ontario SMEs. Bring your business challenges and get expert advice on process automation, workflow optimization, and cost reduction.",
      date: "Next Month",
      time: "10:00 AM - 4:00 PM",
      location: "Ontario-wide",
      icon: Zap,
      attendees: "15-20",
      status: "upcoming",
      color: "from-teal-500/20 to-cyan-500/20",
      borderColor: "from-teal-500/50 to-cyan-500/50"
    },
    {
      id: "founder-roundtable",
      title: "Founder Roundtable",
      type: "Intimate Discussion",
      description: "Intimate discussion group for startup founders. Share challenges, get mentorship, and connect with peers in a supportive environment.",
      date: "Next Month",
      time: "6:00 PM - 8:00 PM",
      location: "Toronto, ON",
      icon: Briefcase,
      attendees: "10-15",
      status: "upcoming",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "from-purple-500/50 to-pink-500/50"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 bg-muted/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            <span>Community Events</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="block text-foreground">Upcoming</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Community Events
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our community for networking, learning, and collaboration. From casual meetups to hands-on workshops, we have something for everyone.
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-all duration-500 group h-full relative overflow-hidden">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Border Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${event.borderColor} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg`} />
                  
                  <CardContent className="p-6 relative z-10">
                    {/* Icon & Type */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-2">
                          {event.type}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserCircle className="w-3 h-3" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => {
                        setSelectedEvent(event.title);
                        setShowContactModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-primary/50 text-primary hover:bg-primary/10"
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate('/community')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Calendar className="mr-2 w-5 h-5" />
            View All Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSelectedEvent("");
        }}
        prefillService="Community Events"
        prefillMessage={selectedEvent ? `I'm interested in learning more about the ${selectedEvent} event. Please send me more information.` : undefined}
      />
    </section>
  );
}

