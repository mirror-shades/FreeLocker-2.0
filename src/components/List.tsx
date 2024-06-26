import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function App() {
  // Sample data array
  const accordionData = [
    {
      title: "Locker 1",
      token:"0x",
      lockDate: 1000,
      unlockDate: 2000,
    },
    {
      title: "Locker 2",
      content: "Content for Accordion 2: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
      title: "Locker 3",
      content: "Content for Accordion 3: Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    }
  ];

  return (
    <Accordion>
      {accordionData.map((item, index) => (
        <AccordionItem key={index} aria-label={`Locker ${index + 1}`} title={item.title}>
          {item.content}
        </AccordionItem>
      ))}
    </Accordion>
  );
}