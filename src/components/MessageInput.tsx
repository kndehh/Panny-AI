import { useState } from "react";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

export default function MessageInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  function submit() {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <Textarea
        className="flex-1 h-24 max-h-32 sm:h-12"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write gently…"
      />
      <Button className="px-8" onClick={submit}>
        Send
      </Button>
    </div>
  );
}
