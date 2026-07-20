"use client";

const particles = Array.from({ length: 20 });

export default function ParticleEffect() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-black">

      {particles.map((_, index) => (
        <span
          key={index}
          className="absolute h-2 w-2 animate-pulse rounded-full bg-white opacity-70"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center">

        <h1 className="text-4xl font-bold text-white">
          AI Workspace
        </h1>

      </div>

    </div>
  );
}