import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-poppins">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        
        {/* Logo */}
        <div className="mb-6">
          <img 
            src="/assets/logo/mapuone_logo.png" 
            alt="MapuOne Logo" 
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
          />
        </div>

        {/* Huge Title */}
        <h1 className="text-[4rem] sm:text-[6rem] md:text-[8rem] font-black text-black tracking-[5%] mb-4 leading-none">
          404
        </h1>
        
        {/* Subtitle / Description */}
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 uppercase">
          Page Not Found
        </h2>
        
        <p className="text-black font-medium max-w-md mb-8 text-sm sm:text-base leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Action Button */}
        <Link 
          href="/" 
          className="bg-[#2D2D2D] hover:bg-black text-white font-medium py-3 px-10 rounded-lg transition-colors text-sm uppercase"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
