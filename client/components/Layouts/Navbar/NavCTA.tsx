import Link from "next/link";

function NavCTA({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group uppercase relative rounded-xl px-5 py-2.5 text-sm md:text-base font-medium transition-all
        ${primary ? "text-white" : "text-white/90"}
      `}
      style={{
        border: "0.5px solid transparent",
        backgroundImage: primary
          ? "linear-gradient(96deg, #E8602E 5%, #340E00 230%), linear-gradient(#ECECEC, #404040)"
          : "linear-gradient(#171212, #100B0B), linear-gradient(#ECECEC, #404040)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-300 group-hover:-translate-y-full">
          {label}
        </span>
        <span className="absolute inset-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          {label}
        </span>
      </span>
    </Link>
  );
}

export default NavCTA;
