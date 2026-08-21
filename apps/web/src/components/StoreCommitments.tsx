type Commitment = {
  text: string;
  icon: "box" | "shield" | "wrench";
};

const COMMITMENTS: Commitment[] = [
  { text: "Giao hàng chính hãng và đúng như mô tả", icon: "box" },
  { text: "Bảo hành uy tín - đầy đủ phụ tùng thay thế", icon: "shield" },
  { text: "Hỗ trợ lắp đặt - hướng dẫn tận tâm", icon: "wrench" },
];

export function StoreCommitments() {
  return (
    <section
      aria-labelledby="commitments-heading"
      className="min-w-0 rounded-lg border border-gray-200 bg-brand-soft/60 p-4"
    >
      <h2
        id="commitments-heading"
        className="mb-2.5 text-sm font-extrabold tracking-wide text-brand"
      >
        Điện máy Lộc Phát Đạt cam kết
      </h2>
      <ul className="min-w-0 space-y-2.5">
        {COMMITMENTS.map((item) => (
          <li key={item.icon} className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-call-dark">
              <CommitmentIcon name={item.icon} />
            </span>
            <span className="min-w-0 break-words text-[13px] font-medium leading-snug text-gray-800">
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommitmentIcon({ name }: { name: Commitment["icon"] }) {
  const shared = {
    className: "h-4 w-4",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "box") {
    return (
      <svg {...shared}>
        <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z" />
        <path d="M3 8.5 12 13l9-4.5M12 13v7" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...shared}>
        <path d="M12 3.5 5 6v5.5c0 4 3 7.3 7 8.5 4-1.2 7-4.5 7-8.5V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path d="M15.5 3.5a4.5 4.5 0 0 0-3.9 6.8L4 17.9 6.1 20l7.6-7.6a4.5 4.5 0 0 0 5.6-6l-2.6 2.6-2.2-2.2 2.6-2.6a4.5 4.5 0 0 0-1.6-.7z" />
    </svg>
  );
}
