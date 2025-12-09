import { useEffect, useRef, useState } from "react";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

export default function MessageInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize the textarea to fit content up to a sensible cap.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  function submit() {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <Textarea
        ref={textareaRef}
        className="flex-1 min-h-[52px] max-h-60 resize-none leading-relaxed"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write gently… (Enter to send, Shift+Enter for new line)"
      />
      <Button className="px-8" onClick={submit}>
        Send
      </Button>
    </div>
  );
}
