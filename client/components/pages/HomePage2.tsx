import HeroSection from "./HeroSection";

export default function HomePage2() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full -z-10 overflow-hidden">
        
        {/* Mobile */}
        <img
          src="https://dfdx9u0psdezh.cloudfront.net/common/Background_mobile.svg"
          alt="Background mobile"
          className="
            block md:hidden
            w-full
            h-[85vh]
            object-center
            brightness-150
            scale-150
          "
        />

        {/* Desktop */}
        <img
          src="https://dfdx9u0psdezh.cloudfront.net/common/Background.svg"
          alt="Background desktop"
          sizes="(min-width: 768px) 100vw"
          className="
            hidden md:block
            object-cover
            object-[60%_60%]
            brightness-110
            scale-110
          "
        />
      </div>

      <HeroSection />
    </main>
  );
}
