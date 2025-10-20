import { useState } from "react";
import { Mic, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AliceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AliceModal({ isOpen, onClose }: AliceModalProps) {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "alice"; content: string }>
  >([
    {
      role: "alice",
      content:
        "Hello! I'm Alice. How can I help you today? Whether you're interested in our ventures, need guidance on automation, or want to discuss security solutions, I'm here to help.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate Alice response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me provide you with more details.",
        "I'd be happy to help. Would you like to know more about any specific venture?",
        "This is an important topic. Our team can provide personalized guidance for your needs.",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { role: "alice", content: randomResponse },
      ]);
    }, 800);
  };

  const handleStartListening = () => {
    setIsListening(true);
    // In a real app, would use Web Speech API
    setTimeout(() => setIsListening(false), 2000);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col h-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Talk to Alice</DialogTitle>
              <DialogDescription>
                Your AI-powered assistant for questions about AliceSolutionsGroup
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-secondary-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Ask me anything..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-primary text-primary-foreground hover:shadow-glow-teal"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleStartListening}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isListening}
          >
            <Mic className="h-4 w-4 mr-2" />
            {isListening ? "Listening..." : "Voice Input"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
