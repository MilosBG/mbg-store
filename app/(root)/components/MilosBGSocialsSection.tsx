import Image from "next/image";
import { MBGPeriwinkle } from "@/images";

const MilosBGSocialsSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="relative aspect-[3/1] w-full">
        <Image
          src={MBGPeriwinkle}
          alt="Milos BG Periwinkle"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
};

export default MilosBGSocialsSection;