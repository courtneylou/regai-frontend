/*

This component is the primary conversation UI for the application

It renders the selected stakeholder's identity (name, role, avatar [initials])
It renders a chronological chat transcript
It handles user input and submission
It displays loading and typing states while the AI responds

*/

// React tools to store data, track elements, and run updates
import { useState, useRef, useEffect } from 'react';

// Defines what a message and a character look like
import { Message, Stakeholder } from '@/types';

// Loads the senior engineer character setup
import { seniorEngineer } from '@/data/scenarios';

// Pre-made UI parts (I used shadcn/ui)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons used in the interface
import { Send, MessageCircleMore } from 'lucide-react';

/* 
getInitials() - generates initials for avatar bubbles
*/
const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/); // Removes trailing whitespace and splits words on spaces

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase(); // If the name only has oen word return only that letter
  }

  return ( // Otherwise return first and last 
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

/*
ChatInterfaceProps - this interface documents what this component expects
 */
interface ChatInterfaceProps {
  stakeholder: Stakeholder | null; // the currently selected persona
  messages: Message[]; // ordered list of chat messages
  onSendMessage: (content: string) => void; // callback to notify parent that user submitted message
  isLoading: boolean; // true while AI is generating a response
}

/*
ChatInterface Component
 */
export const ChatInterface = ({
  stakeholder,
  messages,
  onSendMessage,
  isLoading,
}: ChatInterfaceProps) => {
  /*
   Local State
      - Controlled input state for the message text field
      - This ensures React is the single source of truth
   */
  const [input, setInput] = useState('');

  /*
   DOM References
   */
  const scrollRef = useRef<HTMLDivElement>(null); // Ref to the scollable container - used to scroll to bottom on new messages
  const inputRef = useRef<HTMLInputElement>(null); // Ref to the text input - used to auto focus when stakeholder changes

  /*
   Side Effect: Auto-scroll
      - Chat interface always show the latest message
      - It ensures the user never has to manually scroll
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages]); // Runs every time a message is added

  /*
  Side Effect: Auto-focus
      - When a stakeholder is selected or changed the user should be able to type immediately
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, [stakeholder]);

  /*
  Form Submission Handler
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent empty submissions and double-sends while loading
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  /*
  Persona Classification - senior engineer behaves differently:
      - Different greeting and visual styling
   */
  const isEngineer =
    stakeholder?.id === seniorEngineer.id;

  /*
   * Empty State - rendered when no stakeholder selected
   */
  if (!stakeholder) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center text-3xl">
            <MessageCircleMore className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Select a stakeholder to start interviewing
          </p>
        </div>
      </div>
    );
  }

  /*
  Main Render
   */
  return (
    <div className="flex-1 flex flex-col bg-background">

      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">

          {/* Avatar Bubble */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                isEngineer ? 'bg-accent/20 text-accent' : 'bg-muted'
            }`}
          >
            {getInitials(stakeholder.name)}
          </div>

          {/* Identity */}
          <div>
            <h3 className="font-medium text-foreground">
              {stakeholder.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {stakeholder.role}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4"
      >
        <div className="space-y-4 max-w-3xl mx-auto">

          {/* Initial greeting */}
          {messages.length === 0 && (
            <div className="flex gap-3 animate-slide-up">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  isEngineer ? 'bg-accent/20 text-accent' : 'bg-muted'
                }`}
              >
                {getInitials(stakeholder.name)}
              </div>

              <div
                className={
                  isEngineer
                    ? 'chat-bubble-engineer'
                    : 'chat-bubble-assistant'
                }
              >
                <p className="text-sm">
                  {isEngineer
                    ? "Hi! I'm here to review your requirements list..."
                    : `Hello! I'm ${stakeholder.name}, ${stakeholder.description.toLowerCase()}.`}
                </p>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              {message.role === 'assistant' && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                    isEngineer ? 'bg-accent/20 text-accent' : 'bg-muted'
                  }`}
                >
                  {getInitials(stakeholder.name)}
                </div>
              )}

              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'chat-bubble-user'
                    : isEngineer
                    ? 'chat-bubble-engineer'
                    : 'chat-bubble-assistant'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="chat-bubble-assistant">
                <div className="flex gap-1">
                  <span className="dot" />
                  <span className="dot delay-150" />
                  <span className="dot delay-300" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-card"
      >
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder={
              isEngineer
                ? 'Share your requirements list...'
                : `Ask ${stakeholder.name.split(' ')[0]} a question...`
            }
            disabled={isLoading}
            className="flex-1 h-11"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};