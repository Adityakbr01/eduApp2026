import Image from 'next/image'

function HeroVideoCard() {
  return (
     <div className="relative mt-16 w-full max-w-5xl rounded-xl border border-white/20 backdrop-blur-xl p-5">
        <svg
          width="31"
          height="8"
          viewBox="0 0 31 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-2"
        >
          <path
            d="M0.0859375 3.91468C0.0859375 2.00507 1.63398 0.457031 3.54359 0.457031C5.45319 0.457031 7.00124 2.00507 7.00124 3.91468C7.00124 5.82429 5.45319 7.37233 3.54359 7.37233C1.63398 7.37233 0.0859375 5.82429 0.0859375 3.91468Z"
            fill="#F87171"
          ></path>
          <path
            d="M11.6113 3.91468C11.6113 2.00507 13.1594 0.457031 15.069 0.457031C16.9786 0.457031 18.5266 2.00507 18.5266 3.91468C18.5266 5.82429 16.9786 7.37233 15.069 7.37233C13.1594 7.37233 11.6113 5.82429 11.6113 3.91468Z"
            fill="#FACC15"
          ></path>
          <path
            d="M23.1367 3.91468C23.1367 2.00507 24.6848 0.457031 26.5944 0.457031C28.504 0.457031 30.052 2.00507 30.052 3.91468C30.052 5.82429 28.504 7.37233 26.5944 7.37233C24.6848 7.37233 23.1367 5.82429 23.1367 3.91468Z"
            fill="#4ADE80"
          ></path>
        </svg>
      
        <div className="flex absolute top-1/2 md:top-[60%] -left-1 xs:-left-3 sm:-left-8 md:-left-16 lg:-left-20 items-center text-xs sm:text-sm md:text-lg lg:text-2xl justify-center" style={{ animation: '3s ease-in-out 0s infinite normal none running float' }}>
          <Image
            className="w-24 xs:w-28 sm:w-32 md:w-48 lg:w-60" 
            alt="We understand you illustration" 
            priority 
            width={240} 
            height={240}
            src="https://dfdx9u0psdezh.cloudfront.net/home/hero/57b6a3ee65a9c27fc2ee29c6.webp" 
          />
          <h1 className="absolute flex w-6 xs:w-8 sm:w-10 justify-center -mt-2 xs:-mt-3 sm:-mt-4 md:-mt-5 leading-tight text-[10px] xs:text-xs sm:text-sm md:text-base font-manrope font-medium text-center">We understand you</h1>
        </div>
        <div className="flex absolute text-xs sm:text-sm md:text-lg lg:text-2xl items-center justify-center top-[30%] -right-1 xs:-right-3 sm:-right-8 md:-right-16 lg:-right-20 animate-float" style={{ animation: '3s ease-in-out 0s infinite normal none running float' }}>
          <Image 
            className="w-24 xs:w-28 sm:w-32 md:w-48 lg:w-60 xl:w-65" 
            alt="Build your career illustration" 
            priority 
            width={260} 
            height={260}
            src="https://dfdx9u0psdezh.cloudfront.net/home/hero/e610ce8beaa7a2b72c73dd68.webp" 
          />
          <h1 className="absolute font-medium text-center leading-tight text-[10px] xs:text-xs sm:text-sm md:text-xl lg:text-2xl flex justify-center flex-wrap -mt-2 xs:-mt-3 sm:-mt-5 md:-mt-7">
            Build your
            <span className="font-light w-full -mt-1 text-[9px] xs:text-xs sm:text-sm md:text-lg lg:text-2xl tracking-tight">career</span>
          </h1>
        </div>
        <video
          className="rounded-xl w-full object-cover"
          src="https://dfdx9u0psdezh.cloudfront.net/home/hero/herosection.webm"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
  )
}

export default HeroVideoCard