import React from "react";
import { Clock, Lock } from "lucide-react";
import Container from "@/components/mbg-components/Container";

interface ContactItemData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const data: ContactItemData[] = [
  {
    title: "Work hours",
    subtitle: "Mon - Fri : 10:00 AM - 7:00 PM",
    icon: (
      <Clock className="h-4 w-4 text-mbg-white/40 group-hover:text-mbg-green transition-colors hoverEffect" />
    ),
  },
  {
    title: "Secure payment",
    subtitle: "PayPal",
    icon: (
      <Lock className="h-4 w-4 text-mbg-white/40 group-hover:text-mbg-green transition-colors hoverEffect" />
    ),
  },
];

const FooterTop = () => {
  return (
    <Container className="bg-mbg-lightgrey/7  mb-3 mx-0 px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {data?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group hover:bg-mbg-green/30  p-4 transition-colors hoverEffect rounded-xs"
          >
            {item?.icon}
            <h3 className="font-semibold uppercase text-xs group-hover:text-mbg-rgbablank transition-colors hoverEffect">
              {item?.title}
            </h3>
            <div className="text-xs flex group-hover:text-mbg-green transition-colors hoverEffect">
              {item?.subtitle}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

// const ContactItem = () => {
//   return (
//     <div>
//       <p>Hello</p>
//     </div>
//   );
// };

export default FooterTop;
