import { rings } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import Image from "next/image";
import React from "react";

function Avatar({ seed, className }: { seed: string; className?: string }) {
  const avatar = createAvatar(rings, {
    seed,
  });
  const svg = avatar.toString();

  const dataUrl = `data:image/svg+xml;base64, ${Buffer.from(svg).toString(
    "base64"
  )}`;
  return (
    <Image
      src={dataUrl}
      height={100}
      width={100}
      alt={seed}
      className={className}
    />
  );
}

export default Avatar;
