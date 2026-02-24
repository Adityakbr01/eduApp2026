"use client";

interface LiveStreamChatProps {
  liveId: string;
  chatToken?: string | null;
}

export default function LiveStreamChat({
  liveId,
  chatToken,
}: LiveStreamChatProps) {
  const chatSrc = chatToken
    ? `https://zenstream.chat?liveId=${liveId}&token=${chatToken}`
    : `https://zenstream.chat?liveId=${liveId}`;

  return (
    <div className="w-full h-full bg-black/50 rounded-lg overflow-hidden border border-white/5">
      <iframe
        src={chatSrc}
        frameBorder={0}
        className="w-full h-full border-0"
        title="Live Chat"
      />
    </div>
  );
}
